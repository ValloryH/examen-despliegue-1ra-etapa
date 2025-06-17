<?php
// update_user.php
session_start();
require_once '../config.php';

header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    $response['message'] = 'No autorizado. Por favor, inicie sesión.';
    echo json_encode($response);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id_to_update = $_POST['user_id'] ?? null;
    $new_username = trim($_POST['username'] ?? '');
    $new_email = trim($_POST['email'] ?? '');

    if (empty($user_id_to_update) || empty($new_username) || empty($new_email)) {
        $response['message'] = 'Todos los campos son requeridos para actualizar el usuario.';
        echo json_encode($response);
        exit;
    }

    if (!filter_var($new_email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Formato de email inválido.';
        echo json_encode($response);
        exit;
    }

    // Opcional: Para una aplicación real, se debería verificar si el usuario logueado
    // tiene permisos para editar a otros usuarios (ej. si es un administrador).
    // Por simplicidad para el examen, cualquier usuario logueado puede intentar editar.
    // Aunque en la página solo se muestra el botón de editar al usuario logueado,
    // es buena práctica verificarlo también en el backend.

    // Verificar si el nuevo username o email ya existen para otro usuario
    $stmt_check = $mysqli->prepare("SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?");
    $stmt_check->bind_param("ssi", $new_username, $new_email, $user_id_to_update);
    $stmt_check->execute();
    $stmt_check->store_result();

    if ($stmt_check->num_rows > 0) {
        $response['message'] = 'El nombre de usuario o el email ya están en uso por otro usuario.';
        $stmt_check->close();
        echo json_encode($response);
        exit;
    }
    $stmt_check->close();

    $stmt = $mysqli->prepare("UPDATE users SET username = ?, email = ? WHERE id = ?");
    $stmt->bind_param("ssi", $new_username, $new_email, $user_id_to_update);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            $response['success'] = true;
            $response['message'] = 'Usuario actualizado exitosamente.';
            // Si el usuario actualizó sus propios datos, actualizar la sesión
            if ($_SESSION['id'] == $user_id_to_update) {
                $_SESSION['username'] = $new_username;
            }
        } else {
            $response['message'] = 'No se encontró el usuario o no hay cambios que guardar.';
        }
    } else {
        $response['message'] = 'Error al actualizar el usuario: ' . $stmt->error;
    }

    $stmt->close();
} else {
    $response['message'] = 'Método de solicitud no válido.';
}

$mysqli->close();
echo json_encode($response);
?>