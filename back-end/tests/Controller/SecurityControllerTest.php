<?php

namespace App\Tests\Controller;

use App\Entity\User;
use App\Tests\ApiWebTestCase;
use Symfony\Component\HttpFoundation\Response;

final class SecurityControllerTest extends ApiWebTestCase
{
    private const LOGIN_URI = '/api/auth/login';
    private const REGISTER_URI = '/api/auth/register';

    private const DUPLICATE_EMAIL_MESSAGE = 'Cette adresse email est déjà utilisée.';
    private const INVALID_CREDENTIALS_MESSAGE = 'Identifiants invalides.';
    private const PASSWORD_MISMATCH_MESSAGE = 'Les mots de passe ne correspondent pas.';

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
}
