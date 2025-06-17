<?php
// index.php
session_start();

// Si el usuario ya está logueado, redirigirlo a home.php
if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
    header('Location: home.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="header">
        <h1>Bienvenido a Nuestra Plataforma</h1>
        <p>Explora las publicaciones o inicia sesión/regístrate.</p>
    </div>

    <div class="container welcome-container">
        <div class="auth-section">
            <div class="tab-buttons">
                <button class="tab-button active" onclick="showAuthTab('login-tab')">Iniciar Sesión</button>
                <button class="tab-button" onclick="showAuthTab('register-tab')">Registrarse</button>
            </div>

            <div id="login-tab" class="auth-tab-content active">
                <h2>Iniciar Sesión</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="loginUsername">Usuario:</label>
                        <input type="text" id="loginUsername" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Contraseña:</label>
                        <input type="password" id="loginPassword" name="password" required>
                    </div>
                    <button type="submit">Entrar</button>
                </form>
                <div id="loginMessage" class="message"></div>
            </div>

            <div id="register-tab" class="auth-tab-content">
                <h2>Registrarse</h2>
                <form id="registerForm">
                    <div class="form-group">
                        <label for="registerUsername">Usuario:</label>
                        <input type="text" id="registerUsername" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="registerEmail">Email:</label>
                        <input type="email" id="registerEmail" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="registerPassword">Contraseña:</label>
                        <input type="password" id="registerPassword" name="password" required>
                    </div>
                    <button type="submit">Registrar</button>
                </form>
                <div id="registerMessage" class="message"></div>
            </div>
        </div>

        <div class="public-posts-section">
            <h2>Últimas Publicaciones</h2>
            <div class="posts-list" id="publicPostsList">
                <div id="allPostsList"></div>
                </div>
        </div>

    </div> <script src="script.js"></script>
</body>
</html>