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

    // 2. Validar credenciales correctas (USUARIOS ACTUALIZADOS)
    const usuariosValidos = [
        { usuario: 'admin', password: 'admin' },
        { usuario: 'User', password: 'User' } // <-- Cambié 'user' por 'User' para consistencia
    ];
    
    const usuarioValido = usuariosValidos.find(u => 
        u.usuario === usuario && u.password === password
    );
    
    if (usuarioValido) {
        // Guardar sesión simulada
        localStorage.setItem('usuarioActivo', usuario);
        localStorage.setItem('esAdmin', usuario === 'admin'); // Guardar si es admin
        msg.style.color = "green";
        msg.textContent = "✅ Sesión iniciada. Redirigiendo...";
        
        setTimeout(() => location.href = 'index.html', 1000);
    } else {
        // 3. Credenciales incorrectas
        msg.style.color = "red";
        msg.textContent = "❌ Usuario o contraseña incorrectos.";
    }
}