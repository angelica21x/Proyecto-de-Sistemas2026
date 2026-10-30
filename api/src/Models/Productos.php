<?php
require_once __DIR__ . "/CrudModel.php";

class Productos extends CrudModel
{
    protected static string $table = 'productos';
    protected static array $fields = [
        'codbarras', 'nombre', 'descripcion', 'stock_actual', 'stock_minimo',
        'precio_costo', 'cod_categoria', 'cod_ubicacion'
    ];
}
