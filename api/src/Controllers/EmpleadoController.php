<?php
require_once "../src/Models/Empleados.php";
class EmpleadoController{
    public function getAll()
    {
        $empleado=Empleados::all();
        echo json_encode($empleado);
         
    }
}