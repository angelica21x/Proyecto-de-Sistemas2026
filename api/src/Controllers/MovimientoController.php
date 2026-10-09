<?php
require_once __DIR__ . "/CrudController.php";
require_once __DIR__ . "/../Models/Movimientos.php";
class MovimientoController extends CrudController
{
    protected string $modelClass = Movimientos::class;
    protected array $allowedFields = ['tipo_movimiento', 'fecha_registro', 'documento_referencia', 'observaciones', 'cod_empleado', 'cod_proveedor'];
    protected array $requiredFields = ['tipo_movimiento', 'cod_empleado'];
}
