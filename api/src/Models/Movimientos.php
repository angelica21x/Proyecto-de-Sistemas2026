<?php
require_once __DIR__ . "/CrudModel.php";
class Movimientos extends CrudModel
{
    protected static string $table = 'movimientos';
    protected static array $fields = ['tipo_movimiento', 'fecha_registro', 'documento_referencia', 'observaciones', 'cod_empleado', 'cod_proveedor'];
}
