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
    

    // --- 3. Cargar y mostrar productos ---
    function cargarProductos() {
        const productosContainer = document.querySelector('main');
        let productos = JSON.parse(localStorage.getItem('productos'));
        
        // Si no hay productos en localStorage, cargar los productos por defecto
        if (!productos || productos.length === 0) {
            productos = [
                {
                    id: "1",
                    nombre: "Camiseta Clásica ITP",
                    precio: 250,
                    imagen: "https://github.com/SAMUELWEB11/ProyectoITPshop/blob/main/camiseta-itp.jpeg?raw=true",
                    descripcion: "Camiseta 100% algodón con el logo del instituto en el pecho. Perfecta para clases o salidas casuales.",
                    inventario: 10,
                    categoria: "ropa"
                },
                {
                    id: "2",
                    nombre: "Sudadera con Capucha",
                    precio: 450,
                    imagen: "https://github.com/SAMUELWEB11/ProyectoITPshop/blob/main/sudadera-itp.jpeg?raw=true",
                    descripcion: "Sudadera cómoda con el texto 'Instituto Tecnológico de Puebla' en la espalda. Para noches frescas de estudio.",
                    inventario: 8,
                    categoria: "ropa"
                },
                {
                    id: "3",
                    nombre: "Gorra Ajustable",
                    precio: 150,
                    imagen: "https://github.com/SAMUELWEB11/ProyectoITPshop/blob/main/gorra.jpeg?raw=true",
                    descripcion: "Gorra con bordado del engranaje y 'ITP' en la frente. Protege tu cabeza del sol en eventos universitarios.",
                    inventario: 15,
                    categoria: "ropa"
                },
                {
                    id: "4",
                    nombre: "Mochila Tecnológica",
                    precio: 380,
                    imagen: "https://github.com/SAMUELWEB11/ProyectoITPshop/blob/main/mochila.jpeg?raw=true",
                    descripcion: "Mochila espaciosa con bolsillo para laptop y bordados del engranaje. Ideal para llevar tus libros y gadgets.",
                    inventario: 5,
                    categoria: "ropa"
                },
                {
                    id: "5",
                    nombre: "Taza Universitaria",
                    precio: 120,
                    imagen: "https://github.com/SAMUELWEB11/ProyectoITPshop/blob/main/taza2.jpeg?raw=true",
                    descripcion: "Taza cerámica de 350ml con impresión del mapa de Puebla y el engranaje tecnológico. Ideal para tu café matutino.",
                    inventario: 20,
                    categoria: "accesorios"
                },
                {
                    id: "6",
                    nombre: "Pin de Graduación",
                    precio: 30,
                    imagen: "https://github.com/SAMUELWEB11/ProyectoITPshop/blob/main/pines.jpeg?raw=true",
                    descripcion: "Pin esmaltado con el logo completo. Un recuerdo eterno para tu logro académico.",
                    inventario: 50,
                    categoria: "accesorios"
                },
                {
                    id: "7",
                    nombre: "stickers Set",
                    precio: 60,
                    imagen: "https://github.com/SAMUELWEB11/ProyectoITPshop/blob/main/stickers.jpeg?raw=true",
                    descripcion: "Paquete de 5 stickers con elementos del logo: engranajes, mapa y letras. Para decorar tu laptop o cuaderno.",
                    inventario: 30,
                    categoria: "accesorios"
                },
                {
                    id: "8",
                    nombre: "Funda para Teléfono",
                    precio: 25,
                    imagen: "https://github.com/SAMUELWEB11/ProyectoITPshop/blob/main/telefonofun.jpeg?raw=true",
                    descripcion: "Correa de silicona con el logo 'ITP' para no perder tu móvil en el caos de clases. Práctica y cool.",
                    inventario: 25,
                    categoria: "accesorios"
                },
                {
                    id: "9",
                    nombre: "Cuaderno de Notas",
                    precio: 80,
                    imagen: "https://github.com/SAMUELWEB11/ProyectoITPshop/blob/main/cuaderno.jpeg?raw=true",
                    descripcion: "Cuaderno espiral de 100 hojas con portada del instituto. Para apuntes de ingeniería que inspiren.",
                    inventario: 40,
                    categoria: "escolar"
                },
                {
                    id: "10",
                    nombre: "Bolígrafo Grabado",
                    precio: 40,
                    imagen: "https://github.com/SAMUELWEB11/ProyectoITPshop/blob/main/boligrafo.jpeg?raw=true",
                    descripcion: "Bolígrafo de metal con grabado 'Instituto Tecnológico de Puebla'. Escribe tus ideas con estilo profesional.",
                    inventario: 100,
                    categoria: "escolar"
                },
                {
                    id: "11",
                    nombre: "USB Creador",
                    precio: 110,
                    imagen: "https://github.com/SAMUELWEB11/ProyectoITPshop/blob/main/USB.png?raw=true",
                    descripcion: "USB de 32GB con forma de engranaje y pre-cargado con recursos educativos del ITP. Para tus proyectos digitales.",
                    inventario: 15,
                    categoria: "escolar"
                },
                {
                    id: "12",
                    nombre: "Libreta de Laboratorio",
                    precio: 55,
                    imagen: "https://github.com/SAMUELWEB11/ProyectoITPshop/blob/main/Libretalab.png?raw=true",
                    descripcion: "Libreta cuadriculada para experimentos, con portada del engranaje y reglas de seguridad del instituto.",
                    inventario: 35,
                    categoria: "escolar"
                },
                {
                    id: "13",
                    nombre: "Poster Educativo",
                    precio: 70,
                    imagen: "https://github.com/SAMUELWEB11/ProyectoITPshop/blob/main/Poster.png?raw=true",
                    descripcion: "Poster laminado del campus con mapa y hitos históricos del instituto. Para decorar tu habitación de estudiante.",
                    inventario: 20,
                    categoria: "hogar"
                },
                {
                    id: "14",
                    nombre: "Calendario Anual",
                    precio: 95,
                    imagen: "https://github.com/SAMUELWEB11/ProyectoITPshop/blob/main/Calendario.png?raw=true",
                    descripcion: "Calendario de pared con fotos del instituto y fechas importantes académicas. Planifica tu semestre con estilo.",
                    inventario: 12,
                    categoria: "hogar"
                }
            ];
            localStorage.setItem('productos', JSON.stringify(productos));
        }
        
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
                btnAnadir.addEventListener('click', () => {
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

    function agregarAlCarrito(id, nombre, precio, cantidad) {
        // Verificar inventario
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
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
            localStorage.setItem('productos', JSON.stringify(productos));
            
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
            cargarProductos();
        }
    }

    // Inicializar
    cargarProductos();
    actualizarContadorCarrito();
});