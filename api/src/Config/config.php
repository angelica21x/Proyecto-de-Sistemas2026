<?php
$path = dirname(__DIR__, 2) . '/.env';
$config = file_exists($path) ? parse_ini_file($path) : [];

define("HOST", getenv('DB_HOST') ?: ($config['DB_HOST'] ?? '127.0.0.1'));
define("DATABASE", getenv('DB_NAME') ?: ($config['DB_NAME'] ?? 'sistemadealmacenamiento'));
define("USERNAME", getenv('DB_USER') ?: ($config['DB_USER'] ?? 'root'));
define("PASSWORD", getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : ($config['DB_PASSWORD'] ?? ''));
define("PORT", getenv('DB_PORT') ?: ($config['DB_PORT'] ?? '3306'));
define("CHARSET", getenv('DB_CHARSET') ?: ($config['DB_CHARSET'] ?? 'charset=utf8mb4'));
define("APP_SECRET", getenv('APP_SECRET') ?: ($config['APP_SECRET'] ?? ''));
