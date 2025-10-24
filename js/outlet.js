/* ===================================
   JAVASCRIPT MÓDULO CATÁLOGO
   =================================== */

(function() {
    'use strict';
    
    console.log('Módulo Catálogo cargado');
    
    // Inicialización
    function init() {
        setupEventListeners();
    }
    
    // Event Listeners
    function setupEventListeners() {
        const btnCatalogo = document.querySelector('.menu-btn[data-module="outlet"]');
        
        if (btnCatalogo) {
            btnCatalogo.addEventListener('click', function() {
                volverAlCatalogo();
            });
        }
    }
    
    // Volver al catálogo principal (index)
    function volverAlCatalogo() {
        console.log('Volviendo al catálogo principal...');
        
        // Ocultar sección de deseos si está visible
        const deseosSection = document.getElementById('deseosContainer');
        if (deseosSection) {
            deseosSection.style.display = 'none';
        }
        
        // Mostrar grid principal
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.style.display = 'grid';
        }
        
        // Remover clase active de todos los botones
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Agregar clase active al botón de catálogo
        const btnCatalogo = document.querySelector('.menu-btn[data-module="outlet"]');
        if (btnCatalogo) {
            btnCatalogo.classList.add('active');
        }
        
        // Scroll al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Exportar funciones
    window.catalogoModule = {
        volverAlCatalogo
    };
    
})();

