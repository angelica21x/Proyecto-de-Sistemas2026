# Frontend InventarioPro

## Preparar la API local

1. Inicia Apache y MySQL desde WAMP o XAMPP.
2. Crea la base `sistemadealmacenamiento` e importa `api/data/Base-principal.sql` y luego `api/data/llenarDatos.sql`.
3. Copia `api/.env.example` como `api/.env` y ajusta usuario, contraseña, host y puerto de MySQL.
4. Asegúrate de que Apache permita `.htaccess` y tenga habilitado `mod_rewrite`.
5. Define `APP_SECRET` en `api/.env` con una clave aleatoria de al menos 32 caracteres. Ejecuta `api/data/cuentas_roles.sql` una vez en la base de datos para crear las tres cuentas y sus hashes de contraseña.

## Inicio de sesión y roles

Abre `login.html` (la página principal redirige allí). La API devuelve un token temporal al validar el correo y la contraseña. El administrador tiene acceso completo; el almacenero puede gestionar productos y movimientos; el supervisor puede consultar inventario y reportes. La API valida estos permisos en cada solicitud.

## Abrir el frontend

Desde `frontend/`, ejecuta `npm run dev` y abre `http://127.0.0.1:5500`. El servidor incluido solo publica los archivos del frontend; PHP/MySQL debe seguir corriendo en Apache/WAMP. Entra en **Configuración** y escribe la URL base de la API de Apache, por ejemplo `http://localhost/Proyecto-de-Sistemas2026/api/public`.

La ruta relativa predeterminada funciona cuando frontend y API se sirven desde el mismo sitio. En **Configuración**, pulsa **Guardar y probar**; la aplicación consulta `/productos` para comprobar la conexión.

## Funciones disponibles

Dashboard y reportes consultan los datos reales. Productos, categorías, empleados, proveedores, ubicaciones, movimientos, entradas, salidas, detalle de movimientos y usuarios permiten listar, buscar, exportar a CSV, crear, editar y eliminar. Entradas y salidas son vistas filtradas de los movimientos.
