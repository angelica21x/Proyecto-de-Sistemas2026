<?php
require_once __DIR__ . "/CrudModel.php";
class Ubicaciones extends CrudModel
{
    protected static string $table = 'ubicaciones';
    protected static array $fields = ['zona_sector', 'pasillo', 'estante', 'nivel_balda'];
}
