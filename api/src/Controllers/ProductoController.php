<?php
require_once __DIR__ . "/CrudController.php";
require_once __DIR__ . "/../Models/Productos.php";

class ProductoController extends CrudController
{
    protected string $modelClass = Productos::class;
    protected array $allowedFields = [
        'codbarras', 'nombre', 'descripcion', 'stock_actual', 'stock_minimo',
        'precio_costo', 'cod_categoria', 'cod_ubicacion'
    ];
    protected array $requiredFields = [
        'codbarras', 'nombre', 'descripcion', 'stock_actual', 'precio_costo', 'cod_categoria'
    ];
}
