// carrito.js - VERSIÓN CORREGIDA
// --- Función para Cerrar Sesión ---
function cerrarSesion() {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        localStorage.removeItem('usuarioActivo');
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    
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

    async function renderCarrito() {
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
        
        // Actualizar localStorage
        localStorage.setItem('carrito', JSON.stringify(carrito));
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

    async function actualizarCantidad(index, isIncrease) {
        try {
            // Cargar inventario actual
            const productos = await githubInventario.cargarInventario();
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
                        await eliminarDelCarrito(index);
                        return;
                    }
                }
                
                // Calcular diferencia para actualizar inventario
                const diferencia = nuevaCantidad - carrito[index].cantidad;
                carrito[index].cantidad = nuevaCantidad;
                
                // Actualizar inventario
                productoOriginal.inventario -= diferencia;
                const productoIndex = productos.findIndex(p => p.id == carrito[index].id);
                productos[productoIndex] = productoOriginal;
                
                // Guardar cambios
                localStorage.setItem('carrito', JSON.stringify(carrito));
                await githubInventario.guardarCambiosLocalmente(productos);
                
                await renderCarrito();
            }
        } catch (error) {
            console.error('Error actualizando cantidad:', error);
            alert('Error al actualizar la cantidad');
        }
    }

    async function actualizarCantidadInput(index, nuevaCantidad) {
        if (nuevaCantidad < 1) {
            await eliminarDelCarrito(index);
            return;
        }

        try {
            const productos = await githubInventario.cargarInventario();
            const productoOriginal = productos.find(p => p.id == carrito[index].id);
            
            if (productoOriginal) {
                // Verificar inventario disponible (incluyendo lo que ya está en carrito)
                const inventarioDisponible = productoOriginal.inventario + carrito[index].cantidad;
                
                if (nuevaCantidad <= inventarioDisponible) {
                    const diferencia = nuevaCantidad - carrito[index].cantidad;
                    carrito[index].cantidad = nuevaCantidad;
                    
                    // Actualizar inventario
                    productoOriginal.inventario -= diferencia;
                    const productoIndex = productos.findIndex(p => p.id == carrito[index].id);
                    productos[productoIndex] = productoOriginal;
                    
                    // Guardar cambios
                    localStorage.setItem('carrito', JSON.stringify(carrito));
                    await githubInventario.guardarCambiosLocalmente(productos);
                    
                    await renderCarrito();
                } else {
                    alert(`No hay suficiente inventario. Máximo disponible: ${inventarioDisponible}`);
                    await renderCarrito(); // Recargar para mostrar valores correctos
                }
            }
        } catch (error) {
            console.error('Error actualizando cantidad:', error);
            alert('Error al actualizar la cantidad');
        }
    }

    async function eliminarDelCarrito(index) {
        if (confirm("¿Estás seguro de que quieres eliminar este producto del carrito?")) {
            try {
                const productos = await githubInventario.cargarInventario();
                
                // Devolver el producto al inventario
                const productoIndex = productos.findIndex(p => p.id == carrito[index].id);
                if (productoIndex !== -1) {
                    productos[productoIndex].inventario += carrito[index].cantidad;
                    await githubInventario.guardarCambiosLocalmente(productos);
                }
                
                // Eliminar del carrito
                carrito.splice(index, 1);
                localStorage.setItem('carrito', JSON.stringify(carrito));
                
                await renderCarrito();
                alert('Producto eliminado del carrito.');
            } catch (error) {
                console.error('Error eliminando del carrito:', error);
                alert('Error al eliminar el producto del carrito');
            }
        }
    }

    async function vaciarCarrito() {
        if (confirm("¿Estás seguro de que quieres vaciar todo tu carrito?")) {
            try {
                const productos = await githubInventario.cargarInventario();
                
                // Devolver todos los productos al inventario
                for (const itemCarrito of carrito) {
                    const productoIndex = productos.findIndex(p => p.id == itemCarrito.id);
                    if (productoIndex !== -1) {
                        productos[productoIndex].inventario += itemCarrito.cantidad;
                    }
                }
                
                // Guardar cambios en el inventario
                await githubInventario.guardarCambiosLocalmente(productos);
                
                // Vaciar carrito
                carrito = [];
                localStorage.removeItem('carrito');
                
                await renderCarrito();
                alert('Carrito vaciado exitosamente. Los productos han sido regresados al inventario.');
            } catch (error) {
                console.error('Error vaciando carrito:', error);
                alert('Error al vaciar el carrito');
            }
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
    await renderCarrito();
});