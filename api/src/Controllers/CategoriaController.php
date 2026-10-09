<?php
require_once __DIR__ . "/CrudController.php";
require_once __DIR__ . "/../Models/Categorias.php";
class CategoriaController extends CrudController
{
    protected string $modelClass = Categorias::class;
    protected array $allowedFields = ['nombre', 'descripcion'];
    protected array $requiredFields = ['nombre'];
}
