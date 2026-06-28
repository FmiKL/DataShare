<?php

namespace App\Exception\Security;

final class InvalidCredentialException extends \RuntimeException
{
    public function __construct()
    {
        parent::__construct('Identifiants invalides.');
    }
}
