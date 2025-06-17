<?php
// delete_post.php
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
    $data = json_decode(file_get_contents("php://input"), true);
    $post_id = $data['post_id'] ?? null;
    $user_id = $_SESSION['id'];

    if (empty($post_id)) {
        $response['message'] = 'ID de publicación no proporcionado.';
        echo json_encode($response);
        exit;
    }

    // Obtener la ruta de la imagen antes de eliminar la publicación
    $image_path_to_delete = null;
    $stmt_img = $mysqli->prepare("SELECT image_path FROM posts WHERE id = ? AND user_id = ?");
    $stmt_img->bind_param("ii", $post_id, $user_id);
    $stmt_img->execute();
    $stmt_img->bind_result($image_path_to_delete);
    $stmt_img->fetch();
    $stmt_img->close();

    $stmt = $mysqli->prepare("DELETE FROM posts WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $post_id, $user_id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            // Eliminar el archivo de imagen si existe
            if ($image_path_to_delete && file_exists('../' . $image_path_to_delete)) {
                unlink('../' . $image_path_to_delete);
            }
            $response['success'] = true;
            $response['message'] = 'Publicación eliminada exitosamente.';
        } else {
            $response['message'] = 'No se encontró la publicación o no tienes permisos para eliminarla.';
        }
    } else {
        $response['message'] = 'Error al eliminar la publicación: ' . $stmt->error;
    }

    $stmt->close();
} else {
    $response['message'] = 'Método de solicitud no válido.';
}

$mysqli->close();
echo json_encode($response);
?>