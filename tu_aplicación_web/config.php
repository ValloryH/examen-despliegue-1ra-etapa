<?php
// config.php
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root'); // Usuario por defecto de XAMPP/WAMP
define('DB_PASSWORD', '');     // Contraseña vacía por defecto de XAMPP/WAMP
define('DB_NAME', 'u178928053_examen_jh'); 

// Intentar conectar a la base de datos MySQL
$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Verificar la conexión
if ($mysqli->connect_error) {
    die("Error de conexión a la base de datos: " . $mysqli->connect_error);
}
?>