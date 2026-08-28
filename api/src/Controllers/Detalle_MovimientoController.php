<?php
require_once "../src/Models/Detalle_Movimientos.php";
class Detalle_MovimientoController{
    public function getAll()
    {
        $detalle_movimiento=Detalle_Movimientos::all();
        echo json_encode($detalle_movimiento);
         
    }
}