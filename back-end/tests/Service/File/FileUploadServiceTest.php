<?php

namespace App\Tests\Service\File;

use App\Entity\SharedFile;
use App\Entity\User;
use App\Exception\File\FileTooLargeException;
use App\Exception\File\ForbiddenFileTypeException;
use App\Service\File\FileUploadService;
use App\Service\File\LocalFileStorage;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

final class FileUploadServiceTest extends TestCase
{
    private const MAX_FILE_SIZE = 100 * 1024 * 1024;

    private string $shareDirectory;

    protected function setUp(): void
    {
        $shareDirectory = sprintf('%s/datashare_upload_%s', sys_get_temp_dir(), bin2hex(random_bytes(8)));
        mkdir($shareDirectory);

        $this->shareDirectory = $shareDirectory;
    }

    protected function tearDown(): void
    {
        foreach (glob(sprintf('%s/*', $this->shareDirectory)) ?: [] as $filePath) {
            if (is_file($filePath)) {
                unlink($filePath);
            }
        }

        if (is_dir($this->shareDirectory)) {
            rmdir($this->shareDirectory);
        }
    }

    public function testUploadsFile(): void
    {
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $uploadedFile = $this->createUploadedFile('document.txt');

        $entityManager
            ->expects(self::once())
            ->method('persist')
            ->with(self::isInstanceOf(SharedFile::class));

        $entityManager
            ->expects(self::once())
            ->method('flush');

        $sharedFile = $this->fileUploadService($entityManager)->upload($uploadedFile, new User());
        $storagePath = $sharedFile->getStoragePath();

        self::assertSame('document.txt', $sharedFile->getOriginalName());
        self::assertSame('text/plain', $sharedFile->getMimeType());
        self::assertSame(7, $sharedFile->getSize());
        self::assertIsString($storagePath);
        self::assertFileExists(sprintf('%s/%s', $this->shareDirectory, $storagePath));
    }

    public function testRejectsServerScriptExtension(): void
    {
        $entityManager = $this->createMock(EntityManagerInterface::class);

        $entityManager
            ->expects(self::never())
            ->method('persist');

        $entityManager
            ->expects(self::never())
            ->method('flush');

        $this->expectException(ForbiddenFileTypeException::class);

        $this->fileUploadService($entityManager)->upload($this->createUploadedFile('document.pdf.php'), new User());
    }

    public function testRejectsTooLargeFile(): void
    {
        $entityManager = $this->createMock(EntityManagerInterface::class);

        $entityManager
            ->expects(self::never())
            ->method('persist');

        $entityManager
            ->expects(self::never())
            ->method('flush');

        $this->expectException(FileTooLargeException::class);

        $this->fileUploadService($entityManager, 3)->upload($this->createUploadedFile('document.txt'), new User());
    }

    private function fileUploadService(
        EntityManagerInterface $entityManager,
        int $maxFileSize = self::MAX_FILE_SIZE,
    ): FileUploadService {
        return new FileUploadService(
            $entityManager,
            new LocalFileStorage($this->shareDirectory, ''),
            $maxFileSize,
        );
    }

    private function createUploadedFile(string $originalName): UploadedFile
    {
        $filePath = tempnam(sys_get_temp_dir(), 'datashare_unit_upload_');

        self::assertIsString($filePath);

        file_put_contents($filePath, 'hello!!');

        return new UploadedFile($filePath, $originalName, 'text/plain', test: true);
    }
}
