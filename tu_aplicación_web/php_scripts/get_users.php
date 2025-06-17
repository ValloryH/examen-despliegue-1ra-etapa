<?php
// get_users.php
session_start();
require_once '../config.php';

header('Content-Type: application/json');

$response = ['success' => false, 'users' => [], 'message' => ''];

if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    $response['message'] = 'No autorizado. Por favor, inicie sesión.';
    echo json_encode($response);
    exit;
}

// Para propósitos de examen, mostraremos todos los usuarios.
// En una aplicación real, se debería verificar si el usuario tiene rol de administrador.
$stmt = $mysqli->prepare("SELECT id, username, email FROM users ORDER BY created_at DESC");
$stmt->execute();
$result = $stmt->get_result();

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

$response['success'] = true;
$response['users'] = $users;

$stmt->close();
$mysqli->close();
echo json_encode($response);
?>