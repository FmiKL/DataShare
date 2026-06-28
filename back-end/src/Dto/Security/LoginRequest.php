<?php

namespace App\Dto\Security;

use Symfony\Component\Validator\Constraints as Assert;

final readonly class LoginRequest
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Email]
        public string $email = '',

        #[Assert\NotBlank]
        public string $password = '',
    ) {
    }

    public function normalizedEmail(): string
    {
        return strtolower(trim($this->email));
    }
}
