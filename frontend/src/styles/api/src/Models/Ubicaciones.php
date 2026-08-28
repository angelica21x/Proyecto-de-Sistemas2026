<?php
include_once __DIR__ . "/../Config/conexionDB.php";
class Ubicaciones
{
    public static function all()
    {
        $sql = "SELECT * FROM ubicaciones";
        return ConexionPDO::query($sql);
    }
}