<?php

namespace App\Tests\Service\File;

use App\Service\File\LocalFileStorage;
use PHPUnit\Framework\TestCase;

final class LocalFileStorageTest extends TestCase
{
    public function testBuildsPathFromRelativeDirectory(): void
    {
        $localFileStorage = new LocalFileStorage('var/share', '/project');

        self::assertSame('/project/var/share', $localFileStorage->directory());
        self::assertSame('/project/var/share/document.txt', $localFileStorage->path('document.txt'));
    }

    public function testKeepsAbsoluteDirectory(): void
    {
        $localFileStorage = new LocalFileStorage('/tmp/share', '/project');

        self::assertSame('/tmp/share', $localFileStorage->directory());
    }
}
