/* ===================================
   MÓDULO LONUEVO (Deseos)
   =================================== */

(function() {
    'use strict';
    
    console.log('Módulo Lonuevo cargado');
    
    // Variables del módulo
    let deseosData = {};
    
    // ===================================
    // FUNCIONES PRINCIPALES
    // ===================================
    
    function init() {
        console.log('Inicializando módulo Lonuevo...');
        cargarDeseos();
        console.log('✅ Módulo Lonuevo inicializado');
    }
    
    function cargarDeseos() {
        const saved = localStorage.getItem('deseos');
        if (saved) {
            deseosData = JSON.parse(saved);
        }
        console.log('Deseos cargados:', Object.keys(deseosData).length);
    }
    
    function guardarDeseos() {
        localStorage.setItem('deseos', JSON.stringify(deseosData));
    }
    
    function toggleDeseo(productId) {
        if (deseosData[productId]) {
            delete deseosData[productId];
            console.log('Producto removido de deseos:', productId);
        } else {
            deseosData[productId] = {
                id: productId,
                liked: true,
                fecha: new Date().toISOString()
            };
            console.log('Producto agregado a deseos:', productId);
        }
        guardarDeseos();
        actualizarUI();
    }
    
    function actualizarUI() {
        // Actualizar contadores de likes
        document.querySelectorAll('.like-btn').forEach(btn => {
            const productId = btn.getAttribute('data-product');
            const countSpan = btn.querySelector('.like-count');
            
            if (deseosData[productId] && deseosData[productId].liked) {
                btn.classList.add('liked');
                btn.querySelector('i').className = 'fas fa-heart';
                if (countSpan) {
                    countSpan.textContent = '1';
                }
            } else {
                btn.classList.remove('liked');
                btn.querySelector('i').className = 'far fa-heart';
                if (countSpan) {
                    countSpan.textContent = '0';
                }
            }
        });
    }
    
    function getDeseosCount() {
        return Object.values(deseosData).filter(item => item.liked).length;
    }
    
    // ===================================
    // FUNCIONES GLOBALES
    // ===================================
    
    window.LonuevoModule = {
        init,
        toggleDeseo,
        getDeseosCount,
        cargarDeseos,
        guardarDeseos
    };
    
    // Exponer funciones individuales
    window.toggleDeseo = toggleDeseo;
    window.getDeseosCount = getDeseosCount;
    
    // Inicializar cuando se carga el módulo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
