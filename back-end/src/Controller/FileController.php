<?php

namespace App\Controller;

use App\Entity\SharedFile;
use App\Entity\User;
use App\Exception\File\FileTooLargeException;
use App\Exception\File\FileUploadException;
use App\Exception\File\ForbiddenFileTypeException;
use App\Repository\SharedFileRepository;
use App\Service\File\FileUploadService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/files', name: 'api_files_')]
final class FileController extends AbstractController
{
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

        return $this->json($this->sharedFileResponse($sharedFile), JsonResponse::HTTP_CREATED);
    }

    /**
     * @return array{
     *     id: int|null,
     *     originalName: string|null,
     *     mimeType: string|null,
     *     size: int|null,
     *     downloadToken: string|null,
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
            'expiresAt' => $sharedFile->getExpiresAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
