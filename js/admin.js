// admin.js - VERSIÓN MEJORADA CON DEPURACIÓN
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
    console.log('👤 Usuario:', usuarioActivo);
    console.log('⚙️ Es admin:', esAdmin);

    // Cargar UI
    document.getElementById('saludo-usuario').textContent = `Hola, ${usuarioActivo}`;
    document.getElementById('logout-btn').addEventListener('click', cerrarSesion);

    // Elementos del DOM
    const modal = document.getElementById('modal-producto');
    const btnAgregar = document.getElementById('btn-agregar');
    const btnCerrarModal = document.querySelector('.cerrar');
    const formProducto = document.getElementById('form-producto');
    const cuerpoTabla = document.getElementById('cuerpo-tabla');

    // DEPURACIÓN: Verificar conexión con GitHub
    console.log('🔍 Verificando conexión con GitHub...');
    const conexionOk = await githubInventario.verificarConexion();
    console.log('📡 Conexión con GitHub:', conexionOk ? '✅ OK' : '❌ FALLÓ');

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
        const form = document.getElementById('form-producto');
        
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
            form.reset();
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
            const productos = await githubInventario.cargarInventario();
            console.log('📊 Productos obtenidos:', productos);
            
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
            
        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            cuerpoTabla.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color: red;">❌ Error al cargar productos</td></tr>';
        }
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
            // Obtener productos actuales
            let productos = await githubInventario.cargarInventario();
            
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

            // Guardar cambios localmente
            githubInventario.guardarCambiosLocalmente(productos);
            
            await cargarProductos();
            cerrarModal();
            alert('Producto guardado exitosamente.');
            
        } catch (error) {
            console.error('Error guardando producto:', error);
            alert('Error al guardar el producto. Intenta nuevamente.');
        }
    }

    function generarIdUnico() {
        return 'prod_' + Date.now().toString() + Math.random().toString(36).substr(2, 5);
    }

    async function editarProducto(id) {
        try {
            const productos = await githubInventario.cargarInventario();
            const producto = productos.find(p => p.id === id);
            if (producto) {
                console.log('📝 Editando producto:', producto);
                abrirModal(producto);
            } else {
                alert('Producto no encontrado.');
            }
        } catch (error) {
            console.error('Error editando producto:', error);
            alert('Error al cargar el producto para editar.');
        }
    }

    async function eliminarProducto(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                let productos = await githubInventario.cargarInventario();
                const productoEliminado = productos.find(p => p.id === id);
                productos = productos.filter(p => p.id !== id);
                
                // Guardar cambios
                githubInventario.guardarCambiosLocalmente(productos);
                
                await cargarProductos();
                console.log('🗑️ Producto eliminado:', productoEliminado);
                alert('Producto eliminado exitosamente.');
                
            } catch (error) {
                console.error('Error eliminando producto:', error);
                alert('Error al eliminar el producto. Intenta nuevamente.');
            }
        }
    }
});