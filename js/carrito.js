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
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const cuerpo = document.querySelector('#tablaCarrito tbody');
    const totalDiv = document.getElementById('total');
    const contadorNavEl = document.getElementById('carrito-contador-nav');
    const btnContinuar = document.getElementById('continuar-compra-btn');

    function renderCarrito() {
        cuerpo.innerHTML = ''; // Limpiamos la tabla
        let totalGeneral = 0;
        let totalItems = 0;

        if (carrito.length === 0) {
            cuerpo.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">Tu carrito está vacío</td></tr>';
            if (btnContinuar) btnContinuar.style.display = 'none';
        } else {
            carrito.forEach((p, index) => {
                const subtotal = p.precio * p.cantidad;
                totalGeneral += subtotal;
                totalItems += p.cantidad;
                cuerpo.innerHTML += `
                    <tr>
                        <td>${p.nombre}</td>
                        <td style="text-align:right;">$${p.precio.toFixed(2)}</td>
                        <td style="text-align:right;">${p.cantidad}</td>
                        <td style="text-align:right;">$${subtotal.toFixed(2)}</td>
                        <td style="text-align:center;">
                            <button class="btn-eliminar-item" data-index="${index}" title="Eliminar este producto">
                                🗑️
                            </button>
                        </td>
                    </tr>`;
            });
            if (btnContinuar) btnContinuar.style.display = 'block';
            
            // Agregar event listeners a los botones de eliminar
            document.querySelectorAll('.btn-eliminar-item').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    eliminarDelCarrito(index);
                });
            });
        }
        
        totalDiv.textContent = `Total: $${totalGeneral.toFixed(2)}`;
        if (contadorNavEl) {
            contadorNavEl.textContent = totalItems;
        }
    }

    function eliminarDelCarrito(index) {
        if (confirm("¿Estás seguro de que quieres eliminar este producto del carrito?")) {
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            const productos = JSON.parse(localStorage.getItem('productos')) || [];
            
            if (index >= 0 && index < carrito.length) {
                const productoEliminado = carrito[index];
                
                // Devolver el producto al inventario
                const productoIndex = productos.findIndex(p => p.id == productoEliminado.id);
                if (productoIndex !== -1) {
                    productos[productoIndex].inventario += productoEliminado.cantidad;
                    localStorage.setItem('productos', JSON.stringify(productos));
                }
                
                // Eliminar del carrito
                carrito.splice(index, 1);
                localStorage.setItem('carrito', JSON.stringify(carrito));
                
                // Recargar la vista del carrito
                renderCarrito();
                alert('Producto eliminado del carrito.');
            }
        }
    }

    function vaciarCarrito() {
        if (confirm("¿Estás seguro de que quieres vaciar tu carrito?")) {
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            const productos = JSON.parse(localStorage.getItem('productos')) || [];
            
            if (carrito.length > 0) {
                // Devolver todos los productos al inventario
                carrito.forEach(itemCarrito => {
                    const productoIndex = productos.findIndex(p => p.id == itemCarrito.id);
                    if (productoIndex !== -1) {
                        productos[productoIndex].inventario += itemCarrito.cantidad;
                    }
                });
                
                localStorage.setItem('productos', JSON.stringify(productos));
            }
            
            localStorage.removeItem('carrito');
            location.reload();
        }
    }
    
    // Asignar evento al botón de vaciar
    document.getElementById('vaciar-btn').addEventListener('click', vaciarCarrito);

    // Asignar evento al botón de continuar compra
    if (btnContinuar) {
        btnContinuar.addEventListener('click', () => {
            const usuario = localStorage.getItem('usuarioActivo');
            
            if (usuario) {
                window.location.href = 'pago.html'; 
            } else {
                alert("Debes iniciar sesión para continuar con tu compra.");
                window.location.href = 'login.html';
            }
        });
    }

    // Renderizar todo al cargar
    renderCarrito();
});