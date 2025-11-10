// github-inventario.js - SISTEMA HÍBRIDO MEJORADO
class GitHubInventario {
    constructor() {
        this.inventarioURL = 'https://raw.githubusercontent.com/erickdelab/Souvenirs-ITP/main/inventario.json';
        this.localKey = 'itpshop_inventario_local';
        this.cambiosPendientesKey = 'itpshop_cambios_pendientes';
    }

    async cargarInventario() {
        try {
            console.log('🌐 Cargando inventario desde GitHub...');
            const response = await fetch(`${this.inventarioURL}?t=${Date.now()}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Inventario cargado desde GitHub');
            
            // Aplicar cambios pendientes locales
            const productosConCambios = await this.aplicarCambiosPendientes(data.productos);
            
            // Guardar localmente para cache
            localStorage.setItem(this.localKey, JSON.stringify(productosConCambios));
            
            return productosConCambios;
        } catch (error) {
            console.log('⚠️ Error cargando desde GitHub, usando cache local:', error);
            return this.cargarDesdeLocal();
        }
    }

    cargarDesdeLocal() {
        const localData = localStorage.getItem(this.localKey);
        if (localData) {
            console.log('📦 Cargando desde cache local');
            return JSON.parse(localData);
        }
        
        console.log('📋 Usando productos por defecto');
        return this.obtenerProductosPorDefecto();
    }

    // Guardar cambios localmente y marcar como pendientes
    async guardarCambiosLocalmente(productos) {
        try {
            // Guardar el estado actual
            localStorage.setItem(this.localKey, JSON.stringify(productos));
            console.log('💾 Cambios guardados localmente');
            
            // Guardar cambios pendientes para sincronización futura
            this.guardarCambiosPendientes();
            
            return true;
        } catch (error) {
            console.error('❌ Error guardando cambios locales:', error);
            return false;
        }
    }

    // Guardar cambios pendientes para sincronización
    guardarCambiosPendientes() {
        const cambios = {
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        localStorage.setItem(this.cambiosPendientesKey, JSON.stringify(cambios));
    }

    // Aplicar cambios pendientes a los productos
    async aplicarCambiosPendientes(productos) {
        const cambiosPendientes = localStorage.getItem(this.cambiosPendientesKey);
        if (!cambiosPendientes) return productos;

        console.log('🔄 Aplicando cambios pendientes...');
        // Aquí podrías aplicar lógica específica de sincronización
        // Por ahora solo devolvemos los productos locales si existen
        const productosLocales = this.cargarDesdeLocal();
        return productosLocales.length > 0 ? productosLocales : productos;
    }

    // Exportar datos para backup
    exportarDatos() {
        const productos = this.cargarDesdeLocal();
        return {
            productos: productos,
            exportado: new Date().toISOString(),
            total: productos.length
        };
    }

    obtenerProductosPorDefecto() {
        return [
            {
                id: "1",
                nombre: "Camiseta Clásica ITP",
                precio: 250,
                imagen: "https://github.com/SAMUELWEB11/ProyectoITPshop/blob/main/camiseta-itp.jpeg?raw=true",
                descripcion: "Camiseta 100% algodón con el logo del instituto en el pecho.",
                inventario: 10,
                categoria: "ropa"
            },
            {
                id: "2",
                nombre: "Sudadera con Capucha",
                precio: 450,
                imagen: "https://github.com/SAMUELWEB11/ProyectoITPshop/blob/main/sudadera-itp.jpeg?raw=true",
                descripcion: "Sudadera cómoda con el texto 'Instituto Tecnológico de Puebla'.",
                inventario: 8,
                categoria: "ropa"
            }
        ];
    }

    async verificarConexion() {
        try {
            const response = await fetch(this.inventarioURL);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Crear instancia global
const githubInventario = new GitHubInventario();