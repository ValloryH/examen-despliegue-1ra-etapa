<?php
// create_post.php
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
    $user_id = $_SESSION['id'];
    $title = trim($_POST['title'] ?? '');
    $content = trim($_POST['content'] ?? '');
    $image_path = null;

    if (empty($title) || empty($content)) {
        $response['message'] = 'El título y el contenido de la publicación no pueden estar vacíos.';
        echo json_encode($response);
        exit;
    }

    // Manejo de la subida de imágenes
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $target_dir = "../uploads/";
        if (!is_dir($target_dir)) {
            mkdir($target_dir, 0777, true);
        }
        $image_name = basename($_FILES["image"]["name"]);
        $target_file = $target_dir . uniqid() . "_" . $image_name; // Add unique ID to prevent overwriting
        $imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));

        // Permitir ciertos formatos de archivo
        $allowed_extensions = array("jpg", "jpeg", "png", "gif");
        if (!in_array($imageFileType, $allowed_extensions)) {
            $response['message'] = 'Solo se permiten archivos JPG, JPEG, PNG y GIF.';
            echo json_encode($response);
            exit;
        }

        // Verificar tamaño del archivo (ej. 5MB)
        if ($_FILES["image"]["size"] > 5 * 1024 * 1024) {
            $response['message'] = 'La imagen es demasiado grande. Máximo 5MB.';
            echo json_encode($response);
            exit;
        }

        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
            $image_path = "uploads/" . basename($target_file); // Save relative path
        } else {
            $response['message'] = 'Hubo un error al subir la imagen.';
            echo json_encode($response);
            exit;
        }
    }

    $stmt = $mysqli->prepare("INSERT INTO posts (user_id, title, content, image_path) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isss", $user_id, $title, $content, $image_path);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Publicación creada exitosamente.';
    } else {
        $response['message'] = 'Error al crear la publicación: ' . $stmt->error;
    }

    $stmt->close();
} else {
    $response['message'] = 'Método de solicitud no válido.';
}

$mysqli->close();
echo json_encode($response);
?>