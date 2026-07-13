<?php

namespace App\Controller;

use App\Entity\SharedFile;
use App\Entity\User;
use App\Exception\File\FileTooLargeException;
use App\Exception\File\FileUploadException;
use App\Exception\File\ForbiddenFileTypeException;
use App\Repository\SharedFileRepository;
use App\Service\File\FileDeleteService;
use App\Service\File\FileUploadService;
use App\Service\File\LocalFileStorage;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/files', name: 'api_files_')]
final class FileController extends AbstractController
{
    public function __construct(
        private readonly LoggerInterface $logger,
    ) {
    }

    #[Route(name: 'list', methods: ['GET'])]
    public function list(
        SharedFileRepository $sharedFileRepository,
        #[CurrentUser] User $user,
    ): JsonResponse {
        $sharedFiles = $sharedFileRepository->findByOwnerOrderedByCreationDate($user);

        return $this->json(array_map(
            fn (SharedFile $sharedFile): array => $this->sharedFileResponse($sharedFile),
            $sharedFiles,
        ));
    }

    #[Route(name: 'upload', methods: ['POST'])]
    public function upload(
        Request $request,
        FileUploadService $fileUploadService,
        #[CurrentUser] User $user,
    ): JsonResponse {
        $uploadedFile = $request->files->get('file');

        if (!$uploadedFile instanceof UploadedFile) {
            return $this->json(['message' => 'Aucun fichier envoyé.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $sharedFile = $fileUploadService->upload($uploadedFile, $user);
        } catch (FileTooLargeException $e) {
            return $this->json(['message' => $e->getMessage()], JsonResponse::HTTP_REQUEST_ENTITY_TOO_LARGE);
        } catch (ForbiddenFileTypeException $e) {
            return $this->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNSUPPORTED_MEDIA_TYPE);
        } catch (FileUploadException $e) {
            return $this->json(['message' => $e->getMessage()], JsonResponse::HTTP_BAD_REQUEST);
        }

        $this->logger->info('file.uploaded', [
            'file_id' => $sharedFile->getId(),
            'mime_type' => $sharedFile->getMimeType(),
            'owner_id' => $user->getId(),
            'size' => $sharedFile->getSize(),
        ]);

        return $this->json($this->sharedFileResponse($sharedFile), JsonResponse::HTTP_CREATED);
    }

    #[Route(
        '/{id}',
        name: 'delete',
        requirements: ['id' => '\d+'],
        methods: ['DELETE']
    )]
    public function delete(
        int $id,
        SharedFileRepository $sharedFileRepository,
        FileDeleteService $fileDeleteService,
        #[CurrentUser] User $user,
    ): JsonResponse|Response {
        $sharedFile = $sharedFileRepository->findOneByIdAndOwner($id, $user);

        if (null === $sharedFile) {
            return $this->json(['message' => 'Fichier introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }

        $fileDeleteService->delete($sharedFile);

        $this->logger->info('file.deleted', [
            'file_id' => $id,
            'owner_id' => $user->getId(),
        ]);

        return new Response(status: Response::HTTP_NO_CONTENT);
    }

    #[Route(
        '/{downloadToken}/metadata',
        name: 'show',
        requirements: ['downloadToken' => '[a-z0-9]{64}'],
        methods: ['GET']
    )]
    public function show(
        string $downloadToken,
        SharedFileRepository $sharedFileRepository,
    ): JsonResponse {
        $sharedFile = $sharedFileRepository->findOneByDownloadToken($downloadToken);

        if (null === $sharedFile) {
            return $this->json(['message' => 'Fichier introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }

        return $this->json($this->sharedFileMetadataResponse($sharedFile));
    }

    #[Route(
        '/{downloadToken}/download',
        name: 'download',
        requirements: ['downloadToken' => '[a-z0-9]{64}'],
        methods: ['GET']
    )]
    public function download(
        string $downloadToken,
        SharedFileRepository $sharedFileRepository,
        LocalFileStorage $localFileStorage,
    ): BinaryFileResponse|JsonResponse {
        $sharedFile = $sharedFileRepository->findOneByDownloadToken($downloadToken);

        if (null === $sharedFile || $sharedFile->isExpired()) {
            return $this->json(['message' => 'Fichier introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }

        $storagePath = $sharedFile->getStoragePath();

        if (null === $storagePath || !$localFileStorage->exists($storagePath)) {
            return $this->json(['message' => 'Fichier introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }

        $response = $this->file(
            $localFileStorage->path($storagePath),
            $sharedFile->getOriginalName() ?? 'fichier',
            ResponseHeaderBag::DISPOSITION_ATTACHMENT);

        $response->headers->set('Content-Type', $sharedFile->getMimeType() ?? 'application/octet-stream');

        $this->logger->info('file.downloaded', [
            'file_id' => $sharedFile->getId(),
            'mime_type' => $sharedFile->getMimeType(),
            'size' => $sharedFile->getSize(),
        ]);

        return $response;
    }

    /**
     * @return array{
     *     id: int|null,
     *     originalName: string|null,
     *     mimeType: string|null,
     *     size: int|null,
     *     downloadToken: string|null,
     *     createdAt: string,
     *     expiresAt: string
     * }
     */
    private function sharedFileResponse(SharedFile $sharedFile): array
    {
        return [
            'id' => $sharedFile->getId(),
            'originalName' => $sharedFile->getOriginalName(),
            'mimeType' => $sharedFile->getMimeType(),
            'size' => $sharedFile->getSize(),
            'downloadToken' => $sharedFile->getDownloadToken(),
            'createdAt' => $sharedFile->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'expiresAt' => $sharedFile->getExpiresAt()->format(\DateTimeInterface::ATOM),
        ];
    }

    /**
     * @return array{
     *     originalName: string|null,
     *     mimeType: string|null,
     *     size: int|null,
     *     createdAt: string,
     *     expiresAt: string
     * }
     */
    private function sharedFileMetadataResponse(SharedFile $sharedFile): array
    {
        return [
            'originalName' => $sharedFile->getOriginalName(),
            'mimeType' => $sharedFile->getMimeType(),
            'size' => $sharedFile->getSize(),
            'createdAt' => $sharedFile->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'expiresAt' => $sharedFile->getExpiresAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
