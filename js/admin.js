// admin.js - CON MEJOR MANEJO DE CAMBIOS
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si es admin
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    const esAdmin = localStorage.getItem('esAdmin') === 'true';
    
    if (!usuarioActivo || !esAdmin) {
        alert('No tienes permisos para acceder a esta página.');
        window.location.href = 'index.html';
        return;
    }

    console.log('🔧 Iniciando panel de administración...');

    // Cargar UI
    document.getElementById('saludo-usuario').textContent = `Hola, ${usuarioActivo}`;
    document.getElementById('logout-btn').addEventListener('click', cerrarSesion);

    // Elementos del DOM
    const modal = document.getElementById('modal-producto');
    const btnAgregar = document.getElementById('btn-agregar');
    const btnCerrarModal = document.querySelector('.cerrar');
    const formProducto = document.getElementById('form-producto');
    const cuerpoTabla = document.getElementById('cuerpo-tabla');

    // Variables globales
    let productosActuales = [];

    // Cargar productos al iniciar
    await cargarProductos();

    // Event Listeners
    btnAgregar.addEventListener('click', () => abrirModal());
    btnCerrarModal.addEventListener('click', () => cerrarModal());
    window.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal();
    });

    formProducto.addEventListener('submit', guardarProducto);

    function cerrarSesion() {
        if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
            localStorage.removeItem('usuarioActivo');
            localStorage.removeItem('esAdmin');
            window.location.href = 'login.html';
        }
    }

    function abrirModal(producto = null) {
        const modalTitulo = document.getElementById('modal-titulo');
        
        if (producto) {
            // Modo edición
            modalTitulo.textContent = 'Editar Producto';
            document.getElementById('producto-id').value = producto.id;
            document.getElementById('producto-nombre').value = producto.nombre;
            document.getElementById('producto-precio').value = producto.precio;
            document.getElementById('producto-imagen').value = producto.imagen;
            document.getElementById('producto-descripcion').value = producto.descripcion;
            document.getElementById('producto-inventario').value = producto.inventario;
            document.getElementById('producto-categoria').value = producto.categoria;
        } else {
            // Modo agregar
            modalTitulo.textContent = 'Agregar Producto';
            formProducto.reset();
            document.getElementById('producto-id').value = '';
        }
        
        modal.style.display = 'block';
    }

    function cerrarModal() {
        modal.style.display = 'none';
    }

    async function cargarProductos() {
        try {
            console.log('🔄 Cargando productos...');
            productosActuales = await githubInventario.cargarInventario();
            console.log('📊 Productos cargados:', productosActuales);
            
            renderizarTabla(productosActuales);
            
        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            cuerpoTabla.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color: red;">❌ Error al cargar productos</td></tr>';
        }
    }

    function renderizarTabla(productos) {
        cuerpoTabla.innerHTML = '';

        if (!productos || productos.length === 0) {
            cuerpoTabla.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color: orange;">⚠️ No hay productos disponibles</td></tr>';
            return;
        }

        productos.forEach(producto => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${producto.id}</td>
                <td><img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-producto" onerror="this.src='https://via.placeholder.com/50?text=Imagen+no+disponible'"></td>
                <td>${producto.nombre}</td>
                <td>$${producto.precio}</td>
                <td>${producto.descripcion ? producto.descripcion.substring(0, 50) + '...' : 'Sin descripción'}</td>
                <td>${producto.inventario}</td>
                <td class="acciones-producto">
                    <button class="btn-editar" data-id="${producto.id}">✏️ Editar</button>
                    <button class="btn-eliminar" data-id="${producto.id}">🗑️ Eliminar</button>
                </td>
            `;
            cuerpoTabla.appendChild(fila);
        });

        // Agregar event listeners después de crear las filas
        agregarEventListenersProductos();
        console.log('✅ Tabla de productos actualizada');
    }

    function agregarEventListenersProductos() {
        // Event listeners para botones de editar
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                editarProducto(id);
            });
        });

        // Event listeners para botones de eliminar
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                eliminarProducto(id);
            });
        });
    }

    async function guardarProducto(e) {
        e.preventDefault();
        
        const producto = {
            id: document.getElementById('producto-id').value || generarIdUnico(),
            nombre: document.getElementById('producto-nombre').value.trim(),
            precio: parseFloat(document.getElementById('producto-precio').value),
            imagen: document.getElementById('producto-imagen').value.trim(),
            descripcion: document.getElementById('producto-descripcion').value.trim(),
            inventario: parseInt(document.getElementById('producto-inventario').value),
            categoria: document.getElementById('producto-categoria').value
        };

        // Validaciones
        if (!producto.nombre || !producto.imagen || !producto.descripcion) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        if (producto.precio <= 0 || producto.inventario < 0) {
            alert('El precio debe ser mayor a 0 y el inventario no puede ser negativo.');
            return;
        }

        try {
            let productos = [...productosActuales];
            
            if (document.getElementById('producto-id').value) {
                // Editar producto existente
                const index = productos.findIndex(p => p.id === producto.id);
                if (index !== -1) {
                    productos[index] = producto;
                    console.log('✏️ Producto editado:', producto);
                }
            } else {
                // Agregar nuevo producto
                productos.push(producto);
                console.log('➕ Producto agregado:', producto);
            }

            // Guardar cambios
            const guardadoExitoso = await githubInventario.guardarCambiosLocalmente(productos);
            
            if (guardadoExitoso) {
                productosActuales = productos;
                renderizarTabla(productosActuales);
                cerrarModal();
                
                // Mostrar mensaje informativo
                mostrarMensaje('✅ Producto guardado exitosamente (cambios guardados localmente)', 'success');
            } else {
                throw new Error('Error al guardar cambios');
            }
            
        } catch (error) {
            console.error('Error guardando producto:', error);
            mostrarMensaje('❌ Error al guardar el producto', 'error');
        }
    }

    function generarIdUnico() {
        return 'prod_' + Date.now().toString() + Math.random().toString(36).substr(2, 5);
    }

    async function editarProducto(id) {
        try {
            const producto = productosActuales.find(p => p.id === id);
            if (producto) {
                console.log('📝 Editando producto:', producto);
                abrirModal(producto);
            } else {
                mostrarMensaje('❌ Producto no encontrado', 'error');
            }
        } catch (error) {
            console.error('Error editando producto:', error);
            mostrarMensaje('❌ Error al cargar el producto para editar', 'error');
        }
    }

    async function eliminarProducto(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                let productos = [...productosActuales];
                const productoEliminado = productos.find(p => p.id === id);
                productos = productos.filter(p => p.id !== id);
                
                // Guardar cambios
                const guardadoExitoso = await githubInventario.guardarCambiosLocalmente(productos);
                
                if (guardadoExitoso) {
                    productosActuales = productos;
                    renderizarTabla(productosActuales);
                    console.log('🗑️ Producto eliminado:', productoEliminado);
                    mostrarMensaje('✅ Producto eliminado exitosamente', 'success');
                } else {
                    throw new Error('Error al guardar cambios');
                }
                
            } catch (error) {
                console.error('Error eliminando producto:', error);
                mostrarMensaje('❌ Error al eliminar el producto', 'error');
            }
        }
    }

    function mostrarMensaje(mensaje, tipo) {
        // Crear mensaje temporal
        const mensajeEl = document.createElement('div');
        mensajeEl.textContent = mensaje;
        mensajeEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            background: ${tipo === 'success' ? '#4CAF50' : '#f44336'};
        `;
        
        document.body.appendChild(mensajeEl);
        
        setTimeout(() => {
            document.body.removeChild(mensajeEl);
        }, 3000);
    }
});