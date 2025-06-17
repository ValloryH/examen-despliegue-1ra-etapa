document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica para la página de Login/Registro (index.php) ---
    // Si estás en la página de login/registro, ejecuta su lógica
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');

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
                window.location.href = 'home.php'; // Redirigir a home.php
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
            } else {
                registerMessage.className = 'message error';
                registerMessage.textContent = data.message;
            }
        });
    }

    // --- Lógica para la página principal (home.php) ---
    // Seleccionar los contenedores de las listas de publicaciones
    const allPostsList = document.getElementById('allPostsList'); // Lista de TODAS las publicaciones
    const myPostsList = document.getElementById('myPostsList');   // Lista de MIS publicaciones
    const createPostForm = document.getElementById('createPostForm');
    const createPostMessage = document.getElementById('createPostMessage');
    const editPostModal = document.getElementById('editPostModal');
    const editPostForm = document.getElementById('editPostForm');
    const editPostMessage = document.getElementById('editPostMessage');
    const usersList = document.getElementById('usersList');
    const editUserModal = document.getElementById('editUserModal');
    const editUserForm = document.getElementById('editUserForm');
    const editUserMessage = document.getElementById('editUserMessage');

    // Función para mostrar/ocultar pestañas
    window.showTab = (tabId) => {
        // Ocultar todas las secciones de contenido
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        // Desactivar todos los botones de pestaña
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });

        // Mostrar la sección de contenido seleccionada
        document.getElementById(tabId).classList.add('active');
        // Activar el botón de la pestaña seleccionada
        document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');

        // Cargar los datos específicos de cada pestaña cuando se abre
        if (tabId === 'all-posts-section') {
            fetchAllPosts(); // Carga todas las publicaciones
        } else if (tabId === 'my-posts-section') {
            fetchMyPosts(); // Carga solo las publicaciones del usuario actual
        } else if (tabId === 'admin-section') {
            fetchUsers(); // Carga la lista de usuarios para el admin
        }
    };

    // Carga inicial para la primera pestaña (Publicaciones de Todos)
    // Asegura que la pestaña "Publicaciones" se muestre y cargue al inicio
    if (document.getElementById('all-posts-section')) {
        showTab('all-posts-section');
    }

    // --- Funciones para manejar Publicaciones ---

    // Función para obtener y mostrar TODAS las publicaciones
    async function fetchAllPosts() {
        if (!allPostsList) return; // Asegurarse de que el elemento existe

        const response = await fetch('php_scripts/get_posts.php'); // Llama al script que trae TODAS las publicaciones
        const data = await response.json();
        allPostsList.innerHTML = ''; // Limpiar la lista actual de publicaciones

        if (data.success && data.posts.length > 0) {
            data.posts.forEach(post => {
                const postItem = document.createElement('div');
                postItem.className = 'post-item';
                // HTML para cada publicación, mostrando el autor. SIN botones de editar/eliminar.
                postItem.innerHTML = `
                    <h3>${escapeHtml(post.title)}</h3>
                    <p>Por: <strong>${escapeHtml(post.author_username)}</strong></p>
                    <p>${escapeHtml(post.content)}</p>
                    ${post.image_path ? `<img src="${escapeHtml(post.image_path)}" alt="Imagen de Publicación">` : ''}
                    <small>Publicado: ${post.created_at}</small>
                `;
                allPostsList.appendChild(postItem);
            });
        } else {
            allPostsList.innerHTML = '<p>No hay publicaciones para mostrar.</p>';
        }
    }

    // Función para obtener y mostrar SOLO las publicaciones del usuario actual
    async function fetchMyPosts() {
        if (!myPostsList) return; // Asegurarse de que el elemento existe

        const response = await fetch('php_scripts/get_my_posts.php'); // Llama al script que trae SOLO MIS publicaciones
        const data = await response.json();
        myPostsList.innerHTML = ''; // Limpiar la lista actual de publicaciones

        if (data.success && data.posts.length > 0) {
            data.posts.forEach(post => {
                const postItem = document.createElement('div');
                postItem.className = 'post-item';
                // HTML para cada publicación, incluyendo botones de editar/eliminar
                postItem.innerHTML = `
                    <h3>${escapeHtml(post.title)}</h3>
                    <p>${escapeHtml(post.content)}</p>
                    ${post.image_path ? `<img src="${escapeHtml(post.image_path)}" alt="Imagen de Publicación">` : ''}
                    <small>Publicado: ${post.created_at}</small>
                    <div class="post-actions">
                        <button class="edit-btn" onclick="openEditPostModal(${post.id}, '${escapeHtml(post.title)}', '${escapeHtml(post.content)}', '${escapeHtml(post.image_path || '')}')">Editar</button>
                        <button class="delete-btn" onclick="deletePost(${post.id})">Eliminar</button>
                    </div>
                `;
                myPostsList.appendChild(postItem);
            });
        } else {
            myPostsList.innerHTML = '<p>No tienes publicaciones aún.</p>';
        }
    }


    // Lógica para crear una publicación
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
                createPostForm.reset(); // Limpiar el formulario
                fetchAllPosts(); // Refrescar la lista de TODAS las publicaciones
                // Si el usuario está en la pestaña "Mis Publicaciones", también refrescar esa lista
                if (document.getElementById('my-posts-section').classList.contains('active')) {
                    fetchMyPosts();
                }
            } else {
                createPostMessage.className = 'message error';
                createPostMessage.textContent = data.message;
            }
        });
    }

    // Lógica para abrir el modal de edición de publicación
    window.openEditPostModal = (id, title, content, imagePath) => {
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
                    fetchAllPosts(); // Refrescar TODAS las publicaciones
                    fetchMyPosts(); // Refrescar MIS publicaciones
                    editPostMessage.textContent = ''; // Limpiar mensaje después de cerrar modal
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
                fetchAllPosts(); // Refrescar TODAS las publicaciones
                fetchMyPosts(); // Refrescar MIS publicaciones
            } else {
                alert(data.message);
            }
        }
    };


    // --- Funciones para el Administrador de Usuarios (Si aplica) ---
    // Asegúrate de que estas funciones existan si tienes la sección de administración
    // (Mantener el código de fetchUsers, openEditUserModal, editUserForm, deleteUser como lo tenías)
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
        document.getElementById(modalId).style.display = 'none';
        // Limpiar mensajes al cerrar modal (opcional, pero buena práctica)
        if (modalId === 'editPostModal' && editPostMessage) editPostMessage.textContent = '';
        if (modalId === 'editUserModal' && editUserMessage) editUserMessage.textContent = '';
    };

    // Función de utilidad para escapar HTML (previene XSS)
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

});