<?php

namespace App\Tests\Controller;

use App\Entity\SharedFile;
use App\Entity\User;
use App\Repository\SharedFileRepository;
use App\Tests\ApiWebTestCase;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;

final class FileControllerTest extends ApiWebTestCase
{
    private const FILES_URI = '/api/files';

    private const FILE_CONTENT = 'hello!!';

    protected function tearDown(): void
    {
        foreach ($this->sharedFileRepository()->findAll() as $sharedFile) {
            $storagePath = $sharedFile->getStoragePath();

            if (null !== $storagePath) {
                $filePath = $this->sharedFilePath($storagePath);

                if (is_file($filePath)) {
                    unlink($filePath);
                }
            }
        }

        parent::tearDown();
    }

    public function testCreatesUploadSharedFile(): void
    {
        $this->authenticatedUploadRequest($this->createUploadedFile());

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);

        $response = $this->jsonResponse();

        self::assertSame('document.txt', $response['originalName']);
        self::assertSame('text/plain', $response['mimeType']);
        self::assertSame(strlen(self::FILE_CONTENT), $response['size']);
        self::assertIsString($response['downloadToken']);
        self::assertArrayHasKey('expiresAt', $response);

        $sharedFile = $this->sharedFileRepository()->findOneBy(['originalName' => 'document.txt']);

        self::assertInstanceOf(SharedFile::class, $sharedFile);
        self::assertSame(self::USER_EMAIL, $sharedFile->getOwner()?->getEmail());
        self::assertNotNull($sharedFile->getCreatedAt());
        self::assertNotNull($sharedFile->getExpiresAt());
        self::assertNotNull($sharedFile->getStoragePath());
        self::assertFileExists($this->sharedFilePath($sharedFile->getStoragePath()));
    }

    public function testListsUserFiles(): void
    {
        $user = $this->createUser();
        $otherUser = $this->createUser('autre@user.com');

        $this->createSharedFile($user, 'ancien-document.txt', new \DateTimeImmutable('-1 day'));
        $this->createSharedFile($user, 'dernier-document.txt', new \DateTimeImmutable());
        $this->createSharedFile($otherUser, 'autre-user.txt', new \DateTimeImmutable());

        $this->client->request('GET', self::FILES_URI, server: $this->authorizationHeader($user));

        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        $response = $this->jsonResponse();

        self::assertSame(
            ['dernier-document.txt', 'ancien-document.txt'],
            array_column($response, 'originalName')
        );
    }

    public function testDownloadsSharedFile(): void
    {
        $sharedFile = $this->createSharedFile(
            $this->createUser(),
            'document.txt',
            new \DateTimeImmutable()
        );

        $downloadToken = $sharedFile->getDownloadToken();

        self::assertIsString($downloadToken);

        $this->client->request('GET', $this->downloadUri($downloadToken));

        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        $response = $this->client->getResponse();

        self::assertInstanceOf(BinaryFileResponse::class, $response);
        self::assertSame(self::FILE_CONTENT, $this->binaryFileContent($response));
        self::assertStringContainsString(
            'document.txt',
            $response->headers->get('content-disposition', '')
        );
    }

    public function testRequiresUploadAuthentication(): void
    {
        $this->client->request('POST', self::FILES_URI, files: ['file' => $this->createUploadedFile()]);

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testRequiresListAuthentication(): void
    {
        $this->client->request('GET', self::FILES_URI, server: ['HTTP_ACCEPT' => 'application/json']);

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testRejectsDownloadUnknownToken(): void
    {
        $this->client->request('GET', $this->downloadUri(str_repeat('a', 64)));

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
        self::assertSame(['message' => 'Fichier introuvable.'], $this->jsonResponse());
    }

    public function testRejectsDownloadExpiredFile(): void
    {
        $sharedFile = $this->createSharedFile(
            $this->createUser(),
            'document.txt',
            new \DateTimeImmutable('-10 days'),
            new \DateTimeImmutable('-1 day')
        );

        $downloadToken = $sharedFile->getDownloadToken();

        self::assertIsString($downloadToken);

        $this->client->request('GET', $this->downloadUri($downloadToken));

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
        self::assertSame(['message' => 'Fichier introuvable.'], $this->jsonResponse());
    }

    public function testRejectsUploadMissingFile(): void
    {
        $user = $this->createUser();

        $this->client->request(
            'POST',
            self::FILES_URI,
            server: $this->authorizationHeader($user)
        );

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
        self::assertSame(['message' => 'Aucun fichier envoyé.'], $this->jsonResponse());
    }

    public function testRejectsUploadServerScriptExtension(): void
    {
        $this->authenticatedUploadRequest($this->createUploadedFile('facture.pdf.php'));

        self::assertResponseStatusCodeSame(Response::HTTP_UNSUPPORTED_MEDIA_TYPE);
        self::assertSame(['message' => "Ce type de fichier n'est pas autorisé."], $this->jsonResponse());
        self::assertSame([], $this->sharedFileRepository()->findAll());
    }

    private function authenticatedUploadRequest(UploadedFile $uploadedFile): void
    {
        $user = $this->createUser();

        $this->client->request(
            'POST',
            self::FILES_URI,
            files: ['file' => $uploadedFile],
            server: $this->authorizationHeader($user)
        );
    }

    private function createUploadedFile(string $originalName = 'document.txt'): UploadedFile
    {
        $filePath = tempnam(sys_get_temp_dir(), 'datashare_upload_');

        self::assertIsString($filePath);

        file_put_contents($filePath, self::FILE_CONTENT);

        return new UploadedFile($filePath, $originalName, 'text/plain', test: true);
    }

    private function createSharedFile(
        User $owner,
        string $originalName,
        \DateTimeImmutable $createdAt,
        ?\DateTimeImmutable $expiresAt = null,
    ): SharedFile {
        $storagePath = sprintf('%s.txt', bin2hex(random_bytes(8)));
        $filePath = $this->sharedFilePath($storagePath);
        $fileDirectory = dirname($filePath);

        if (!is_dir($fileDirectory)) {
            mkdir($fileDirectory, 0777, true);
        }

        file_put_contents($filePath, self::FILE_CONTENT);

        $sharedFile = (new SharedFile())
            ->setOwner($owner)
            ->setOriginalName($originalName)
            ->setMimeType('text/plain')
            ->setSize(strlen(self::FILE_CONTENT))
            ->setStoragePath($storagePath)
            ->setCreatedAt($createdAt)
            ->setExpiresAt($expiresAt ?? $createdAt->modify('+7 days'))
        ;

        $this->entityManager->persist($sharedFile);
        $this->entityManager->flush();

        return $sharedFile;
    }

    private function downloadUri(string $downloadToken): string
    {
        return sprintf('%s/%s/download', self::FILES_URI, $downloadToken);
    }

    private function binaryFileContent(BinaryFileResponse $response): string
    {
        ob_start();
        $response->sendContent();
        $content = ob_get_clean();

        self::assertIsString($content);

        return $content;
    }

    private function sharedFilePath(string $storagePath): string
    {
        $shareDirectory = static::getContainer()->getParameter('app.share_dir');
        $projectDirectory = static::getContainer()->getParameter('kernel.project_dir');

        self::assertIsString($shareDirectory);
        self::assertIsString($projectDirectory);

        if (str_starts_with($shareDirectory, '/')) {
            return sprintf('%s/%s', $shareDirectory, $storagePath);
        }

        return sprintf('%s/%s/%s', $projectDirectory, $shareDirectory, $storagePath);
    }

    private function sharedFileRepository(): SharedFileRepository
    {
        return static::getContainer()->get(SharedFileRepository::class);
    }
}
