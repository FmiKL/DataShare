<?php

namespace App\Service\Security;

use App\Dto\Security\LoginRequest;
use App\Exception\Security\InvalidCredentialException;
use App\Repository\UserRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final readonly class UserLoginService
{
    public function __construct(
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtTokenManager,
    ) {
    }

    public function authenticate(LoginRequest $request): string
    {
        $user = $this->userRepository->findOneBy(['email' => $request->normalizedEmail()]);

        if (null === $user || !$this->passwordHasher->isPasswordValid($user, $request->password)) {
            throw new InvalidCredentialException();
        }

        return $this->jwtTokenManager->create($user);
    }
}
