<?php
require_once "../src/Models/Ubicaciones.php";
class UbicacionController{
    public function getAll()
    {
        $ubicacion=Ubicaciones::all();
        echo json_encode($ubicacion);
         
    }
}