// Espera a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    
    // SOLUCIÓN: Usar el formulario en lugar del botón
    const loginForm = document.getElementById('login-form');
    const loginButton = document.getElementById('login-btn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Evita que el formulario se envíe
            login();
        });
    }
    
    // También mantener el evento del botón por si acaso
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

    console.log('Intentando login con:', usuario, password); // Para debug

    // 1. Validar si está vacío
    if (!usuario || !password) {
        msg.style.color = "red";
        msg.textContent = "⚠️ Ingresa usuario y contraseña";
        return;
    }

    // 2. Validar credenciales correctas (USUARIOS ACTUALIZADOS)
    const usuariosValidos = [
        { usuario: 'admin', password: 'admin' },
        { usuario: 'User', password: 'User' }
    ];
    
    const usuarioValido = usuariosValidos.find(u => u.usuario === usuario && u.password === password);
    
    if (usuarioValido) {
        // Guardar sesión simulada
        localStorage.setItem('usuarioActivo', usuario);
        localStorage.setItem('esAdmin', usuario === 'admin'); // Guardar si es admin
        msg.style.color = "green";
        msg.textContent = "✅ Sesión iniciada. Redirigiendo...";
        
        console.log('Login exitoso, redirigiendo...'); // Para debug
        
        // ¡¡¡CORRECCIÓN IMPORTANTE!!! Redirigir después de 1 segundo
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        // 3. Credenciales incorrectas
        msg.style.color = "red";
        msg.textContent = "❌ Usuario o contraseña incorrectos.";
    }
}