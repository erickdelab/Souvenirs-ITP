// --- Función para Cerrar Sesión ---
function cerrarSesion() {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        localStorage.removeItem('usuarioActivo');
        // location.reload(); // No es necesario, redirigimos a login
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. LÓGICA DE UI (Mostrar/Ocultar botones) ---
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    
    if (usuarioActivo) {
        // Si hay sesión
        document.body.classList.add('logged-in');
        document.body.classList.remove('logged-out');
        document.getElementById('saludo-usuario').textContent = `Hola, ${usuarioActivo}`;
        document.getElementById('logout-btn').addEventListener('click', cerrarSesion);
    } else {
        // Si NO hay sesión
        document.body.classList.add('logged-out');
        document.body.classList.remove('logged-in');
    }
    // --- FIN LÓGICA DE UI ---


    // --- 2. Lógica para renderizar el carrito ---
    // IMPORTANTE: Leemos el ARRAY de localStorage
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const cuerpo = document.querySelector('#tablaCarrito tbody');
    const totalDiv = document.getElementById('total');
    const contadorNavEl = document.getElementById('carrito-contador-nav');
    const btnContinuar = document.getElementById('continuar-compra-btn');

    function renderCarrito() {
        cuerpo.innerHTML = ''; // Limpiamos la tabla
        let totalGeneral = 0;
        let totalItems = 0;

        // Usamos .length por ser un array
        if (carrito.length === 0) {
            cuerpo.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">Tu carrito está vacío</td></tr>';
            if (btnContinuar) btnContinuar.style.display = 'none'; // Ocultar botón si no hay nada
        } else {
            // Usamos .forEach() por ser un array
            carrito.forEach(p => {
                const subtotal = p.precio * p.cantidad;
                totalGeneral += subtotal;
                totalItems += p.cantidad;
                cuerpo.innerHTML += `
                    <tr>
                        <td>${p.nombre}</td>
                        <td style="text-align:right;">$${p.precio.toFixed(2)}</td>
                        <td style="text-align:right;">${p.cantidad}</td>
                        <td style="text-align:right;">$${subtotal.toFixed(2)}</td>
                    </tr>`;
            });
            if (btnContinuar) btnContinuar.style.display = 'block'; // Mostrar botón
        }
        
        totalDiv.textContent = `Total: $${totalGeneral.toFixed(2)}`;
        contadorNavEl.textContent = totalItems; // Actualiza el contador de la barra
    }

    function vaciarCarrito() {
        if (confirm("¿Estás seguro de que quieres vaciar tu carrito?")) {
            localStorage.removeItem('carrito');
            location.reload(); // Recarga la página para mostrar el carrito vacío
        }
    }
    
    // Asignar evento al botón de vaciar
    document.getElementById('vaciar-btn').addEventListener('click', vaciarCarrito);

    // Asignar evento al botón de continuar compra
    if (btnContinuar) {
        btnContinuar.addEventListener('click', () => {
            // Aquí es donde validamos la sesión
            const usuario = localStorage.getItem('usuarioActivo');
            
            if (usuario) {
                // Si hay sesión, continuamos (simulado)
                alert(`¡Gracias por tu compra, ${usuario}!\n\n(Simulación: Redirigiendo a pasarela de pago...)`);
                // Aquí iría la lógica para enviar al pago
            } else {
                // Si NO hay sesión, pedimos que inicie sesión
                alert("Debes iniciar sesión para continuar con tu compra.");
                window.location.href = 'login.html';
            }
        });
    }

    // Renderizar todo al cargar
    renderCarrito();
});