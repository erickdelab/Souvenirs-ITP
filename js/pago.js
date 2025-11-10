// --- Función para Cerrar Sesión (la necesitamos aquí también) ---
function cerrarSesion() {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        localStorage.removeItem('usuarioActivo');
        localStorage.removeItem('carrito'); // Limpia el carrito al salir
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Verificaciones de Seguridad ---
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Verificación 1: Si no hay usuario, no puede estar aquí
    if (!usuarioActivo) {
        alert("Debes iniciar sesión para pagar.");
        window.location.href = "login.html";
        return; // Detiene la ejecución
    }

    // Verificación 2: Si el carrito está vacío, no puede estar aquí
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        window.location.href = "index.html";
        return; // Detiene la ejecución
    }

    // --- 2. Cargar UI de la Barra de Navegación ---
    document.body.classList.add('logged-in'); // Siempre está logueado en esta pág.
    document.body.classList.remove('logged-out');
    document.getElementById('saludo-usuario').textContent = `Hola, ${usuarioActivo}`;
    document.getElementById('logout-btn').addEventListener('click', cerrarSesion);

    const contadorNavEl = document.getElementById('carrito-contador-nav');
    const totalPagarEl = document.getElementById('total-pagar');
    
    // --- 3. Calcular y Mostrar Total ---
    let totalGeneral = 0;
    let totalItems = 0;
    
    carrito.forEach(p => {
        totalGeneral += p.precio * p.cantidad;
        totalItems += p.cantidad;
    });

    // Mostramos los totales en la página
    contadorNavEl.textContent = totalItems;
    totalPagarEl.textContent = `$${totalGeneral.toFixed(2)}`;

    // --- 4. Lógica de Simulación de Pago ---
    const paymentForm = document.getElementById('payment-form');
    const pagarBtn = document.getElementById('pagar-btn');
    const msgPago = document.getElementById('msg-pago');

    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita que la página se recargue

        // --- VALIDACIÓN ACTUALIZADA ---
        // Obtenemos todos los valores
        const nombre = document.getElementById('nombre-tarjeta').value;
        const numero = document.getElementById('numero-tarjeta').value;
        const exp = document.getElementById('exp-fecha').value;
        const cvv = document.getElementById('cvv').value;
        
        // Campos de dirección añadidos
        const direccion = document.getElementById('direccion').value;
        const colonia = document.getElementById('colonia').value;
        const ciudad = document.getElementById('ciudad').value;
        const cp = document.getElementById('cp').value;

        // Validamos que NINGUNO esté vacío
        if (!nombre || !numero || !exp || !cvv || !direccion || !colonia || !ciudad || !cp) {
            msgPago.style.color = "red";
            msgPago.textContent = "Por favor, completa todos los campos de envío y pago.";
            return;
        }
        // --- FIN DE VALIDACIÓN ACTUALIZADA ---


        // --- Inicia la Simulación ---
        msgPago.style.color = "blue";
        msgPago.textContent = "Procesando pago... ⏳";
        pagarBtn.disabled = true; // Deshabilitamos el botón

        // En pago.js, dentro del setTimeout del pago exitoso:
// En pago.js, dentro del setTimeout del pago exitoso:
setTimeout(() => {
    // 1. Obtener productos y carrito
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // 2. Registrar la venta (opcional para historial)
    // Podríamos guardar un historial de ventas aquí si quisieras
    
    // 3. Vaciamos el carrito (el inventario ya se redujo cuando se agregó al carrito)
    localStorage.removeItem('carrito');
    
    // 4. Redirigimos al inicio
    window.location.href = "index.html";
}, 2500);
    });
});