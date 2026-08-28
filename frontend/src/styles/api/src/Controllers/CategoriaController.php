<?php
require_once "../src/Models/Categorias.php";
class CategoriaController{
    public function getAll()
    {
        $categoria=Categorias::all();
        echo json_encode($categoria);
         
    }
}