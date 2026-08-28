<?php

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

require_once "../src/Router.php";
require_once "../src/Controllers/UserController.php";
require_once "../src/Controllers/ProductoController.php";
require_once "../src/Controllers/EmpleadoController.php";
require_once "../src/Controllers/CategoriaController.php";
require_once "../src/Controllers/MovimientoController.php";
require_once "../src/Controllers/UbicacionController.php";
require_once "../src/Controllers/ProveedorController.php";
require_once "../src/Controllers/Detalle_MovimientoController.php";
require_once "../src/Controllers/UsuarioController.php";

use App\Router;

$route = new Router();

// dirección para usuarios
$route->add('GET', '/', 'UserController@getAll');
$route->add('GET', '/users', 'UserController@getAll');

// dirección de productos
$route->add('GET', '/productos', 'ProductoController@getAll');
$route->add('PUT', '/productos/{id}', 'ProductoController@update');
$route->add('POST', '/productos', 'ProductoController@add');
$route->add('DELETE', '/productos/{id}', 'ProductoController@delete');

// dirección de empleados
$route->add('GET', '/empleados', 'EmpleadoController@getAll');

// dirección de categorías
$route->add('GET', '/categorias', 'CategoriaController@getAll');

// dirección de movimientos
$route->add('GET', '/movimientos', 'MovimientoController@getAll');

// dirección de ubicaciones
$route->add('GET', '/ubicaciones', 'UbicacionController@getAll');

// dirección de proveedores
$route->add('GET', '/proveedores', 'ProveedorController@getAll');

// dirección de detalle de movimientos
$route->add('GET', '/detalle_movimientos', 'Detalle_MovimientoController@getAll');

// dirección de usuarios
$route->add('GET', '/usuarios', 'UsuarioController@getAll');

$route->run();
