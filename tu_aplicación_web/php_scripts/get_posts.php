<?php
// get_posts.php
session_start();
require_once '../config.php';

header('Content-Type: application/json');

$response = ['success' => false, 'posts' => [], 'message' => ''];

if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    $response['message'] = 'No autorizado. Por favor, inicie sesión.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['id'];

// Obtener solo las publicaciones del usuario actual
$stmt = $mysqli->prepare("SELECT id, title, content, image_path, created_at FROM posts WHERE user_id = ? ORDER BY created_at DESC");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$posts = [];
while ($row = $result->fetch_assoc()) {
    $posts[] = $row;
}

$response['success'] = true;
$response['posts'] = $posts;

$stmt->close();
$mysqli->close();
echo json_encode($response);
?>