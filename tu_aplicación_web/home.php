<?php
// Inicia la sesión PHP al principio de la página
session_start();

// Si el usuario no está logueado, redirigir a la página de inicio de sesión
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    header('Location: index.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prueba para examen</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="header">
        <h1>Prueba para examen</h1>
        <p>Bienvenido, <?php echo htmlspecialchars($_SESSION['username']); ?>!</p>
        <a href="php_scripts/logout.php" class="logout-btn">Cerrar Sesión</a>
    </div>

    <div class="container home-container">
        <div class="tab-buttons">
            <button class="tab-button active" onclick="showTab('all-posts-section')">Publicaciones</button>
            <button class="tab-button" onclick="showTab('my-posts-section')">Mis Publicaciones</button>
            <button class="tab-button" onclick="showTab('admin-section')">Administrador de Usuarios</button>
        </div>

        <div id="all-posts-section" class="tab-content active">
            <h2>Publicaciones de Todos los Usuarios</h2>
            <div class="post-form">
                <h3>Crear Nueva Publicación</h3>
                <form id="createPostForm" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="postTitle">Título:</label>
                        <input type="text" id="postTitle" name="title" required>
                    </div>
                    <div class="form-group">
                        <label for="postContent">Contenido:</label>
                        <textarea id="postContent" name="content" rows="5" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="postImage">Imagen:</label>
                        <input type="file" id="postImage" name="image" accept="image/*">
                    </div>
                    <button type="submit">Publicar</button>
                </form>
                <div id="createPostMessage" class="message"></div>
            </div>

            <div class="posts-list" id="allPostsList">
                </div>
        </div>

        <div id="my-posts-section" class="tab-content">
            <h2>Mis Publicaciones (Editar/Eliminar)</h2>
            <div class="posts-list" id="myPostsList">
                </div>
        </div>

        <div id="admin-section" class="tab-content">
            <h2>Administrador de Usuarios</h2>
            <div class="users-list" id="usersList">
                </div>

            <div id="editUserModal" class="modal">
                <div class="modal-content">
                    <span class="close-button" onclick="closeModal('editUserModal')">&times;</span>
                    <h2>Editar Usuario</h2>
                    <form id="editUserForm">
                        <input type="hidden" id="editUserId" name="user_id">
                        <div class="form-group">
                            <label for="editUsername">Nombre de Usuario:</label>
                            <input type="text" id="editUsername" name="username" required>
                        </div>
                        <div class="form-group">
                            <label for="editUserEmail">Email:</label>
                            <input type="email" id="editUserEmail" name="email" required>
                        </div>
                        <button type="submit">Guardar Cambios</button>
                    </form>
                    <div id="editUserMessage" class="message"></div>
                </div>
            </div>
        </div>

        <div id="editPostModal" class="modal">
            <div class="modal-content">
                <span class="close-button" onclick="closeModal('editPostModal')">&times;</span>
                <h2>Editar Publicación</h2>
                <form id="editPostForm" enctype="multipart/form-data">
                    <input type="hidden" id="editPostId" name="post_id">
                    <div class="form-group">
                        <label for="editPostTitle">Título:</label>
                        <input type="text" id="editPostTitle" name="title" required>
                    </div>
                    <div class="form-group">
                        <label for="editPostContent">Contenido:</label>
                        <textarea id="editPostContent" name="content" rows="5" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="editPostImage">Cambiar Imagen:</label>
                        <input type="file" id="editPostImage" name="image" accept="image/*">
                        <p id="currentImageName"></p>
                    </div>
                    <button type="submit">Guardar Cambios</button>
                </form>
                <div id="editPostMessage" class="message"></div>
            </div>
        </div>

    </div> <script>
        // Esta línea es CRUCIAL para que JavaScript sepa el ID del usuario actual
        // La usaremos en script.js para decidir qué botones mostrar.
        const currentUserId = <?php echo isset($_SESSION['id']) ? $_SESSION['id'] : 'null'; ?>;
    </script>
    <script src="script.js"></script>
</body>
</html>