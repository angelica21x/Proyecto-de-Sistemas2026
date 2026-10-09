<?php

require_once __DIR__ . "/../Models/Productos.php";

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
    private array $camposPermitidos = [
        'codbarras', 'nombre', 'descripcion', 'stock_actual', 'stock_minimo',
        'precio_costo', 'cod_categoria', 'cod_ubicacion'
    ];

    public function getAll()
    {
        $producto = Productos::all();
        echo json_encode($producto);
    }

    private function validarDatosProducto($data): ?array
    {
        if (!is_array($data)) {
            http_response_code(400);
            return [
                "status" => "error",
                "message" => "Los datos enviados no son validos"
            ];
        }

        $camposDesconocidos = array_diff(array_keys($data), $this->camposPermitidos);
        if ($camposDesconocidos) {
            http_response_code(422);
            return [
                'status' => 'error',
                'message' => 'Hay campos no permitidos',
                'campos' => array_values($camposDesconocidos)
            ];
        }

        $camposFaltantes = [];

        foreach ($this->camposObligatorios as $campo) {
            if (!isset($data[$campo]) || trim((string) $data[$campo]) == "") {
                $camposFaltantes[] = $campo;
            }
        }

        if (count($camposFaltantes) > 0) {
            http_response_code(422);
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
            http_response_code(400);
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

        try {
            $producto = Productos::update($id, $data);
        } catch (Throwable $error) {
            $this->errorBaseDatos($error);
            return;
        }
        if ($producto) {
            echo json_encode([
                "status" => "true",
                "message" => "Producto actualizado correctamente"
            ]);
            return;
        }

        http_response_code(404);
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
            http_response_code(400);
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

        try {
            $producto = Productos::add($data);
        } catch (Throwable $error) {
            $this->errorBaseDatos($error);
            return;
        }
        if ($producto) {
            http_response_code(201);
            echo json_encode([
                "status" => "true",
                "message" => "Producto adicionado correctamente"
            ]);
            return;
        }

        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "No se pudo adicionar el producto"
        ]);
    }

    // Eliminar producto
    public function delete($id)
    {
        try {
            $producto = Productos::delete($id);
        } catch (Throwable $error) {
            $this->errorBaseDatos($error);
            return;
        }
        if ($producto) {
            echo json_encode([
                "status" => "true",
                "message" => "Producto eliminado correctamente"
            ]);
            return;
        }

        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "No se pudo eliminar el producto"
        ]);
    }

    private function errorBaseDatos(Throwable $error): void
    {
        $sqlState = (string) $error->getCode();
        http_response_code(str_starts_with($sqlState, '23') ? 409 : 500);
        echo json_encode([
            'status' => 'error',
            'message' => 'No se pudo guardar el cambio en la base de datos.',
            'detail' => $error->getMessage()
        ]);
    }
}
