<?php

namespace App\Dto\Security;

use Symfony\Component\Validator\Constraints as Assert;

final readonly class RegisterRequest
{
    public const MIN_PASSWORD_LENGTH = 8;

    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Email]
        public string $email = '',

        #[Assert\NotBlank]
        #[Assert\Length(min: self::MIN_PASSWORD_LENGTH)]
        public string $password = '',

        #[Assert\NotBlank]
        public string $passwordConfirm = '',
    ) {
    }

    public function normalizedEmail(): string
    {
        return strtolower(trim($this->email));
    }

    #[Assert\IsTrue(message: 'Les mots de passe ne correspondent pas.')]
    public function isPasswordConfirmed(): bool
    {
        return $this->password === $this->passwordConfirm;
    }
}
