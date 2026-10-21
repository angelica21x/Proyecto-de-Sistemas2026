<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../src/Router.php";
require_once __DIR__ . "/../src/Auth.php";
require_once __DIR__ . "/../src/Controllers/AuthController.php";
require_once __DIR__ . "/../src/Controllers/ProductoController.php";
require_once __DIR__ . "/../src/Controllers/EmpleadoController.php";
require_once __DIR__ . "/../src/Controllers/CategoriaController.php";
require_once __DIR__ . "/../src/Controllers/MovimientoController.php";
require_once __DIR__ . "/../src/Controllers/UbicacionController.php";
require_once __DIR__ . "/../src/Controllers/ProveedorController.php";
require_once __DIR__ . "/../src/Controllers/Detalle_MovimientoController.php";
require_once __DIR__ . "/../src/Controllers/UsuarioController.php";

use App\Router;

$route = new Router();

// Autenticación de cuentas y consulta de la sesión vigente.
$route->add('POST', '/auth/login', 'AuthController@login');
$route->add('GET', '/auth/me', 'AuthController@me');

// dirección para usuarios
$route->add('GET', '/', 'UsuarioController@getAll');
$route->add('GET', '/users', 'UsuarioController@getAll');
$route->add('GET', '/users/{id}', 'UsuarioController@getById');
$route->add('PUT', '/users/{id}', 'UsuarioController@update');
$route->add('POST', '/users', 'UsuarioController@add');
$route->add('DELETE', '/users/{id}', 'UsuarioController@delete');

// dirección de productos
$route->add('GET', '/productos', 'ProductoController@getAll');
$route->add('PUT', '/productos/{id}', 'ProductoController@update');
$route->add('POST', '/productos', 'ProductoController@add');
$route->add('DELETE', '/productos/{id}', 'ProductoController@delete');

// dirección de empleados
$route->add('GET', '/empleados', 'EmpleadoController@getAll');
$route->add('PUT', '/empleados/{id}', 'EmpleadoController@update');
$route->add('POST', '/empleados', 'EmpleadoController@add');
$route->add('DELETE', '/empleados/{id}', 'EmpleadoController@delete');

// dirección de categorías
$route->add('GET', '/categorias', 'CategoriaController@getAll');
$route->add('PUT', '/categorias/{id}', 'CategoriaController@update');
$route->add('POST', '/categorias', 'CategoriaController@add');
$route->add('DELETE', '/categorias/{id}', 'CategoriaController@delete');

// dirección de movimientos
$route->add('GET', '/movimientos', 'MovimientoController@getAll');
$route->add('PUT', '/movimientos/{id}', 'MovimientoController@update');
$route->add('POST', '/movimientos', 'MovimientoController@add');
$route->add('DELETE', '/movimientos/{id}', 'MovimientoController@delete');

// dirección de ubicaciones
$route->add('GET', '/ubicaciones', 'UbicacionController@getAll');
$route->add('PUT', '/ubicaciones/{id}', 'UbicacionController@update');
$route->add('POST', '/ubicaciones', 'UbicacionController@add');
$route->add('DELETE', '/ubicaciones/{id}', 'UbicacionController@delete');

// dirección de proveedores
$route->add('GET', '/proveedores', 'ProveedorController@getAll');
$route->add('PUT', '/proveedores/{id}', 'ProveedorController@update');
$route->add('POST', '/proveedores', 'ProveedorController@add');
$route->add('DELETE', '/proveedores/{id}', 'ProveedorController@delete');

// dirección de detalle de movimientos
$route->add('GET', '/detalle_movimientos', 'Detalle_MovimientoController@getAll');
$route->add('PUT', '/detalle_movimientos/{id}', 'Detalle_MovimientoController@update');
$route->add('POST', '/detalle_movimientos', 'Detalle_MovimientoController@add');
$route->add('DELETE', '/detalle_movimientos/{id}', 'Detalle_MovimientoController@delete');

// dirección de usuarios
$route->add('GET', '/usuarios', 'UsuarioController@getAll');
$route->add('GET', '/usuarios/{id}', 'UsuarioController@getById');
$route->add('PUT', '/usuarios/{id}', 'UsuarioController@update');
$route->add('POST', '/usuarios', 'UsuarioController@add');
$route->add('DELETE', '/usuarios/{id}', 'UsuarioController@delete');

$route->run();
