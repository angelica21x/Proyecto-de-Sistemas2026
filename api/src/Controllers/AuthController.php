<?php

require_once __DIR__ . '/../Auth.php';

class AuthController
{
    public function login(): void
    {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!is_array($body)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Envía un objeto JSON válido.']);
            return;
        }

        $identifier = trim((string) ($body['email'] ?? $body['username'] ?? ''));
        $password = (string) ($body['password'] ?? '');
        if ($identifier === '' || $password === '') {
            http_response_code(422);
            echo json_encode(['status' => 'error', 'message' => 'El correo y la contraseña son obligatorios.']);
            return;
        }

        $rows = ConexionPDO::query(
            'SELECT id, username, password_hash, rol, estado FROM usuarios WHERE username = :username LIMIT 1',
            [':username' => $identifier]
        );
        if (isset($rows['error'])) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'No se pudo consultar la base de datos.']);
            return;
        }

        $user = $rows[0] ?? null;
        if (!$user || (int) $user['estado'] !== 1 || !password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Correo o contraseña incorrectos.']);
            return;
        }

        $safeUser = [
            'id' => (int) $user['id'],
            'username' => $user['username'],
            'rol' => $user['rol']
        ];
        echo json_encode([
            'status' => 'ok',
            'token' => Auth::issueToken($user),
            'user' => $safeUser,
            'expires_in' => 28800
        ], JSON_UNESCAPED_UNICODE);
    }

    public function me(): void
    {
        $user = Auth::currentUser();
        if ($user === null) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'La sesión expiró. Inicia sesión nuevamente.']);
            return;
        }
        echo json_encode(['status' => 'ok', 'user' => $user], JSON_UNESCAPED_UNICODE);
    }
}
