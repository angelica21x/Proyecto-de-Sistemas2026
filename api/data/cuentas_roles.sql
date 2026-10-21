INSERT INTO empleados (ci, nombre, apellidos, cargo)
VALUES ('USR-A001', 'Angelica', 'Administradora', 'ADMINISTRADOR')
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), nombre = VALUES(nombre), apellidos = VALUES(apellidos), cargo = VALUES(cargo);
SET @empleado_admin = LAST_INSERT_ID();

INSERT INTO empleados (ci, nombre, apellidos, cargo)
VALUES ('USR-A002', 'Roberto', 'Almacenero', 'ALMACENERO')
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), nombre = VALUES(nombre), apellidos = VALUES(apellidos), cargo = VALUES(cargo);
SET @empleado_almacen = LAST_INSERT_ID();

INSERT INTO empleados (ci, nombre, apellidos, cargo)
VALUES ('USR-A003', 'Caceres', 'Supervisor', 'SUPERVISOR')
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), nombre = VALUES(nombre), apellidos = VALUES(apellidos), cargo = VALUES(cargo);
SET @empleado_supervisor = LAST_INSERT_ID();

INSERT INTO usuarios (username, password_hash, rol, estado, cod_empleado) VALUES
('angelica@gmail.com', '$2y$10$HKGKbt935LlYi51KkVN8Ru5FCaUBYCgWGxNA9aqX2QmDnjSiYVvia', 'ADMINISTRADOR', 1, @empleado_admin),
('roberto@gmail.com', '$2y$10$pz0Tc.3E215JguatKbCnJ.5ICe.OohdtdQo4yPUvjnDu85j3HkN9G', 'ALMACENERO', 1, @empleado_almacen),
('caceres@gmail.com', '$2y$10$..7M.a/IDSEnNCLU90AgfeQQgo3cSELfj7ASWmCptFwmx86OG5WpC', 'SUPERVISOR', 1, @empleado_supervisor)
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  rol = VALUES(rol),
  estado = VALUES(estado),
  cod_empleado = VALUES(cod_empleado);
