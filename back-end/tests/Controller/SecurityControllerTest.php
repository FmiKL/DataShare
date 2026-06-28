<?php

namespace App\Tests\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class SecurityControllerTest extends WebTestCase
{
    private const LOGIN_URI = '/api/auth/login';
    private const REGISTER_URI = '/api/auth/register';

    private const USER_EMAIL = 'user@example.com';
    private const USER_PASSWORD = 'password123';

    private const DUPLICATE_EMAIL_MESSAGE = 'Cette adresse email est déjà utilisée.';
    private const INVALID_CREDENTIALS_MESSAGE = 'Identifiants invalides.';
    private const PASSWORD_MISMATCH_MESSAGE = 'Les mots de passe ne correspondent pas.';

    private KernelBrowser $client;

    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get(EntityManagerInterface::class);

        $metadata = $this->entityManager->getMetadataFactory()->getAllMetadata();
        $schemaTool = new SchemaTool($this->entityManager);

        $schemaTool->dropDatabase();
        $schemaTool->createSchema($metadata);
    }

    public function testRegisterCreatesUser(): void
    {
        $this->jsonRequest(self::REGISTER_URI, $this->validRegisterPayload());

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        self::assertJson($this->client->getResponse()->getContent());
        self::assertSame([
            'id' => 1,
            'email' => self::USER_EMAIL,
        ], $this->jsonResponse());

        $user = $this->userRepository()->findOneBy(['email' => self::USER_EMAIL]);

        self::assertInstanceOf(User::class, $user);
        self::assertNotSame(self::USER_PASSWORD, $user->getPassword());
        self::assertTrue($this->passwordHasher()->isPasswordValid($user, self::USER_PASSWORD));
    }

    public function testRegisterRejectsExistingEmail(): void
    {
        $payload = $this->validRegisterPayload();

        $this->jsonRequest(self::REGISTER_URI, $payload);
        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);

        $this->jsonRequest(self::REGISTER_URI, $payload);

        self::assertResponseStatusCodeSame(Response::HTTP_CONFLICT);
        self::assertSame([
            'message' => self::DUPLICATE_EMAIL_MESSAGE,
        ], $this->jsonResponse());
    }

    public function testRegisterRejectsEmptyPayload(): void
    {
        $this->jsonRequest(self::REGISTER_URI, []);

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRegisterRejectsDifferentPassword(): void
    {
        $this->jsonRequest(self::REGISTER_URI, [
            'email' => self::USER_EMAIL,
            'password' => self::USER_PASSWORD,
            'passwordConfirm' => 'different123',
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
        self::assertStringContainsString(self::PASSWORD_MISMATCH_MESSAGE, $this->client->getResponse()->getContent());
    }

    public function testLoginReturnsToken(): void
    {
        $this->createUser();

        $this->jsonRequest(self::LOGIN_URI, $this->validLoginPayload());

        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        $response = $this->jsonResponse();

        self::assertArrayHasKey('token', $response);
        self::assertIsString($response['token']);
        self::assertNotSame('', $response['token']);
    }

    public function testLoginRejectsUnknownEmail(): void
    {
        $this->jsonRequest(self::LOGIN_URI, $this->validLoginPayload());

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
        self::assertSame(['message' => self::INVALID_CREDENTIALS_MESSAGE], $this->jsonResponse());
    }

    public function testLoginRejectsInvalidPassword(): void
    {
        $this->createUser();
        $this->jsonRequest(self::LOGIN_URI, [
            'email' => self::USER_EMAIL,
            'password' => 'invalid-password',
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
        self::assertSame(['message' => self::INVALID_CREDENTIALS_MESSAGE], $this->jsonResponse());
    }

    public function testLoginRejectsEmptyPayload(): void
    {
        $this->jsonRequest(self::LOGIN_URI, []);

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    /**
     * @return array<string, string>
     */
    private function validLoginPayload(): array
    {
        return [
            'email' => self::USER_EMAIL,
            'password' => self::USER_PASSWORD,
        ];
    }

    /**
     * @return array<string, string>
     */
    private function validRegisterPayload(): array
    {
        return [
            'email' => self::USER_EMAIL,
            'password' => self::USER_PASSWORD,
            'passwordConfirm' => self::USER_PASSWORD,
        ];
    }

    /**
     * @param array<string, string> $payload
     */
    private function jsonRequest(string $uri, array $payload): void
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

    private function createUser(): void
    {
        $user = (new User())->setEmail(self::USER_EMAIL);
        $user->setPassword($this->passwordHasher()->hashPassword($user, self::USER_PASSWORD));

        $this->entityManager->persist($user);
        $this->entityManager->flush();
    }

    /**
     * @return array<string, mixed>
     */
    private function jsonResponse(): array
    {
        $content = $this->client->getResponse()->getContent();

        self::assertJson($content);

        $data = json_decode($content, true, flags: JSON_THROW_ON_ERROR);
        self::assertIsArray($data);

        return $data;
    }

    private function userRepository(): UserRepository
    {
        return static::getContainer()->get(UserRepository::class);
    }

    private function passwordHasher(): UserPasswordHasherInterface
    {
        return static::getContainer()->get(UserPasswordHasherInterface::class);
    }
}
