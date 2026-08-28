<?php
require_once "../src/Models/Proveedores.php";
class ProveedorController{
    public function getAll()
    {
        $proveedor=Proveedores::all();
        echo json_encode($proveedor);
         
    }
}