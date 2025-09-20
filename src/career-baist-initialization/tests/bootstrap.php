<?php
// WordPress PHPUnit bootstrap file for plugin tests
// 使用 WP_Mock 初始化 WordPress 测试环境
require_once __DIR__ . '/../../../vendor/autoload.php';
WP_Mock::setUp();
