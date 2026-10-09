<?php
require_once __DIR__ . "/CrudModel.php";
class Empleados extends CrudModel
{
    protected static string $table = 'empleados';
    protected static array $fields = ['ci', 'nombre', 'apellidos', 'cargo'];
}
