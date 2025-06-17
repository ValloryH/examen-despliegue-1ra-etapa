<?php
// register.php
require_once '../config.php';

header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    if (empty($username) || empty($email) || empty($password) || empty($confirm_password)) {
        $response['message'] = 'Por favor, rellena todos los campos.';
        echo json_encode($response);
        exit;
    }

    if ($password !== $confirm_password) {
        $response['message'] = 'Las contraseñas no coinciden.';
        echo json_encode($response);
        exit;
    }

    // Validar formato de email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Formato de email inválido.';
        echo json_encode($response);
        exit;
    }

    // Hash de la contraseña de forma segura
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Verificar si el usuario o email ya existen
    $stmt = $mysqli->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $username, $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $response['message'] = 'El nombre de usuario o el email ya están en uso.';
    } else {
        // Insertar nuevo usuario
        $stmt->close();
        $stmt = $mysqli->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $username, $email, $hashed_password);

        if ($stmt->execute()) {
            $response['success'] = true;
            $response['message'] = 'Registro exitoso. Ahora puedes iniciar sesión.';
        } else {
            $response['message'] = 'Error al registrar el usuario: ' . $stmt->error;
        }
    }

    $stmt->close();
} else {
    $response['message'] = 'Método de solicitud no válido.';
}

$mysqli->close();
echo json_encode($response);
?>