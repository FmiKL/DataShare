<?php

namespace App\Controller;

use App\Dto\Security\LoginRequest;
use App\Dto\Security\RegisterRequest;
use App\Exception\Security\EmailAlreadyUsedException;
use App\Exception\Security\InvalidCredentialException;
use App\Service\Security\UserLoginService;
use App\Service\Security\UserRegistrationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/auth', name: 'api_auth_')]
final class SecurityController extends AbstractController
{
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(
        #[MapRequestPayload] LoginRequest $request,
        UserLoginService $userLoginService,
    ): JsonResponse {
        try {
            $token = $userLoginService->authenticate($request);
        } catch (InvalidCredentialException $e) {
            return $this->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNAUTHORIZED);
        }

        return $this->json(['token' => $token]);
    }

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(
        #[MapRequestPayload] RegisterRequest $request,
        UserRegistrationService $userRegistrationService,
    ): JsonResponse {
        try {
            $user = $userRegistrationService->register($request);
        } catch (EmailAlreadyUsedException $e) {
            return $this->json(['message' => $e->getMessage()], JsonResponse::HTTP_CONFLICT);
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
        ],
            JsonResponse::HTTP_CREATED,
        );
    }
}
