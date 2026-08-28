<?php
include_once __DIR__ . "/../Config/conexionDB.php";
class Proveedores
{
    public static function all()
    {
        $sql = "SELECT * FROM proveedores";
        return ConexionPDO::query($sql);
    }
}