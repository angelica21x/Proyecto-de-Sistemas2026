<?php
require_once __DIR__ . "/CrudModel.php";
class Categorias extends CrudModel
{
    protected static string $table = 'categorias';
    protected static array $fields = ['nombre', 'descripcion'];
}
