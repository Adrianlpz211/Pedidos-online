/* ===================================
   JAVASCRIPT MÓDULO OFERTAS
   =================================== */

(function() {
    'use strict';
    
    console.log('Módulo Ofertas cargado');
    
    // Variables del módulo
    let ofertasActivas = [];
    
    // Inicialización
    function init() {
        setupEventListeners();
    }
    
    // Event Listeners
    function setupEventListeners() {
        const btnOfertas = document.querySelector('.menu-btn[data-module="ofertas"]');
        
        if (btnOfertas) {
            btnOfertas.addEventListener('click', function() {
                cargarOfertas();
            });
        }
    }
    
    // Cargar ofertas
    function cargarOfertas() {
        console.log('Cargando ofertas...');
        // Aquí se implementará la lógica para cargar ofertas
        // Por ahora solo muestra los productos existentes
    }
    
    // Filtrar productos con descuento
    function filtrarProductosConDescuento() {
        const productos = document.querySelectorAll('.product-card');
        productos.forEach(producto => {
            const descuento = producto.querySelector('.discount-badge');
            if (!descuento) {
                producto.style.display = 'none';
            } else {
                producto.style.display = 'block';
            }
        });
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();

