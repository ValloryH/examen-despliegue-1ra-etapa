<?php
// register.php
session_start();
require_once '../config.php'; // La ruta es relativa a register.php

header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($email) || empty($password)) {
        $response['message'] = 'Por favor, rellena todos los campos.';
        echo json_encode($response);
        exit;
    }

    // Hashear la contraseña
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Preparar la consulta para insertar el nuevo usuario
    $stmt = $mysqli->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    if ($stmt) {
        $stmt->bind_param("sss", $username, $email, $hashed_password);
        if ($stmt->execute()) {
            $response['success'] = true;
            $response['message'] = 'Registro exitoso. Ya puedes iniciar sesión.';
        } else {
            $response['message'] = 'Error al registrar el usuario: ' . $stmt->error;
        }
        $stmt->close();
    } else {
        $response['message'] = 'Error al preparar la consulta: ' . $mysqli->error;
    }
} else {
    $response['message'] = 'Método de solicitud no permitido.';
}

$mysqli->close();
echo json_encode($response);
?>