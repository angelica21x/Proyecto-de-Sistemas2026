<?php
require_once "../src/Models/Usuarios.php";
class UsuarioController{
    public function getAll()
    {
        $usuario=Usuarios::all();
        echo json_encode($usuario);
         
    }
}