// github-inventario.js - Sistema con GitHub (VERSIÓN MEJORADA)
class GitHubInventario {
    constructor() {
        // URL corregida - usando proxy para evitar problemas CORS
        this.inventarioURL = 'https://raw.githubusercontent.com/erickdelab/Souvenirs-ITP/main/inventario.json';
        this.localKey = 'itpshop_inventario_local';
    }

    // Cargar inventario desde GitHub
    async cargarInventario() {
        try {
            console.log('🌐 Cargando inventario desde GitHub...', this.inventarioURL);
            
            // Agregar timestamp para evitar cache
            const urlConTimestamp = `${this.inventarioURL}?t=${Date.now()}`;
            const response = await fetch(urlConTimestamp);
            
            console.log('📡 Response status:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('✅ Inventario cargado desde GitHub:', data);
            
            if (!data.productos) {
                throw new Error('Estructura de datos incorrecta: falta propiedad "productos"');
            }
            
            // Guardar localmente para cache
            localStorage.setItem(this.localKey, JSON.stringify(data.productos));
            
            return data.productos;
        } catch (error) {
            console.error('⚠️ Error cargando desde GitHub:', error);
            console.log('🔄 Usando cache local...');
            return this.cargarDesdeLocal();
        }
    }

    // Cargar desde localStorage (fallback)
    cargarDesdeLocal() {
        const localData = localStorage.getItem(this.localKey);
        if (localData) {
            try {
                console.log('📦 Cargando desde cache local');
                const productos = JSON.parse(localData);
                console.log('📦 Productos en cache:', productos);
                return productos;
            } catch (parseError) {
                console.error('❌ Error parseando cache local:', parseError);
            }
        }
        
        console.log('📋 Usando productos por defecto');
        return this.obtenerProductosPorDefecto();
    }

    // Guardar cambios localmente (solo en este dispositivo)
    guardarCambiosLocalmente(productos) {
        try {
            localStorage.setItem(this.localKey, JSON.stringify(productos));
            console.log('💾 Cambios guardados localmente:', productos);
        } catch (error) {
            console.error('❌ Error guardando cambios locales:', error);
        }
    }

    // Productos por defecto si todo falla
    obtenerProductosPorDefecto() {
        console.log('🚨 Usando productos por defecto - verifica la conexión');
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

    // Método para verificar la conexión
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