<?php
// update_post.php
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
    $post_id = $_POST['post_id'] ?? null;
    $title = trim($_POST['title'] ?? '');
    $content = trim($_POST['content'] ?? '');
    $user_id = $_SESSION['id'];

    if (empty($post_id) || empty($title) || empty($content)) {
        $response['message'] = 'ID, título y contenido de la publicación no pueden estar vacíos.';
        echo json_encode($response);
        exit;
    }

    // Obtener la ruta de la imagen actual antes de actualizar
    $current_image_path = null;
    $stmt_img = $mysqli->prepare("SELECT image_path FROM posts WHERE id = ? AND user_id = ?");
    $stmt_img->bind_param("ii", $post_id, $user_id);
    $stmt_img->execute();
    $stmt_img->bind_result($current_image_path);
    $stmt_img->fetch();
    $stmt_img->close();

    $new_image_path = $current_image_path;

    // Manejo de la subida de imágenes para actualización
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $target_dir = "../uploads/";
        if (!is_dir($target_dir)) {
            mkdir($target_dir, 0777, true);
        }
        $image_name = basename($_FILES["image"]["name"]);
        $target_file = $target_dir . uniqid() . "_" . $image_name;
        $imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));

        $allowed_extensions = array("jpg", "jpeg", "png", "gif");
        if (!in_array($imageFileType, $allowed_extensions)) {
            $response['message'] = 'Solo se permiten archivos JPG, JPEG, PNG y GIF.';
            echo json_encode($response);
            exit;
        }

        if ($_FILES["image"]["size"] > 5 * 1024 * 1024) {
            $response['message'] = 'La imagen es demasiado grande. Máximo 5MB.';
            echo json_encode($response);
            exit;
        }

        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
            // Eliminar la imagen antigua si existe y es diferente a la nueva
            if ($current_image_path && file_exists('../' . $current_image_path)) {
                unlink('../' . $current_image_path);
            }
            $new_image_path = "uploads/" . basename($target_file);
        } else {
            $response['message'] = 'Hubo un error al subir la nueva imagen.';
            echo json_encode($response);
            exit;
        }
    }

    $stmt = $mysqli->prepare("UPDATE posts SET title = ?, content = ?, image_path = ? WHERE id = ? AND user_id = ?");
    $stmt->bind_param("sssii", $title, $content, $new_image_path, $post_id, $user_id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            $response['success'] = true;
            $response['message'] = 'Publicación actualizada exitosamente.';
        } else {
            $response['message'] = 'No se encontró la publicación o no hay cambios que guardar.';
        }
    } else {
        $response['message'] = 'Error al actualizar la publicación: ' . $stmt->error;
    }

    $stmt->close();
} else {
    $response['message'] = 'Método de solicitud no válido.';
}

$mysqli->close();
echo json_encode($response);
?>