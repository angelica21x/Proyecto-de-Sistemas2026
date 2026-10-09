<?php
require_once __DIR__ . "/CrudModel.php";
class Usuarios extends CrudModel
{
    protected static string $table = 'usuarios';
    protected static array $fields = ['username', 'password_hash', 'rol', 'estado', 'cod_empleado'];

    public static function all(): array
    {
        return ConexionPDO::query('SELECT id, username, rol, estado, cod_empleado FROM usuarios');
    }

    public static function findById($id): array
    {
        return ConexionPDO::query('SELECT id, username, rol, estado, cod_empleado FROM usuarios WHERE id = :id', [':id' => $id]);
    }
}
