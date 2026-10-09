<?php
require_once __DIR__ . "/CrudController.php";
require_once __DIR__ . "/../Models/Empleados.php";
class EmpleadoController extends CrudController
{
    protected string $modelClass = Empleados::class;
    protected array $allowedFields = ['ci', 'nombre', 'apellidos', 'cargo'];
    protected array $requiredFields = ['ci', 'nombre', 'apellidos', 'cargo'];
}
