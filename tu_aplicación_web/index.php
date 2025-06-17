<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión / Registrarse</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <div class="form-wrapper" id="login-form">
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
                <button type="submit">Iniciar Sesión</button>
            </form>
            <p>¿No tienes cuenta? <a href="#" id="showRegister">Regístrate aquí</a></p>
            <div id="loginMessage" class="message"></div>
        </div>

        <div class="form-wrapper" id="register-form" style="display: none;">
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
                <div class="form-group">
                    <label for="confirmPassword">Confirmar Contraseña:</label>
                    <input type="password" id="confirmPassword" name="confirm_password" required>
                </div>
                <button type="submit">Registrarse</button>
            </form>
            <p>¿Ya tienes cuenta? <a href="#" id="showLogin">Inicia sesión aquí</a></p>
            <div id="registerMessage" class="message"></div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>