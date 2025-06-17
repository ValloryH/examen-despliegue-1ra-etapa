document.addEventListener('DOMContentLoaded', () => {
    // --- Variables Comunes para Login/Registro y Publicaciones ---
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');
    const publicPostsList = document.getElementById('publicPostsList'); // Nueva lista para index.php

    // --- Variables para la Página Principal (home.php) ---
    const allPostsList = document.getElementById('allPostsList');
    const myPostsList = document.getElementById('myPostsList');
    const createPostForm = document.getElementById('createPostForm');
    const createPostMessage = document.getElementById('createPostMessage');
    const editPostModal = document.getElementById('editPostModal');
    const editPostForm = document.getElementById('editPostForm');
    const editPostMessage = document.getElementById('editPostMessage');
    const usersList = document.getElementById('usersList');
    const editUserModal = document.getElementById('editUserModal');
    const editUserForm = document.getElementById('editUserForm');
    const editUserMessage = document.getElementById('editUserMessage');

    // Esta variable almacenará el ID del usuario actual.
    // Será 'null' si no hay sesión (en index.php), o el ID del usuario si está logueado (en home.php).
    let currentUserId = null;


    // --- Lógica de Autenticación (Login/Registro) ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const response = await fetch('php_scripts/login.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                loginMessage.className = 'message success';
                loginMessage.textContent = data.message;
                window.location.href = 'home.php'; // Redirigir a home.php si el login es exitoso
            } else {
                loginMessage.className = 'message error';
                loginMessage.textContent = data.message;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const response = await fetch('php_scripts/register.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                registerMessage.className = 'message success';
                registerMessage.textContent = data.message;
                registerForm.reset();
                // Opcional: mostrar un mensaje que sugiera iniciar sesión
            } else {
                registerMessage.className = 'message error';
                registerMessage.textContent = data.message;
            }
        });
    }

    // --- Lógica para Pestañas (Solo en home.php) ---
    // Esta función solo se ejecutará si los elementos de tabs existen (es decir, en home.php)
    window.showTab = (tabId) => {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');
        document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');

        // Cargar datos cuando se abre la pestaña
        if (tabId === 'all-posts-section') {
            fetchAllPosts(); // Carga todas las publicaciones para usuarios logueados
        } else if (tabId === 'my-posts-section') {
            fetchMyPosts(); // Carga solo las publicaciones del usuario actual
        } else if (tabId === 'admin-section') {
            fetchUsers();
        }
    };


    // --- Funciones para manejar Publicaciones ---

    // Función principal para obtener y mostrar publicaciones
    // Se usa tanto en index.php (para todos) como en home.php (para la pestaña "Publicaciones")
    async function fetchAndDisplayPosts(targetListElement, phpScriptUrl, isEditable = false) {
        if (!targetListElement) return; // Asegurarse de que el elemento existe

        // Para evitar problemas de caché con `get_posts.php` en usuarios no logueados,
        // puedes añadir un parámetro de caché al URL.
        const response = await fetch(phpScriptUrl + '?_cachebust=' + new Date().getTime());
        const data = await response.json();

        targetListElement.innerHTML = ''; // Limpiar la lista actual de publicaciones

        if (data.success && data.posts.length > 0) {
            data.posts.forEach(post => {
                const postItem = document.createElement('div');
                postItem.className = 'post-item';

                // Determinar si los botones de editar/eliminar deben mostrarse
                const showActions = isEditable && (currentUserId !== null && post.user_id == currentUserId);

                postItem.innerHTML = `
                    <h3>${escapeHtml(post.title)}</h3>
                    <p>Por: <strong>${escapeHtml(post.author_username || 'Usuario Desconocido')}</strong></p>
                    <p>${escapeHtml(post.content)}</p>
                    ${post.image_path ? `<img src="${escapeHtml(post.image_path)}" alt="Imagen de Publicación">` : ''}
                    <small>Publicado: ${post.created_at}</small>
                    ${showActions ? `
                        <div class="post-actions">
                            <button class="edit-btn" onclick="openEditPostModal(${post.id}, '${escapeHtml(post.title)}', '${escapeHtml(post.content)}', '${escapeHtml(post.image_path || '')}')">Editar</button>
                            <button class="delete-btn" onclick="deletePost(${post.id})">Eliminar</button>
                        </div>
                    ` : ''}
                `;
                targetListElement.appendChild(postItem);
            });
        } else {
            targetListElement.innerHTML = '<p>No hay publicaciones para mostrar.</p>';
        }
    }

    // Funciones específicas para cada contexto de carga
    async function fetchPublicPosts() {
        // En index.php, currentUserId es null, isEditable es false.
        await fetchAndDisplayPosts(publicPostsList, 'php_scripts/get_posts.php', false);
    }

    async function fetchAllPosts() {
        // En home.php, currentUserId tiene el ID de sesión, isEditable es false.
        await fetchAndDisplayPosts(allPostsList, 'php_scripts/get_posts.php', false);
    }

    async function fetchMyPosts() {
        // En home.php, currentUserId tiene el ID de sesión, isEditable es true.
        await fetchAndDisplayPosts(myPostsList, 'php_scripts/get_my_posts.php', true);
    }

    // --- Inicialización de la Carga de Publicaciones ---
    // Si estamos en la página de inicio (index.php), cargar las publicaciones públicas
    if (publicPostsList) {
        fetchPublicPosts();
    }
    // Si estamos en la página principal (home.php), inicializar la vista de pestañas y obtener currentUserId
    else if (document.getElementById('all-posts-section')) {
        // Asegúrate de que currentUserId esté definido en home.php
        // home.php debe incluir: <script> const currentUserId = <?php echo isset($_SESSION['id']) ? $_SESSION['id'] : 'null'; ?>; </script>
        // Si no lo haces, currentUserId será 'null' aquí, lo cual es incorrecto para home.php.
        // O mejor aún, pasamos el user_id de la sesión a través de otro método seguro (como un data-attribute)
        // Por ahora, asumimos que 'currentUserId' está disponible globalmente si home.php lo inyecta.
        // Si no está, las acciones de editar/borrar en "Mis Publicaciones" no aparecerán.

        // Si tienes la variable currentUserId definida globalmente por PHP en home.php:
        // currentUserId = window.currentUserId; // o como la estés pasando

        // O, la forma más limpia: obtenemos el ID del usuario del mismo script get_my_posts
        // o asumimos que solo se activan las acciones si estás logueado.
        // Para simplificar, asumiremos que si estamos en home.php, es porque hay un usuario logueado.
        // Y las funciones update_post.php y delete_post.php ya verifican la sesión.

        // Para hacer que currentUserId esté disponible aquí de forma segura:
        // En home.php, dentro de la etiqueta <script src="script.js"></script>, y ANTES de ella:
        // <script> const userSessionId = <?php echo isset($_SESSION['id']) ? $_SESSION['id'] : 'null'; ?>; </script>
        // Y aquí en script.js:
        // if (typeof userSessionId !== 'undefined' && userSessionId !== null) {
        //    currentUserId = userSessionId;
        // }

        // Dado que el usuario ya está logueado para llegar a home.php,
        // simplemente se ejecutará el showTab por defecto para "Publicaciones"
        showTab('all-posts-section');
    }


    // Lógica para crear una publicación (solo si el formulario existe, es decir, en home.php)
    if (createPostForm) {
        createPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(createPostForm);
            const response = await fetch('php_scripts/create_post.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                createPostMessage.className = 'message success';
                createPostMessage.textContent = data.message;
                createPostForm.reset();
                fetchAllPosts(); // Refrescar todas las publicaciones
                if (document.getElementById('my-posts-section').classList.contains('active')) {
                    fetchMyPosts(); // Refrescar mis publicaciones si la pestaña está activa
                }
            } else {
                createPostMessage.className = 'message error';
                createPostMessage.textContent = data.message;
            }
        });
    }

    // Lógica para abrir el modal de edición de publicación
    window.openEditPostModal = (id, title, content, imagePath) => {
        if (!editPostModal) return; // Asegurarse de que el modal existe (solo en home.php)
        document.getElementById('editPostId').value = id;
        document.getElementById('editPostTitle').value = title;
        document.getElementById('editPostContent').value = content;
        document.getElementById('currentImageName').textContent = imagePath ? `Imagen actual: ${imagePath.split('/').pop()}` : 'No hay imagen actual';
        editPostModal.style.display = 'block';
    };

    // Lógica para enviar el formulario de edición de publicación
    if (editPostForm) {
        editPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(editPostForm);
            const response = await fetch('php_scripts/update_post.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                editPostMessage.className = 'message success';
                editPostMessage.textContent = data.message;
                setTimeout(() => {
                    closeModal('editPostModal');
                    fetchAllPosts();
                    fetchMyPosts();
                    editPostMessage.textContent = '';
                }, 1500);
            } else {
                editPostMessage.className = 'message error';
                editPostMessage.textContent = data.message;
            }
        });
    }

    // Lógica para eliminar una publicación
    window.deletePost = async (id) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
            const response = await fetch('php_scripts/delete_post.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ post_id: id })
            });
            const data = await response.json();

            if (data.success) {
                alert(data.message);
                fetchAllPosts();
                fetchMyPosts();
            } else {
                alert(data.message);
            }
        }
    };


    // --- Funciones para el Administrador de Usuarios (Solo en home.php si existe la sección) ---
    async function fetchUsers() {
        if (!usersList) return; // Asegurarse de que el elemento existe
        const response = await fetch('php_scripts/get_users.php');
        const data = await response.json();
        usersList.innerHTML = '';

        if (data.success && data.users.length > 0) {
            data.users.forEach(user => {
                const userItem = document.createElement('div');
                userItem.className = 'user-item';
                userItem.innerHTML = `
                    <h3>${escapeHtml(user.username)}</h3>
                    <p>Email: ${escapeHtml(user.email)}</p>
                    <div class="user-actions">
                        <button class="edit-btn" onclick="openEditUserModal(${user.id}, '${escapeHtml(user.username)}', '${escapeHtml(user.email)}')">Editar</button>
                        <button class="delete-btn" onclick="deleteUser(${user.id})">Eliminar</button>
                    </div>
                `;
                usersList.appendChild(userItem);
            });
        } else {
            usersList.innerHTML = '<p>No hay usuarios para mostrar.</p>';
        }
    }

    window.openEditUserModal = (id, username, email) => {
        if (!editUserModal) return; // Asegurarse de que el modal existe
        document.getElementById('editUserId').value = id;
        document.getElementById('editUsername').value = username;
        document.getElementById('editUserEmail').value = email;
        editUserModal.style.display = 'block';
    };

    if (editUserForm) {
        editUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(editUserForm);
            const response = await fetch('php_scripts/update_user.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                editUserMessage.className = 'message success';
                editUserMessage.textContent = data.message;
                setTimeout(() => {
                    closeModal('editUserModal');
                    fetchUsers();
                    editUserMessage.textContent = '';
                }, 1500);
            } else {
                editUserMessage.className = 'message error';
                editUserMessage.textContent = data.message;
            }
        });
    }

    window.deleteUser = async (id) => {
        if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            const response = await fetch('php_scripts/delete_user.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: id })
            });
            const data = await response.json();

            if (data.success) {
                alert(data.message);
                fetchUsers();
            } else {
                alert(data.message);
            }
        }
    };


    // --- Funciones Generales ---

    // Función para cerrar cualquier modal
    window.closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            // Limpiar mensajes al cerrar modal
            if (modalId === 'editPostModal' && editPostMessage) editPostMessage.textContent = '';
            if (modalId === 'editUserModal' && editUserMessage) editUserMessage.textContent = '';
        }
    };

    // Función de utilidad para escapar HTML (previene XSS)
    function escapeHtml(text) {
        // Asegurarse de que 'text' no sea null o undefined
        if (text === null || typeof text === 'undefined') {
            return '';
        }
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    // --- Lógica para Pestañas de Autenticación (solo en index.php) ---
    window.showAuthTab = (tabId) => {
        document.querySelectorAll('.auth-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');
        document.querySelector(`.tab-button[onclick="showAuthTab('${tabId}')"]`).classList.add('active');
    };

    // Inicializar la pestaña de login/registro si los elementos existen
    if (document.getElementById('login-tab') && document.getElementById('register-tab')) {
        showAuthTab('login-tab'); // Mostrar la pestaña de Iniciar Sesión por defecto
    }
});