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
        $content = $client->getResponse()->getContent();

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
        self::assertJson($content);
        self::assertSame(
            ['status' => 'ok'],
            json_decode($content, true, flags: JSON_THROW_ON_ERROR)
        );
    }
}
