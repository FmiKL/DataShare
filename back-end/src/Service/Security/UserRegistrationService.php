<?php

namespace App\Service\Security;

use App\Dto\Security\RegisterRequest;
use App\Entity\User;
use App\Exception\Security\EmailAlreadyUsedException;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final readonly class UserRegistrationService
{
    public function __construct(
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher,
        private EntityManagerInterface $entityManager,
    ) {
    }

    public function register(RegisterRequest $request): User
    {
        $email = $request->normalizedEmail();

        if (null !== $this->userRepository->findOneBy(['email' => $email])) {
            throw new EmailAlreadyUsedException();
        }

        $user = (new User())->setEmail($email);
        $user->setPassword($this->passwordHasher->hashPassword($user, $request->password));

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $user;
    }
}
