// admin.js
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si es admin
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    const esAdmin = localStorage.getItem('esAdmin') === 'true';
    
    if (!usuarioActivo || !esAdmin) {
        alert('No tienes permisos para acceder a esta página.');
        window.location.href = 'index.html';
        return;
    }

    // Cargar UI
    document.getElementById('saludo-usuario').textContent = `Hola, ${usuarioActivo}`;
    document.getElementById('logout-btn').addEventListener('click', cerrarSesion);

    // Elementos del DOM
    const modal = document.getElementById('modal-producto');
    const btnAgregar = document.getElementById('btn-agregar');
    const btnCerrarModal = document.querySelector('.cerrar');
    const formProducto = document.getElementById('form-producto');
    const cuerpoTabla = document.getElementById('cuerpo-tabla');

    // Cargar productos al iniciar
    cargarProductos(); // ✅ LLAMAR LA FUNCIÓN AL INICIO

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

    function cargarProductos() {
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        cuerpoTabla.innerHTML = '';

        if (productos.length === 0) {
            cuerpoTabla.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem;">No hay productos registrados</td></tr>';
            return;
        }

        productos.forEach(producto => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${producto.id}</td>
                <td><img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-producto" onerror="this.src='https://via.placeholder.com/50?text=Imagen+no+disponible'"></td>
                <td>${producto.nombre}</td>
                <td>$${producto.precio}</td>
                <td>${producto.descripcion.substring(0, 50)}...</td>
                <td>${producto.inventario}</td>
                <td class="acciones-producto">
                    <button class="btn-editar" onclick="editarProducto('${producto.id}')">✏️ Editar</button> <!-- ✅ CORREGIDO: comillas para string -->
                    <button class="btn-eliminar" onclick="eliminarProducto('${producto.id}')">🗑️ Eliminar</button> <!-- ✅ CORREGIDO: comillas para string -->
                </td>
            `;
            cuerpoTabla.appendChild(fila);
        });
    }

    function guardarProducto(e) {
        e.preventDefault();
        
        const producto = {
            id: document.getElementById('producto-id').value || Date.now().toString(),
            nombre: document.getElementById('producto-nombre').value,
            precio: parseFloat(document.getElementById('producto-precio').value),
            imagen: document.getElementById('producto-imagen').value,
            descripcion: document.getElementById('producto-descripcion').value,
            inventario: parseInt(document.getElementById('producto-inventario').value),
            categoria: document.getElementById('producto-categoria').value
        };

        let productos = JSON.parse(localStorage.getItem('productos')) || [];
        
        if (document.getElementById('producto-id').value) {
            // Editar producto existente
            const index = productos.findIndex(p => p.id === producto.id);
            if (index !== -1) {
                productos[index] = producto;
            }
        } else {
            // Agregar nuevo producto
            productos.push(producto);
        }

        localStorage.setItem('productos', JSON.stringify(productos));
        cargarProductos();
        cerrarModal();
        alert('Producto guardado exitosamente.');
    }

    // Hacer funciones globales para los botones de acción
    window.editarProducto = function(id) {
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        const producto = productos.find(p => p.id == id); // ✅ == en lugar de === para comparar string con número
        if (producto) {
            abrirModal(producto);
        }
    };

    window.eliminarProducto = function(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            let productos = JSON.parse(localStorage.getItem('productos')) || [];
            productos = productos.filter(p => p.id != id); // ✅ != en lugar de !== para comparar string con número
            localStorage.setItem('productos', JSON.stringify(productos));
            cargarProductos();
            alert('Producto eliminado exitosamente.');
        }
    };
});