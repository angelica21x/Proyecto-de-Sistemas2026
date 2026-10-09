<?php
require_once __DIR__ . "/CrudModel.php";
class Detalle_Movimientos extends CrudModel
{
    protected static string $table = 'detalle_movimientos';
    protected static array $fields = ['cod_movimiento', 'cod_producto', 'cantidad', 'precio_historico'];
}
