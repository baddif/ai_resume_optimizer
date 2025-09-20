<?php
require_once __DIR__ . '/../career-baist-initialization.php';
use PHPUnit\Framework\TestCase;

class GetHuggingfaceApiUrlTest extends TestCase
{
    public function testReturnsGlobalUrl()
    {
        global $hugging_face_api_url;
        $hugging_face_api_url = 'https://test.url';
        $url = cbi_get_hugging_face_api_url();
        $this->assertEquals('https://test.url', $url);
    }
}

