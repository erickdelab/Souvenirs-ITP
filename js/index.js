// --- Función para Cerrar Sesión ---
function cerrarSesion() {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        localStorage.removeItem('usuarioActivo');
        localStorage.removeItem('esAdmin');
        // Recargamos la página para que se actualice el estado de login
        location.reload(); 
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    
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
    

    // --- 3. Cargar y mostrar productos ---
    async function cargarProductos() {
        const productosContainer = document.querySelector('main');
        
        // Cargar desde GitHub
        let productos = await githubInventario.cargarInventario();
        
        // Limpiar productos existentes manteniendo las secciones
        const secciones = productosContainer.querySelectorAll('.seccion');
        secciones.forEach(seccion => {
            const productosDiv = seccion.querySelector('.productos');
            if (productosDiv) {
                productosDiv.innerHTML = '';
            }
        });
        
        // Mapeo de categorías a títulos de sección
        const mapeoCategorias = {
            'ropa': 'Ropa',
            'accesorios': 'Accesorios', 
            'escolar': 'Escolar',
            'hogar': 'Hogar'
        };
        
        // Agrupar productos por categoría
        const productosPorCategoria = {};
        productos.forEach(producto => {
            if (!productosPorCategoria[producto.categoria]) {
                productosPorCategoria[producto.categoria] = [];
            }
            productosPorCategoria[producto.categoria].push(producto);
        });
        
        // Renderizar productos por categoría en sus secciones correspondientes
        Object.keys(productosPorCategoria).forEach(categoria => {
            const tituloSeccion = mapeoCategorias[categoria];
            if (tituloSeccion) {
                // Encontrar la sección correcta por el título
                const secciones = productosContainer.querySelectorAll('.seccion');
                let seccionEncontrada = null;
                
                secciones.forEach(seccion => {
                    const h2 = seccion.querySelector('h2');
                    if (h2 && h2.textContent === tituloSeccion) {
                        seccionEncontrada = seccion;
                    }
                });
                
                if (seccionEncontrada) {
                    const productosDiv = seccionEncontrada.querySelector('.productos');
                    if (productosDiv) {
                        productosPorCategoria[categoria].forEach(producto => {
                            const productoHTML = crearProductoHTML(producto);
                            productosDiv.innerHTML += productoHTML;
                        });
                    }
                }
            }
        });
        
        // Agregar event listeners a los nuevos botones
        agregarEventListenersProductos();
    }
    
    function crearProductoHTML(producto) {
        const disponible = producto.inventario > 0;
        return `
            <div class="producto" data-id="${producto.id}" data-nombre="${producto.nombre}" data-precio="${producto.precio}">
                <div>
                    <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='https://via.placeholder.com/200x200?text=Imagen+no+disponible'">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <p class="precio">$${producto.precio}</p>
                    ${!disponible ? '<div class="no-disponible">❌ No disponible</div>' : ''}
                    ${disponible && producto.inventario < 5 ? `<div class="poco-stock">⚠️ Solo ${producto.inventario} disponibles</div>` : ''}
                </div>
                <div class="controles-compra">
                    <div class="cantidad-control">
                        <button class="qty-btn" data-action="decrease" aria-label="Disminuir cantidad" ${!disponible ? 'disabled' : ''}>-</button>
                        <input type="number" class="cantidad-input" value="1" min="1" max="${producto.inventario}" readonly aria-label="Cantidad" ${!disponible ? 'disabled' : ''}>
                        <button class="qty-btn" data-action="increase" aria-label="Aumentar cantidad" ${!disponible ? 'disabled' : ''}>+</button>
                    </div>
                    <button class="boton" ${!disponible ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                        ${disponible ? 'Añadir al Carrito' : 'Sin stock'}
                    </button>
                </div>
            </div>
        `;
    }
    
    function agregarEventListenersProductos() {
        const productosEl = document.querySelectorAll('.producto');
        
        productosEl.forEach(producto => {
            const qtyInput = producto.querySelector('.cantidad-input');
            const btnIncrease = producto.querySelector('[data-action="increase"]');
            const btnDecrease = producto.querySelector('[data-action="decrease"]');
            const btnAnadir = producto.querySelector('.boton');

            if (btnIncrease && qtyInput) {
                btnIncrease.addEventListener('click', () => {
                    const max = parseInt(qtyInput.max);
                    const current = parseInt(qtyInput.value);
                    if (current < max) {
                        qtyInput.value = current + 1;
                    }
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
                btnAnadir.addEventListener('click', async () => {
                    const id = producto.dataset.id;
                    const nombre = producto.dataset.nombre;
                    const precio = parseFloat(producto.dataset.precio);
                    const cantidad = qtyInput ? parseInt(qtyInput.value) : 1; 
                    
                    await agregarAlCarrito(id, nombre, precio, cantidad);
                    
                    if (qtyInput) {
                        qtyInput.value = 1; // Reseteamos el input
                    }
                });
            }
        });
    }

    // --- 4. Lógica del Carrito ---
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

    async function agregarAlCarrito(id, nombre, precio, cantidad) {
        // Verificar inventario
        const productos = await githubInventario.cargarInventario();
        const productoIndex = productos.findIndex(p => p.id == id);
        
        if (productoIndex !== -1) {
            const producto = productos[productoIndex];
            
            if (producto.inventario < cantidad) {
                alert(`No hay suficiente inventario. Solo quedan ${producto.inventario} unidades.`);
                return;
            }
            
            // Actualizar inventario
            producto.inventario -= cantidad;
            productos[productoIndex] = producto;
            
            // Guardar cambios localmente
            githubInventario.guardarCambiosLocalmente(productos);
            
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
            
            // Recargar productos para actualizar disponibilidad
            await cargarProductos();
        }
    }

    // Inicializar
    await cargarProductos();
    actualizarContadorCarrito();
});