<?php
require_once __DIR__ . "/CrudController.php";
require_once __DIR__ . "/../Models/Proveedores.php";
class ProveedorController extends CrudController
{
    protected string $modelClass = Proveedores::class;
    protected array $allowedFields = ['nit_rut', 'razon_social', 'contacto_nombre', 'direccion', 'telefono', 'email'];
    protected array $requiredFields = ['nit_rut', 'razon_social'];
}
