<?php
// get_posts.php
session_start();
require_once '../config.php';

header('Content-Type: application/json');

$response = ['success' => false, 'posts' => [], 'message' => ''];

// Comprobar si el usuario está logueado
/* if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    $response['message'] = 'No autorizado. Por favor, inicie sesión.';
    echo json_encode($response);
    exit;
} */

// Preparar la consulta SQL para obtener TODAS las publicaciones
// Hacemos un JOIN con la tabla 'users' para obtener el nombre de usuario (author_username)
// y el user_id de la publicación (p.user_id) para que JavaScript sepa quién la escribió.
$stmt = $mysqli->prepare("SELECT p.id, p.user_id, p.title, p.content, p.image_path, p.created_at, u.username AS author_username FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC");

// Ejecutar la consulta
$stmt->execute();
$result = $stmt->get_result();

$posts = [];
// Recorrer los resultados y guardarlos en un array
while ($row = $result->fetch_assoc()) {
    $posts[] = $row;
}

// Configurar la respuesta exitosa
$response['success'] = true;
$response['posts'] = $posts;

// Cerrar la consulta y la conexión a la base de datos
$stmt->close();
$mysqli->close();

// Enviar la respuesta JSON
echo json_encode($response);
?>