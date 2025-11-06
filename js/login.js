// Espera a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    
    // Asigna el evento al botón
    const loginButton = document.getElementById('login-btn');
    if (loginButton) {
        loginButton.addEventListener('click', login);
    }

    // Opcional: Permitir login con "Enter" en el campo de contraseña
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    }
});

function login() {
    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;
    const msg = document.getElementById('msg');

    // 1. Validar si está vacío
    if (!usuario || !password) {
        msg.style.color = "red";
        msg.textContent = "⚠️ Ingresa usuario y contraseña";
        return;
    }

    // 2. Validar credenciales correctas
    if (usuario === 'admin' && password === 'admin') {
        // Guardar sesión simulada
        localStorage.setItem('usuarioActivo', usuario);
        msg.style.color = "green";
        msg.textContent = "✅ Sesión iniciada. Redirigiendo...";
        
        // ¡¡¡CORRECCIÓN IMPORTANTE!!!
        // Eliminamos la línea que borraba el carrito.
        // localStorage.removeItem('carrito');  <-- ESTA LÍNEA SE FUE

        // Ahora, si un usuario anónimo tenía cosas, las conservará.
        
        setTimeout(() => location.href = 'index.html', 1000);
    } else {
        // 3. Credenciales incorrectas
        msg.style.color = "red";
        msg.textContent = "❌ Usuario o contraseña incorrectos.";
    }
}