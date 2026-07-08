<?php

namespace App\Service\File;

use App\Entity\SharedFile;
use Doctrine\ORM\EntityManagerInterface;

final readonly class FileDeleteService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private LocalFileStorage $localFileStorage,
    ) {
    }

    public function delete(SharedFile $sharedFile): void
    {
        $storagePath = $sharedFile->getStoragePath();

        if (null !== $storagePath) {
            $this->localFileStorage->delete($storagePath);
        }

        $this->entityManager->remove($sharedFile);
        $this->entityManager->flush();
    }
}
