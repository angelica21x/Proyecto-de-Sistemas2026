<?php

require_once "../src/Models/Productos.php";

class ProductoController
{
    private array $camposObligatorios = [
        "codbarras",
        "nombre",
        "descripcion",
        "stock_actual",
        "stock_minimo",
        "precio_costo",
        "cod_categoria",
        "cod_ubicacion"
    ];

    public function getAll()
    {
        $producto = Productos::all();
        echo json_encode($producto);
    }

    private function validarDatosProducto($data): ?array
    {
        if (!is_array($data)) {
            return [
                "status" => "error",
                "message" => "Los datos enviados no son validos"
            ];
        }

        $camposFaltantes = [];

        foreach ($this->camposObligatorios as $campo) {
            if (!isset($data[$campo]) || trim((string) $data[$campo]) == "") {
                $camposFaltantes[] = $campo;
            }
        }

        if (count($camposFaltantes) > 0) {
            return [
                "status" => "error",
                "message" => "Faltan " . count($camposFaltantes) . " campo(s) obligatorio(s)",
                "campos_faltantes" => $camposFaltantes
            ];
        }

        return null;
    }

    // Actualizar producto
    public function update($id)
    {
        $jsonData = file_get_contents('php://input');
        $data = json_decode($jsonData, true);

        if (json_last_error() != JSON_ERROR_NONE) {
            echo json_encode([
                "status" => "error conversion",
                "message" => json_last_error_msg(),
            ]);
            return;
        }

        $error = $this->validarDatosProducto($data);
        if ($error) {
            echo json_encode($error);
            return;
        }

        $producto = Productos::update($id, $data);
        if ($producto) {
            echo json_encode([
                "status" => "true",
                "message" => "Producto actualizado correctamente"
            ]);
            return;
        }

        echo json_encode([
            "status" => "error",
            "message" => "No se pudo actualizar el producto"
        ]);
    }

    // Adicionar producto
    public function add()
    {
        $jsonData = file_get_contents('php://input');
        $data = json_decode($jsonData, true);

        if (json_last_error() != JSON_ERROR_NONE) {
            echo json_encode([
                "status" => "error conversion",
                "message" => json_last_error_msg(),
            ]);
            return;
        }

        $error = $this->validarDatosProducto($data);
        if ($error) {
            echo json_encode($error);
            return;
        }

        $producto = Productos::add($data);
        if ($producto) {
            echo json_encode([
                "status" => "true",
                "message" => "Producto adicionado correctamente"
            ]);
            return;
        }

        echo json_encode([
            "status" => "error",
            "message" => "No se pudo adicionar el producto"
        ]);
    }

    // Eliminar producto
    public function delete($id)
    {
        $producto = Productos::delete($id);
        if ($producto) {
            echo json_encode([
                "status" => "true",
                "message" => "Producto eliminado correctamente"
            ]);
            return;
        }

        echo json_encode([
            "status" => "error",
            "message" => "No se pudo eliminar el producto"
        ]);
    }
}
