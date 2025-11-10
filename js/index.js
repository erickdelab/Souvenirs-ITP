// --- Función para Cerrar Sesión ---
function cerrarSesion() {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        localStorage.removeItem('usuarioActivo');
        localStorage.removeItem('esAdmin');
        // Recargamos la página para que se actualice el estado de login
        location.reload(); 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Cargar Carrito y Estado de Sesión ---
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    // IMPORTANTE: El carrito es un ARRAY de objetos
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const contadorCarritoEl = document.querySelector('.carrito-contador');

    // --- 2. LÓGICA DE UI (Mostrar/Ocultar botones) ---
    if (usuarioActivo) {
        // Si hay sesión
        document.body.classList.add('logged-in');
        document.body.classList.remove('logged-out');
        document.getElementById('saludo-usuario').textContent = `Hola, ${usuarioActivo}`;
        document.getElementById('logout-btn').addEventListener('click', cerrarSesion);
        
        // MOSTRAR BOTÓN DE ADMIN SOLO SI ES ADMIN
        const esAdmin = localStorage.getItem('esAdmin') === 'true';
        if (esAdmin) {
            const adminBtn = document.getElementById('admin-btn');
            if (adminBtn) {
                adminBtn.style.display = 'flex';
            }
        }
    } else {
        // Si NO hay sesión
        document.body.classList.add('logged-out');
        document.body.classList.remove('logged-in');
    }
    // --- FIN LÓGICA DE UI ---
    

    // --- 3. Lógica del Carrito ---
    const productosEl = document.querySelectorAll('.producto');

    function actualizarContadorCarrito() {
        let totalItems = 0;
        // Sumamos las cantidades de cada item en el array
        for (const item of carrito) {
            totalItems += item.cantidad;
        }
        if (contadorCarritoEl) {
            contadorCarritoEl.textContent = totalItems;
        }
    }

    function guardarCarrito() {
        // Guardamos el ARRAY como un string en localStorage
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    function agregarAlCarrito(id, nombre, precio, cantidad) {
        // Verificar inventario
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        const producto = productos.find(p => p.id == id);
        
        if (producto && producto.inventario < cantidad) {
            alert(`No hay suficiente inventario. Solo quedan ${producto.inventario} unidades.`);
            return;
        }
        
        // Buscamos en el ARRAY si el producto ya existe
        const productoExistente = carrito.find(p => p.id === id);
        
        if (productoExistente) {
            // Si existe, solo sumamos la cantidad
            productoExistente.cantidad += cantidad;
        } else {
            // Si no existe, lo añadimos (push) al ARRAY
            carrito.push({ id, nombre, precio, cantidad: cantidad });
        }
        
        console.log('Carrito actualizado:', carrito);
        guardarCarrito();
        actualizarContadorCarrito();
        alert(`${cantidad} ${nombre}(s) añadido(s) al carrito 🛍️`);
    }

    productosEl.forEach(producto => {
        const qtyInput = producto.querySelector('.cantidad-input');
        const btnIncrease = producto.querySelector('[data-action="increase"]');
        const btnDecrease = producto.querySelector('[data-action="decrease"]');
        const btnAnadir = producto.querySelector('.boton');

        if (btnIncrease && qtyInput) {
            btnIncrease.addEventListener('click', () => {
                qtyInput.value = parseInt(qtyInput.value) + 1;
            });
        }
        if (btnDecrease && qtyInput) {
            btnDecrease.addEventListener('click', () => {
                let valor = parseInt(qtyInput.value);
                if (valor > 1) {
                    qtyInput.value = valor - 1;
                }
            });
        }
        if (btnAnadir) {
            btnAnadir.addEventListener('click', () => {
                // Ya no validamos la sesión aquí, cualquiera puede agregar
                const id = producto.dataset.id;
                const nombre = producto.dataset.nombre;
                const precio = parseFloat(producto.dataset.precio);
                const cantidad = qtyInput ? parseInt(qtyInput.value) : 1; 
                
                agregarAlCarrito(id, nombre, precio, cantidad);
                
                if (qtyInput) {
                    qtyInput.value = 1; // Reseteamos el input
                }
            });
        }
    });

    // Actualizar contador al cargar la página (para todos)
    actualizarContadorCarrito();
});