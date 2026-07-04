<?php

namespace App\Exception\File;

final class FileTooLargeException extends \RuntimeException
{
    public function __construct()
    {
        parent::__construct('La taille du fichier est limitée à 100 Mo.');
    }
}
