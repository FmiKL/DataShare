<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

final class HealthControllerTest extends WebTestCase
{
    public function testHealthCheck(): void
    {
        $client = static::createClient();

        $client->request('GET', '/', server: ['HTTP_ACCEPT' => 'application/json']);

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
        self::assertJson($client->getResponse()->getContent());
        self::assertSame(['status' => 'ok'], json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR));
    }
}
