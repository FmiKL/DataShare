<?php

namespace App\Tests;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

abstract class ApiWebTestCase extends WebTestCase
{
    protected const USER_EMAIL = 'user@example.com';
    protected const USER_PASSWORD = 'password123';

    protected KernelBrowser $client;

    protected EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get(EntityManagerInterface::class);

        $metadata = $this->entityManager->getMetadataFactory()->getAllMetadata();
        $schemaTool = new SchemaTool($this->entityManager);

        $schemaTool->dropDatabase();
        $schemaTool->createSchema($metadata);
    }

    /**
     * @param array<string, string> $payload
     */
    protected function jsonRequest(string $uri, array $payload): void
    {
        $this->client->request(
            'POST',
            $uri,
            server: [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_ACCEPT' => 'application/json',
            ],
            content: json_encode($payload, JSON_THROW_ON_ERROR),
        );
    }

    protected function createUser(string $email = self::USER_EMAIL, string $password = self::USER_PASSWORD): User
    {
        $user = (new User())->setEmail($email);
        $user->setPassword($this->passwordHasher()->hashPassword($user, $password));

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $user;
    }

    protected function createToken(User $user): string
    {
        return static::getContainer()->get(JWTTokenManagerInterface::class)->create($user);
    }

    /**
     * @return array<string, string>
     */
    protected function authorizationHeader(User $user): array
    {
        return [
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_AUTHORIZATION' => sprintf('Bearer %s', $this->createToken($user)),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function jsonResponse(): array
    {
        $content = $this->client->getResponse()->getContent();

        self::assertJson($content);

        $data = json_decode($content, true, flags: JSON_THROW_ON_ERROR);
        self::assertIsArray($data);

        return $data;
    }

    protected function userRepository(): UserRepository
    {
        return static::getContainer()->get(UserRepository::class);
    }

    protected function passwordHasher(): UserPasswordHasherInterface
    {
        return static::getContainer()->get(UserPasswordHasherInterface::class);
    }
}
