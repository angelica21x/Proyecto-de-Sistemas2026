<?php

abstract class CrudController
{
    protected string $modelClass;
    protected array $allowedFields;
    protected array $requiredFields;

    public function getAll(): void
    {
        $model = $this->modelClass;
        echo json_encode($model::all());
    }

    public function getById($id): void
    {
        $model = $this->modelClass;
        $rows = $model::findById($id);
        if (!$rows) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Registro no encontrado']);
            return;
        }
        echo json_encode($rows[0]);
    }

    public function add(): void
    {
        $data = $this->readJson();
        if ($data === null) {
            return;
        }
        $data = $this->prepareWriteData($data, true);
        if ($data === null || !$this->validate($data, true)) return;

        try {
            $model = $this->modelClass;
            $id = $model::add($data);
            if ($id) {
                http_response_code(201);
                echo json_encode(['status' => 'true', 'message' => 'Registro creado correctamente', 'id' => $id]);
                return;
            }
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'No se pudo crear el registro']);
        } catch (Throwable $error) {
            $this->writeError($error);
        }
    }

    public function update($id): void
    {
        $data = $this->readJson();
        if ($data === null) {
            return;
        }
        $data = $this->prepareWriteData($data, false);
        if ($data === null || !$this->validate($data, false)) return;

        try {
            $model = $this->modelClass;
            if ($model::update($id, $data)) {
                echo json_encode(['status' => 'true', 'message' => 'Registro actualizado correctamente']);
                return;
            }
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar el registro']);
        } catch (Throwable $error) {
            $this->writeError($error);
        }
    }

    public function delete($id): void
    {
        try {
            $model = $this->modelClass;
            if ($model::delete($id)) {
                echo json_encode(['status' => 'true', 'message' => 'Registro eliminado correctamente']);
                return;
            }
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'No se pudo eliminar el registro']);
        } catch (Throwable $error) {
            $this->writeError($error);
        }
    }

    protected function prepareWriteData(array $data, bool $creating): ?array
    {
        return $data;
    }

    protected function writeError(Throwable $error): void
    {
        $sqlState = (string) $error->getCode();
        http_response_code(str_starts_with($sqlState, '23') ? 409 : 500);
        echo json_encode([
            'status' => 'error',
            'message' => 'No se pudo guardar el cambio en la base de datos.',
            'detail' => $error->getMessage()
        ]);
    }

    private function readJson(): ?array
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'El cuerpo debe ser un objeto JSON válido']);
            return null;
        }
        return $data;
    }

    private function validate(array $data, bool $creating): bool
    {
        unset($data['id']);
        $unknown = array_diff(array_keys($data), $this->allowedFields);
        if ($unknown) {
            http_response_code(422);
            echo json_encode(['status' => 'error', 'message' => 'Campos no permitidos', 'fields' => array_values($unknown)]);
            return false;
        }

        $missing = [];
        foreach ($this->requiredFields as $field) {
            if (!array_key_exists($field, $data) || $data[$field] === null || (is_string($data[$field]) && trim($data[$field]) === '')) {
                $missing[] = $field;
            }
        }
        if ($missing) {
            http_response_code(422);
            echo json_encode(['status' => 'error', 'message' => 'Faltan campos obligatorios', 'fields' => $missing]);
            return false;
        }

        if (!$creating && !$data) {
            http_response_code(422);
            echo json_encode(['status' => 'error', 'message' => 'Envía al menos un campo para actualizar']);
            return false;
        }
        return true;
    }
}
