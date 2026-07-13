<?php

namespace App\Exception\File;

final class FileTooLargeException extends \RuntimeException
{
    private const MEGABYTE = 1024 * 1024;

    public function __construct(int $maxFileSize)
    {
        parent::__construct(sprintf(
            'La taille du fichier est limitée à %d Mo.',
            intdiv($maxFileSize, self::MEGABYTE)
        ));
    }
}
