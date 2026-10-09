<?php
require_once __DIR__ . "/CrudModel.php";
class Proveedores extends CrudModel
{
    protected static string $table = 'proveedores';
    protected static array $fields = ['nit_rut', 'razon_social', 'contacto_nombre', 'direccion', 'telefono', 'email'];
}
