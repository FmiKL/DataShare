<?php

namespace App\Exception\File;

final class ForbiddenFileTypeException extends \RuntimeException
{
    public function __construct()
    {
        parent::__construct("Ce type de fichier n'est pas autorisé.");
    }
}
