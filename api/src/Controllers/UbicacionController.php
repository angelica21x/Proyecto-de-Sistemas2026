<?php
require_once __DIR__ . "/CrudController.php";
require_once __DIR__ . "/../Models/Ubicaciones.php";
class UbicacionController extends CrudController
{
    protected string $modelClass = Ubicaciones::class;
    protected array $allowedFields = ['zona_sector', 'pasillo', 'estante', 'nivel_balda'];
    protected array $requiredFields = ['zona_sector', 'pasillo', 'estante', 'nivel_balda'];
}
