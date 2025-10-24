/* ===================================
   GESTIÓN DE IMÁGENES ULTRA SIMPLE
   Mejora B2 - Gestión de imágenes (Versión Ultra Simple)
   =================================== */

(function() {
    'use strict';
    
    console.log('🖼️ Image Manager Ultra Simple cargado');
    
    function loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        console.log(`🔍 Encontradas ${lazyImages.length} imágenes lazy`);
        
        lazyImages.forEach(img => {
            const dataSrc = img.getAttribute('data-src');
            if (dataSrc) {
                console.log(`🔄 Cargando imagen: ${dataSrc}`);
                
                // Cargar imagen directamente
                img.src = dataSrc;
                img.classList.remove('image-skeleton');
                img.classList.add('image-loaded');
                
                // Remover atributo data-src
                img.removeAttribute('data-src');
                
                // Manejar errores
                img.onerror = function() {
                    console.warn(`❌ Error cargando imagen: ${dataSrc}`);
                    this.src = 'img/placeholder.svg';
                    this.classList.add('image-error');
                };
                
                img.onload = function() {
                    console.log(`✅ Imagen cargada: ${dataSrc}`);
                };
            }
        });
    }
    
    function setupImageErrorHandling() {
        // Manejar errores de imágenes existentes
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG' && e.target.src) {
                console.warn(`❌ Error en imagen existente: ${e.target.src}`);
                e.target.src = 'img/placeholder.svg';
                e.target.classList.add('image-error');
            }
        }, true);
    }
    
    function getStats() {
        const totalImages = document.querySelectorAll('img').length;
        const loadedImages = document.querySelectorAll('img.image-loaded').length;
        const errorImages = document.querySelectorAll('img.image-error').length;
        
        return {
            total: totalImages,
            loaded: loadedImages,
            failed: errorImages
        };
    }
    
    // Exponer funciones globalmente
    window.loadAllImages = loadAllImages;
    window.getImageStats = getStats;
    
    // Inicializar
    setupImageErrorHandling();
    
    // Cargar imágenes cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAllImages);
    } else {
        loadAllImages();
    }
    
    console.log('✅ Image Manager Ultra Simple listo');
    
})();
