<?php

namespace App\Service\File;

use Symfony\Component\DependencyInjection\Attribute\Autowire;

final readonly class LocalFileStorage
{
    public function __construct(
        #[Autowire(param: 'app.share_dir')]
        private string $shareDirectory,
        #[Autowire(param: 'kernel.project_dir')]
        private string $projectDirectory,
    ) {
    }

    public function directory(): string
    {
        if (str_starts_with($this->shareDirectory, '/')) {
            return $this->shareDirectory;
        }

        return sprintf('%s/%s', $this->projectDirectory, $this->shareDirectory);
    }

    public function path(string $storagePath): string
    {
        return sprintf('%s/%s', $this->directory(), $storagePath);
    }

    public function exists(string $storagePath): bool
    {
        return is_file($this->path($storagePath));
    }

    public function delete(string $storagePath): void
    {
        $filePath = $this->path($storagePath);

        if (is_file($filePath)) {
            unlink($filePath);
        }
    }
}
