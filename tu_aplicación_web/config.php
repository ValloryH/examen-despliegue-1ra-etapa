<?php
// config.php
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root'); // Tu usuario de MySQL
define('DB_PASSWORD', '');     // Tu contraseña de MySQL
define('DB_NAME', 'mi_examen_db');

// Intentar conectar a la base de datos MySQL
$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Verificar la conexión
if ($mysqli->connect_error) {
    die("Error de conexión a la base de datos: " . $mysqli->connect_error);
}
?>