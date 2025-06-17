<?php
// get_my_posts.php
session_start();
require_once '../config.php';

header('Content-Type: application/json');

$response = ['success' => false, 'posts' => [], 'message' => ''];

// Comprobar si el usuario está logueado
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    $response['message'] = 'No autorizado. Por favor, inicie sesión.';
    echo json_encode($response);
    exit;
}

// Obtener el ID del usuario de la sesión
$user_id = $_SESSION['id'];

// Preparar la consulta SQL para obtener SOLO las publicaciones de este usuario
$stmt = $mysqli->prepare("SELECT id, user_id, title, content, image_path, created_at FROM posts WHERE user_id = ? ORDER BY created_at DESC");
$stmt->bind_param("i", $user_id); // Filtrar por el ID del usuario

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