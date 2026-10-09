<?php
include_once __DIR__ . "/../Config/conexionDB.php";

class Productos
{
    // Mostrar Producto
    public static function all()
    {
        $sql = "SELECT * FROM productos";
        return ConexionPDO::query($sql);
    }

    // Actualizar Producto
    public static function update($id, $data)
    {
        if (!self::findById($id)) {
            return false;
        }
        if (isset($data['id'])) {
            unset($data['id']);
        }

        if (empty($data)) {
            return false;
        }

        $campos = [];
        $valores = [];
        // construir datos
        foreach ($data as $columna => $valor) {
            $campos[] = "$columna=:$columna";
            $valores[":$columna"] = $valor;
        }
        $stringCampos = implode(", ", $campos);
        //preparamos la consulta
        $sql = "UPDATE productos SET $stringCampos WHERE id=:id";
        $valores[':id'] = $id;
        $result = ConexionPDO::execute($sql, $valores, false);
        //$sql = "SELECT * FROM productos";
        return $result; //ConexionPDO::query($sql);
    }
    // Adicionar Producto
    public static function add($data)
    {
        $campos = [];
        $parametros = [];
        $valores = [];
        // construir datos
        foreach ($data as $columna => $valor) {
            $campos[] = $columna;
            $parametros[] = ":$columna";
            $valores[":$columna"] = $valor;
        }

        if (empty($campos)) {
            return false;
        }

        $stringCampos = implode(", ", $campos);
        $stringParametros = implode(", ", $parametros);
        //preparamos la consulta
        $sql = "INSERT INTO productos ($stringCampos) VALUES ($stringParametros)";
        $result = ConexionPDO::execute($sql, $valores, true);
        return $result;
    }

    // Eliminar Producto
    public static function delete($id)
    {
        if (!self::findById($id)) {
            return false;
        }
        $sql = "DELETE FROM productos WHERE id=:id";
        $valores = [":id" => $id];
        $result = ConexionPDO::execute($sql, $valores, false);
        return $result;
    }

    public static function findById($id)
    {
        return ConexionPDO::query('SELECT id FROM productos WHERE id = :id', [':id' => $id]);
    }
}
