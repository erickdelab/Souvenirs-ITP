// --- Función para Cerrar Sesión ---
function cerrarSesion() {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        localStorage.removeItem('usuarioActivo');
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. LÓGICA DE UI (Mostrar/Ocultar botones) ---
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    
    if (usuarioActivo) {
        document.body.classList.add('logged-in');
        document.body.classList.remove('logged-out');
        document.getElementById('saludo-usuario').textContent = `Hola, ${usuarioActivo}`;
        document.getElementById('logout-btn').addEventListener('click', cerrarSesion);
    } else {
        document.body.classList.add('logged-out');
        document.body.classList.remove('logged-in');
    }

    // --- 2. Lógica para renderizar el carrito ---
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const cuerpo = document.querySelector('#tablaCarrito tbody');
    const totalDiv = document.getElementById('total');
    const contadorNavEl = document.getElementById('carrito-contador-nav');
    const btnContinuar = document.getElementById('continuar-compra-btn');

    function renderCarrito() {
        cuerpo.innerHTML = '';
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
                        <td style="text-align:center;">
                            <div class="cantidad-control-carrito">
                                <button class="qty-btn-carrito decrease" data-index="${index}">-</button>
                                <input type="number" class="cantidad-input-carrito" value="${p.cantidad}" min="1" data-index="${index}">
                                <button class="qty-btn-carrito increase" data-index="${index}">+</button>
                            </div>
                        </td>
                        <td style="text-align:right;">$${subtotal.toFixed(2)}</td>
                        <td style="text-align:center;">
                            <button class="btn-eliminar-item" data-index="${index}" title="Eliminar este producto">
                                🗑️ Eliminar
                            </button>
                        </td>
                    </tr>`;
            });
            if (btnContinuar) btnContinuar.style.display = 'inline-block';
            
            // Agregar event listeners
            agregarEventListenersCarrito();
        }
        
        totalDiv.textContent = `Total: $${totalGeneral.toFixed(2)}`;
        if (contadorNavEl) {
            contadorNavEl.textContent = totalItems;
        }
    }

    function agregarEventListenersCarrito() {
        // Botones de aumentar/disminuir cantidad
        document.querySelectorAll('.qty-btn-carrito').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                const isIncrease = this.classList.contains('increase');
                actualizarCantidad(index, isIncrease);
            });
        });

        // Inputs de cantidad
        document.querySelectorAll('.cantidad-input-carrito').forEach(input => {
            input.addEventListener('change', function() {
                const index = parseInt(this.getAttribute('data-index'));
                const nuevaCantidad = parseInt(this.value) || 1;
                actualizarCantidadInput(index, nuevaCantidad);
            });
        });

        // Botones de eliminar
        document.querySelectorAll('.btn-eliminar-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                eliminarDelCarrito(index);
            });
        });
    }

    function actualizarCantidad(index, isIncrease) {
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        const productoOriginal = productos.find(p => p.id == carrito[index].id);
        
        if (productoOriginal) {
            let nuevaCantidad = carrito[index].cantidad;
            
            if (isIncrease) {
                if (carrito[index].cantidad < productoOriginal.inventario) {
                    nuevaCantidad++;
                } else {
                    alert(`No hay más inventario disponible. Máximo: ${productoOriginal.inventario}`);
                    return;
                }
            } else {
                if (carrito[index].cantidad > 1) {
                    nuevaCantidad--;
                } else {
                    eliminarDelCarrito(index);
                    return;
                }
            }
            
            // Actualizar carrito
            const diferencia = nuevaCantidad - carrito[index].cantidad;
            carrito[index].cantidad = nuevaCantidad;
            
            // Actualizar inventario
            productoOriginal.inventario -= diferencia;
            const productoIndex = productos.findIndex(p => p.id == carrito[index].id);
            productos[productoIndex] = productoOriginal;
            
            localStorage.setItem('carrito', JSON.stringify(carrito));
            localStorage.setItem('productos', JSON.stringify(productos));
            renderCarrito();
        }
    }

    function actualizarCantidadInput(index, nuevaCantidad) {
        if (nuevaCantidad < 1) {
            eliminarDelCarrito(index);
            return;
        }

        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        const productoOriginal = productos.find(p => p.id == carrito[index].id);
        
        if (productoOriginal && nuevaCantidad <= productoOriginal.inventario + carrito[index].cantidad) {
            const diferencia = nuevaCantidad - carrito[index].cantidad;
            carrito[index].cantidad = nuevaCantidad;
            
            // Actualizar inventario
            productoOriginal.inventario -= diferencia;
            const productoIndex = productos.findIndex(p => p.id == carrito[index].id);
            productos[productoIndex] = productoOriginal;
            
            localStorage.setItem('carrito', JSON.stringify(carrito));
            localStorage.setItem('productos', JSON.stringify(productos));
            renderCarrito();
        } else {
            alert(`No hay suficiente inventario. Máximo disponible: ${productoOriginal.inventario + carrito[index].cantidad}`);
            renderCarrito(); // Recargar para mostrar valores correctos
        }
    }

    function eliminarDelCarrito(index) {
        if (confirm("¿Estás seguro de que quieres eliminar este producto del carrito?")) {
            const productos = JSON.parse(localStorage.getItem('productos')) || [];
            
            // Devolver el producto al inventario
            const productoIndex = productos.findIndex(p => p.id == carrito[index].id);
            if (productoIndex !== -1) {
                productos[productoIndex].inventario += carrito[index].cantidad;
                localStorage.setItem('productos', JSON.stringify(productos));
            }
            
            // Eliminar del carrito
            carrito.splice(index, 1);
            localStorage.setItem('carrito', JSON.stringify(carrito));
            
            renderCarrito();
            alert('Producto eliminado del carrito.');
        }
    }

    function vaciarCarrito() {
        if (confirm("¿Estás seguro de que quieres vaciar todo tu carrito?")) {
            const productos = JSON.parse(localStorage.getItem('productos')) || [];
            
            // Devolver todos los productos al inventario
            carrito.forEach(itemCarrito => {
                const productoIndex = productos.findIndex(p => p.id == itemCarrito.id);
                if (productoIndex !== -1) {
                    productos[productoIndex].inventario += itemCarrito.cantidad;
                }
            });
            
            localStorage.setItem('productos', JSON.stringify(productos));
            localStorage.removeItem('carrito');
            renderCarrito();
        }
    }
    
    // Asignar eventos
    document.getElementById('vaciar-btn').addEventListener('click', vaciarCarrito);

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

    // Renderizar inicial
    renderCarrito();
});