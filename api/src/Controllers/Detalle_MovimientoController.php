<?php
require_once __DIR__ . "/CrudController.php";
require_once __DIR__ . "/../Models/Detalle_Movimientos.php";
class Detalle_MovimientoController extends CrudController
{
    protected string $modelClass = Detalle_Movimientos::class;
    protected array $allowedFields = ['cod_movimiento', 'cod_producto', 'cantidad', 'precio_historico'];
    protected array $requiredFields = ['cod_movimiento', 'cod_producto', 'cantidad', 'precio_historico'];
}
