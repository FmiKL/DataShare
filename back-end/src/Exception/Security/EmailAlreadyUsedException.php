<?php

namespace App\Exception\Security;

final class EmailAlreadyUsedException extends \RuntimeException
{
    public function __construct()
    {
        parent::__construct('Cette adresse email est déjà utilisée.');
    }
}
