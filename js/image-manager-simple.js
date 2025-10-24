/* ===================================
   GESTIÓN DE IMÁGENES SIMPLE
   Mejora B2 - Gestión de imágenes (Versión Simple)
   =================================== */

(function() {
    'use strict';
    
    console.log('🖼️ Image Manager Simple cargado');
    
    class SimpleImageManager {
        constructor() {
            this.loadedImages = new Set();
            this.failedImages = new Set();
            this.skeletonClass = 'image-skeleton';
            this.loadingClass = 'image-loading';
            this.loadedClass = 'image-loaded';
            this.errorClass = 'image-error';
            
            this.init();
        }
        
        init() {
            this.setupImageErrorHandling();
            this.loadAllImages();
            console.log('✅ Image Manager Simple inicializado');
        }
        
        loadAllImages() {
            const lazyImages = document.querySelectorAll('img[data-src]');
            console.log(`🔍 Encontradas ${lazyImages.length} imágenes lazy`);
            
            lazyImages.forEach(img => {
                this.loadImage(img);
            });
        }
        
        loadImage(img) {
            const dataSrc = img.getAttribute('data-src');
            if (!dataSrc) return;
            
            // Verificar si ya se cargó
            if (this.loadedImages.has(dataSrc) || this.failedImages.has(dataSrc)) {
                return;
            }
            
            // Agregar clases de estado
            img.classList.add(this.loadingClass);
            img.classList.remove(this.skeletonClass);
            
            // Crear imagen temporal para preload
            const tempImg = new Image();
            
            tempImg.onload = () => {
                // Imagen cargada exitosamente
                img.src = dataSrc;
                img.classList.remove(this.loadingClass);
                img.classList.add(this.loadedClass);
                this.loadedImages.add(dataSrc);
                
                // Remover atributo data-src
                img.removeAttribute('data-src');
                
                console.log(`✅ Imagen cargada: ${dataSrc}`);
            };
            
            tempImg.onerror = () => {
                // Error al cargar imagen
                this.handleImageError(img, dataSrc);
            };
            
            // Iniciar carga
            tempImg.src = dataSrc;
        }
        
        handleImageError(img, originalSrc) {
            img.classList.remove(this.loadingClass);
            img.classList.add(this.errorClass);
            this.failedImages.add(originalSrc);
            
            // Intentar fallback
            const fallbackSrc = this.getFallbackImage(originalSrc);
            img.src = fallbackSrc;
            
            console.warn(`❌ Error cargando imagen: ${originalSrc}, usando fallback: ${fallbackSrc}`);
        }
        
        getFallbackImage(originalSrc) {
            // Lógica de fallback inteligente
            if (originalSrc.includes('productos/')) {
                return 'img/placeholder.svg';
            }
            if (originalSrc.includes('promociones/')) {
                return 'img/placeholder-promocion-1.svg';
            }
            if (originalSrc.includes('logo')) {
                return 'img/placeholder.svg';
            }
            return 'img/placeholder.svg';
        }
        
        setupImageErrorHandling() {
            // Manejar errores de imágenes existentes
            document.addEventListener('error', (e) => {
                if (e.target.tagName === 'IMG') {
                    this.handleImageError(e.target, e.target.src);
                }
            }, true);
        }
        
        // Método para agregar lazy loading a nuevas imágenes
        addLazyImage(img) {
            this.loadImage(img);
        }
        
        // Método para recargar todas las imágenes
        reload() {
            this.loadedImages.clear();
            this.failedImages.clear();
            this.loadAllImages();
        }
        
        // Método para obtener estadísticas
        getStats() {
            return {
                loaded: this.loadedImages.size,
                failed: this.failedImages.size,
                total: document.querySelectorAll('img').length
            };
        }
    }
    
    // Crear instancia global
    window.ImageManager = new SimpleImageManager();
    
    // Exponer métodos útiles globalmente
    window.addLazyImage = (img) => window.ImageManager.addLazyImage(img);
    window.reloadImages = () => window.ImageManager.reload();
    window.getImageStats = () => window.ImageManager.getStats();
    
    console.log('✅ Image Manager Simple listo');
    
})();
