<?php

namespace App\Service\File;

use App\Entity\SharedFile;
use App\Entity\User;
use App\Exception\File\FileTooLargeException;
use App\Exception\File\FileUploadException;
use App\Exception\File\ForbiddenFileTypeException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;

final readonly class FileUploadService
{
    private const MEGABYTE = (1024 * 1024);
    private const MAX_FILE_SIZE = (100 * self::MEGABYTE); // 100 Mo
    private const EXPIRATION_DAYS = 7;
    private const FORBIDDEN_EXTENSIONS = ['bat', 'cmd', 'com', 'exe', 'msi', 'php', 'php3', 'php4', 'php5', 'phtml', 'sh'];

    public function __construct(
        private EntityManagerInterface $entityManager,
        private LocalFileStorage $localFileStorage,
    ) {
    }

    public function upload(UploadedFile $uploadedFile, User $owner): SharedFile
    {
        if (!$uploadedFile->isValid()) {
            throw new FileUploadException('Le fichier envoyé est invalide.');
        }

        $fileSize = $uploadedFile->getSize();

        if (false === $fileSize) {
            throw new FileUploadException('La taille du fichier est inconnue.');
        }

        if ($fileSize > self::MAX_FILE_SIZE) {
            throw new FileTooLargeException();
        }

        $extension = strtolower(pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_EXTENSION));

        if (in_array($extension, self::FORBIDDEN_EXTENSIONS)) {
            throw new ForbiddenFileTypeException();
        }

        $storageName = $this->generateStorageName($extension);

        try {
            $uploadedFile->move($this->localFileStorage->directory(), $storageName);
        } catch (FileException) {
            throw new FileUploadException("Le fichier n'a pas pu être enregistré.");
        }

        $sharedFile = $this->createSharedFile($uploadedFile, $owner, $fileSize, $storageName);
        $this->entityManager->persist($sharedFile);
        $this->entityManager->flush();

        return $sharedFile;
    }

    private function createSharedFile(
        UploadedFile $uploadedFile,
        User $owner,
        int $fileSize,
        string $storageName,
    ): SharedFile {
        return (new SharedFile())
            ->setOwner($owner)
            ->setOriginalName($uploadedFile->getClientOriginalName())
            ->setMimeType($uploadedFile->getClientMimeType())
            ->setSize($fileSize)
            ->setStoragePath($storageName)
            ->setExpiresAt($this->createExpirationDate());
    }

    private function createExpirationDate(): \DateTimeImmutable
    {
        return (new \DateTimeImmutable())->add(new \DateInterval(sprintf('P%dD', self::EXPIRATION_DAYS)));
    }

    private function generateStorageName(string $extension): string
    {
        $storageName = bin2hex(random_bytes(16));
        if ('' !== $extension) {
            return sprintf('%s.%s', $storageName, $extension);
        }

        return $storageName;
    }
}
