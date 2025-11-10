// github-inventario.js - Sistema con GitHub
class GitHubInventario {
    constructor() {


        
        // REEMPLAZA con la URL RAW de tu archivo en GitHub
        this.inventarioURL = 'https://raw.githubusercontent.com/erickdelab/Souvenirs-ITP/main/inventario.json';
        this.localKey = 'itpshop_inventario_local';
    }

    // Cargar inventario desde GitHub
    async cargarInventario() {
        try {
            console.log('🌐 Cargando inventario desde GitHub...');
            const response = await fetch(this.inventarioURL);
            
            if (!response.ok) {
                throw new Error('Error al cargar desde GitHub');
            }
            
            const data = await response.json();
            console.log('✅ Inventario cargado desde GitHub');
            
            // Guardar localmente para cache
            localStorage.setItem(this.localKey, JSON.stringify(data.productos));
            
            return data.productos;
        } catch (error) {
            console.log('⚠️ Error cargando desde GitHub, usando cache local:', error);
            return this.cargarDesdeLocal();
        }
    }

    // Cargar desde localStorage (fallback)
    cargarDesdeLocal() {
        const localData = localStorage.getItem(this.localKey);
        if (localData) {
            console.log('📦 Cargando desde cache local');
            return JSON.parse(localData);
        }
        
        console.log('📋 Usando productos por defecto');
        return this.obtenerProductosPorDefecto();
    }

    // Guardar cambios localmente (solo en este dispositivo)
    guardarCambiosLocalmente(productos) {
        localStorage.setItem(this.localKey, JSON.stringify(productos));
        console.log('💾 Cambios guardados localmente');
    }

    // Productos por defecto si todo falla
    obtenerProductosPorDefecto() {
        // Estos productos solo se usarán si GitHub falla y no hay cache
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
            // Puedes agregar más productos básicos aquí como respaldo
        ];
    }
}

// Crear instancia global
const githubInventario = new GitHubInventario();