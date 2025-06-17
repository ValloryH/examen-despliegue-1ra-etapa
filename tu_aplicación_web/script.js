document.addEventListener('DOMContentLoaded', () => {
    // === Login/Register Page Logic ===
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterButton = document.getElementById('showRegister');
    const showLoginButton = document.getElementById('showLogin');
    const loginFormWrapper = document.getElementById('login-form');
    const registerFormWrapper = document.getElementById('register-form');
    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');

    if (showRegisterButton) {
        showRegisterButton.addEventListener('click', (e) => {
            e.preventDefault();
            loginFormWrapper.style.display = 'none';
            registerFormWrapper.style.display = 'block';
            loginMessage.textContent = ''; // Clear messages
            registerMessage.textContent = '';
        });
    }

    if (showLoginButton) {
        showLoginButton.addEventListener('click', (e) => {
            e.preventDefault();
            registerFormWrapper.style.display = 'none';
            loginFormWrapper.style.display = 'block';
            loginMessage.textContent = ''; // Clear messages
            registerMessage.textContent = '';
        });
    }

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
                setTimeout(() => {
                    window.location.href = 'home.php';
                }, 1000);
            } else {
                loginMessage.className = 'message error';
                loginMessage.textContent = data.message;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                registerMessage.className = 'message error';
                registerMessage.textContent = 'Las contraseñas no coinciden.';
                return;
            }

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
                setTimeout(() => {
                    loginFormWrapper.style.display = 'block';
                    registerFormWrapper.style.display = 'none';
                    registerMessage.textContent = '';
                }, 2000);
            } else {
                registerMessage.className = 'message error';
                registerMessage.textContent = data.message;
            }
        });
    }

    // === Home Page Logic ===
    const postsList = document.getElementById('postsList');
    const createPostForm = document.getElementById('createPostForm');
    const createPostMessage = document.getElementById('createPostMessage');
    const editPostModal = document.getElementById('editPostModal');
    const editPostForm = document.getElementById('editPostForm');
    const editPostMessage = document.getElementById('editPostMessage');
    const usersList = document.getElementById('usersList');
    const editUserModal = document.getElementById('editUserModal');
    const editUserForm = document.getElementById('editUserForm');
    const editUserMessage = document.getElementById('editUserMessage');

    // Function to show/hide tabs
    window.showTab = (tabId) => {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');
        document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');

        // Load data when tab is opened
        if (tabId === 'posts-section') {
            fetchPosts();
        } else if (tabId === 'admin-section') {
            fetchUsers();
        }
    };

    // Initial load for the first active tab (Publicaciones)
    if (document.getElementById('posts-section')) {
        showTab('posts-section');
    }

    // --- Posts Section Functions ---

    async function fetchPosts() {
        const response = await fetch('php_scripts/get_posts.php');
        const data = await response.json();
        postsList.innerHTML = ''; // Clear current posts

        if (data.success && data.posts.length > 0) {
            data.posts.forEach(post => {
                const postItem = document.createElement('div');
                postItem.className = 'post-item';
                postItem.innerHTML = `
                    <h3>${post.title}</h3>
                    <p>${post.content}</p>
                    ${post.image_path ? `<img src="${post.image_path}" alt="Post Image">` : ''}
                    <div class="post-actions">
                        <button class="edit-btn" onclick="openEditPostModal(${post.id}, '${escapeHtml(post.title)}', '${escapeHtml(post.content)}', '${post.image_path || ''}')">Editar</button>
                        <button class="delete-btn" onclick="deletePost(${post.id})">Eliminar</button>
                    </div>
                `;
                postsList.appendChild(postItem);
            });
        } else {
            postsList.innerHTML = '<p>No hay publicaciones aún.</p>';
        }
    }

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
                fetchPosts(); // Refresh posts
            } else {
                createPostMessage.className = 'message error';
                createPostMessage.textContent = data.message;
            }
        });
    }

    window.openEditPostModal = (id, title, content, imagePath) => {
        document.getElementById('editPostId').value = id;
        document.getElementById('editPostTitle').value = title;
        document.getElementById('editPostContent').value = content;
        const currentImageNameElement = document.getElementById('currentImageName');
        if (imagePath) {
            const fileName = imagePath.split('/').pop();
            currentImageNameElement.textContent = `Imagen actual: ${fileName}`;
        } else {
            currentImageNameElement.textContent = 'No hay imagen actual.';
        }
        editPostModal.style.display = 'block';
    };

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
                    fetchPosts(); // Refresh posts
                    editPostMessage.textContent = '';
                }, 1500);
            } else {
                editPostMessage.className = 'message error';
                editPostMessage.textContent = data.message;
            }
        });
    }

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
                fetchPosts(); // Refresh posts
            } else {
                alert(data.message);
            }
        }
    };

    // --- User Admin Section Functions ---

    async function fetchUsers() {
        const response = await fetch('php_scripts/get_users.php');
        const data = await response.json();
        usersList.innerHTML = ''; // Clear current users

        if (data.success && data.users.length > 0) {
            data.users.forEach(user => {
                const userItem = document.createElement('div');
                userItem.className = 'user-item';
                userItem.innerHTML = `
                    <div class="user-info">
                        <p><strong>ID:</strong> ${user.id}</p>
                        <p><strong>Usuario:</strong> ${user.username}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                    </div>
                    <div class="user-actions">
                        <button onclick="openEditUserModal(${user.id}, '${escapeHtml(user.username)}', '${escapeHtml(user.email)}')">Editar</button>
                    </div>
                `;
                usersList.appendChild(userItem);
            });
        } else {
            usersList.innerHTML = '<p>No hay usuarios registrados aún.</p>';
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
                    fetchUsers(); // Refresh users
                    editUserMessage.textContent = '';
                }, 1500);
            } else {
                editUserMessage.className = 'message error';
                editUserMessage.textContent = data.message;
            }
        });
    }

    // --- General Modal Close Function ---
    window.closeModal = (modalId) => {
        document.getElementById(modalId).style.display = 'none';
        if (modalId === 'editPostModal') {
            editPostMessage.textContent = ''; // Clear messages on close
        } else if (modalId === 'editUserModal') {
            editUserMessage.textContent = ''; // Clear messages on close
        }
    };

    // Helper to escape HTML entities
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
});