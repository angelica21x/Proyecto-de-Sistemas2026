<?php

require_once __DIR__ . "/../Config/conexionDB.php";

abstract class CrudModel
{
    protected static string $table;
    protected static array $fields;

    public static function all(): array
    {
        return ConexionPDO::query("SELECT * FROM " . static::$table);
    }

    public static function findById($id): array
    {
        return ConexionPDO::query('SELECT * FROM ' . static::$table . ' WHERE id = :id', [':id' => $id]);
    }

    public static function add(array $data)
    {
        $data = self::filterFields($data);
        if (!$data) {
            return false;
        }

        $columns = array_keys($data);
        $placeholders = array_map(static fn($field) => ':v_' . $field, $columns);
        $values = [];
        foreach ($data as $field => $value) {
            $values[':v_' . $field] = $value;
        }

        $sql = 'INSERT INTO ' . static::$table . ' (' . implode(', ', $columns) . ') VALUES (' . implode(', ', $placeholders) . ')';
        return ConexionPDO::execute($sql, $values, true);
    }

    public static function update($id, array $data): bool
    {
        unset($data['id']);
        $data = self::filterFields($data);
        if (!$data) {
            return false;
        }

        $sets = [];
        $values = [':id' => $id];
        foreach ($data as $field => $value) {
            $sets[] = $field . ' = :v_' . $field;
            $values[':v_' . $field] = $value;
        }

        $sql = 'UPDATE ' . static::$table . ' SET ' . implode(', ', $sets) . ' WHERE id = :id';
        return (bool) ConexionPDO::execute($sql, $values, false);
    }

    public static function delete($id): bool
    {
        if (!static::findById($id)) {
            return false;
        }
        return (bool) ConexionPDO::execute(
            'DELETE FROM ' . static::$table . ' WHERE id = :id',
            [':id' => $id],
            false
        );
    }

    private static function filterFields(array $data): array
    {
        unset($data['id']);
        return array_intersect_key($data, array_flip(static::$fields));
    }
}
