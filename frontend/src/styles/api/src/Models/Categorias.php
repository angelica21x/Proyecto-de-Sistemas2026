<?php
include_once __DIR__ . "/../Config/conexionDB.php";
class Categorias
{
    public static function all()
    {
        $sql = "SELECT * FROM categorias";
        return ConexionPDO::query($sql);
    }
}