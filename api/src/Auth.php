<?php

require_once __DIR__ . '/Config/config.php';
require_once __DIR__ . '/Config/conexionDB.php';

final class Auth
{
    private const TOKEN_LIFETIME = 28800; // 8 hours

    public static function authorize(string $method, string $uri): bool
    {
        if ($method === 'POST' && $uri === '/auth/login') return true;

        $user = self::currentUser();
        if ($user === null) {
            self::deny(401, 'Inicia sesión para continuar.');
            return false;
        }

        if ($uri === '/auth/me') return true;

        $resource = trim(explode('/', trim($uri, '/'))[0] ?? '', '/');
        $isRead = $method === 'GET';
        $role = $user['rol'];

        if ($role === 'ADMINISTRADOR') return true;

        $warehouseResources = ['productos', 'movimientos', 'detalle_movimientos', 'ubicaciones', 'categorias', 'empleados', 'proveedores'];
        if (!in_array($resource, $warehouseResources, true)) {
            self::deny(403, 'Tu rol no tiene permiso para realizar esta operación.');
            return false;
        }

        if ($role === 'SUPERVISOR') {
            if ($isRead) return true;
            self::deny(403, 'El supervisor tiene acceso de consulta; solo el administrador y el almacenero pueden modificar inventario.');
            return false;
        }

        if ($role === 'ALMACENERO') {
            $readOnlyResources = ['ubicaciones', 'categorias', 'empleados', 'proveedores'];
            $writableResources = ['productos', 'movimientos', 'detalle_movimientos'];
            if (($isRead && in_array($resource, array_merge($readOnlyResources, $writableResources), true))
                || (!$isRead && in_array($resource, $writableResources, true) && in_array($method, ['POST', 'PUT', 'DELETE'], true))) {
                return true;
            }
        }

        self::deny(403, 'Tu rol no tiene permiso para realizar esta operación.');
        return false;
    }

    public static function currentUser(): ?array
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if ($header === '' && function_exists('getallheaders')) {
            $headers = getallheaders();
            $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }
        if (!preg_match('/^Bearer\s+([A-Za-z0-9._-]+)$/i', $header, $matches)) return null;

        $payload = self::decodeToken($matches[1]);
        if (!$payload || empty($payload['sub']) || empty($payload['exp']) || $payload['exp'] < time()) return null;

        $rows = ConexionPDO::query(
            'SELECT id, username, rol, estado FROM usuarios WHERE id = :id LIMIT 1',
            [':id' => (int) $payload['sub']]
        );
        if (!$rows || isset($rows['error']) || (int) $rows[0]['estado'] !== 1) return null;

        return [
            'id' => (int) $rows[0]['id'],
            'username' => $rows[0]['username'],
            'rol' => $rows[0]['rol'],
            'expires_at' => (int) $payload['exp']
        ];
    }

    public static function issueToken(array $user): string
    {
        $payload = self::base64UrlEncode(json_encode([
            'sub' => (int) $user['id'],
            'exp' => time() + self::TOKEN_LIFETIME
        ], JSON_THROW_ON_ERROR));
        $signature = self::base64UrlEncode(hash_hmac('sha256', $payload, self::secret(), true));
        return $payload . '.' . $signature;
    }

    private static function decodeToken(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 2) return null;
        [$payload, $signature] = $parts;
        $expected = self::base64UrlEncode(hash_hmac('sha256', $payload, self::secret(), true));
        if (!hash_equals($expected, $signature)) return null;

        $json = self::base64UrlDecode($payload);
        if ($json === false) return null;
        $data = json_decode($json, true);
        return is_array($data) ? $data : null;
    }

    private static function secret(): string
    {
        if (!defined('APP_SECRET') || strlen(APP_SECRET) < 32) {
            throw new RuntimeException('Configura APP_SECRET con al menos 32 caracteres aleatorios en api/.env.');
        }
        return APP_SECRET;
    }

    private static function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $value): string|false
    {
        return base64_decode(strtr($value, '-_', '+/') . str_repeat('=', (4 - strlen($value) % 4) % 4), true);
    }

    private static function deny(int $status, string $message): void
    {
        http_response_code($status);
        echo json_encode(['status' => 'error', 'message' => $message], JSON_UNESCAPED_UNICODE);
    }
}
