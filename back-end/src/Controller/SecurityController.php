<?php

namespace App\Controller;

use App\Dto\Security\RegisterRequest;
use App\Exception\Security\EmailAlreadyUsedException;
use App\Service\Security\UserRegistrationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

final class SecurityController extends AbstractController
{
    #[Route('/api/auth/register', name: 'api_auth_register', methods: ['POST'])]
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
