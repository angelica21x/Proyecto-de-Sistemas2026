<?php
require_once __DIR__ . "/CrudController.php";
require_once __DIR__ . "/../Models/Usuarios.php";
class UsuarioController extends CrudController
{
    protected string $modelClass = Usuarios::class;
    protected array $allowedFields = ['username', 'password', 'password_hash', 'rol', 'estado', 'cod_empleado'];
    protected array $requiredFields = ['username', 'rol', 'cod_empleado'];

    protected function prepareWriteData(array $data, bool $creating): ?array
    {
        $plainPassword = $data['password'] ?? '';
        unset($data['password']);

        if ($plainPassword !== '') {
            $data['password_hash'] = password_hash($plainPassword, PASSWORD_DEFAULT);
        } elseif ($creating && empty($data['password_hash'])) {
            http_response_code(422);
            echo json_encode(['status' => 'error', 'message' => 'La contraseña es obligatoria al crear un usuario', 'fields' => ['password']]);
            return null;
        }

        return $data;
    }

    protected function writeError(Throwable $error): void
    {
        $detail = $error->getMessage();
        if ((string) $error->getCode() === '23000' && str_contains($detail, 'cod_empleado')) {
            http_response_code(409);
            echo json_encode([
                'status' => 'error',
                'message' => 'El empleado seleccionado ya tiene una cuenta. Elige un empleado disponible.'
            ]);
            return;
        }
        parent::writeError($error);
    }
}
