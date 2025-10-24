/* ===================================
   GESTIÓN DE IMÁGENES OPTIMIZADA
   Mejora B2 - Gestión de imágenes
   =================================== */

(function() {
    'use strict';
    
    console.log('🖼️ Image Manager cargado');
    
    class ImageManager {
        constructor() {
            this.observer = null;
            this.loadedImages = new Set();
            this.failedImages = new Set();
            this.skeletonClass = 'image-skeleton';
            this.loadingClass = 'image-loading';
            this.loadedClass = 'image-loaded';
            this.errorClass = 'image-error';
            
            this.init();
        }
        
        init() {
            this.setupIntersectionObserver();
            this.setupImageErrorHandling();
            this.preloadCriticalImages();
            console.log('✅ Image Manager inicializado');
        }
        
        setupIntersectionObserver() {
            // Verificar soporte de Intersection Observer
            if (!('IntersectionObserver' in window)) {
                console.warn('⚠️ IntersectionObserver no soportado, cargando todas las imágenes');
                this.loadAllImages();
                return;
            }
            
            const options = {
                root: null,
                rootMargin: '50px', // Cargar 50px antes de que sea visible
                threshold: 0.1
            };
            
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, options);
            
            // Observar todas las imágenes lazy
            this.observeLazyImages();
        }
        
        observeLazyImages() {
            const lazyImages = document.querySelectorAll('img[data-src]');
            console.log(`🔍 Encontradas ${lazyImages.length} imágenes lazy`);
            
            lazyImages.forEach(img => {
                this.observer.observe(img);
            });
        }
        
        loadImage(img) {
            const dataSrc = img.getAttribute('data-src');
            if (!dataSrc) return;
            
            // Verificar si ya se está cargando o ya se cargó
            if (img.classList.contains(this.loadingClass) || 
                img.classList.contains(this.loadedClass) || 
                this.loadedImages.has(dataSrc) || 
                this.failedImages.has(dataSrc)) {
                return;
            }
            
            // Agregar clases de estado
            img.classList.add(this.loadingClass);
            img.classList.remove(this.skeletonClass);
            
            // Crear imagen temporal para preload
            const tempImg = new Image();
            
            // Timeout para evitar bucles infinitos
            const timeout = setTimeout(() => {
                console.warn(`⏰ Timeout cargando imagen: ${dataSrc}`);
                this.handleImageError(img, dataSrc);
            }, 10000); // 10 segundos timeout
            
            tempImg.onload = () => {
                clearTimeout(timeout);
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
                clearTimeout(timeout);
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
        
        preloadCriticalImages() {
            // Preload de imágenes críticas (hero, logo, etc.)
            const criticalImages = [
                'img/productos/microonda.jpg',
                'img/placeholder.svg'
            ];
            
            criticalImages.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        }
        
        loadAllImages() {
            // Fallback para navegadores sin IntersectionObserver
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => {
                this.loadImage(img);
            });
        }
        
        // Método para agregar lazy loading a nuevas imágenes
        addLazyImage(img) {
            if (this.observer) {
                this.observer.observe(img);
            } else {
                this.loadImage(img);
            }
        }
        
        // Método para crear skeleton loading
        createSkeletonImage(container) {
            const skeleton = document.createElement('div');
            skeleton.className = `skeleton-image ${this.skeletonClass}`;
            skeleton.innerHTML = `
                <div class="skeleton-shimmer"></div>
            `;
            return skeleton;
        }
        
        // Método para optimizar imagen existente
        optimizeImage(img) {
            // Agregar lazy loading si no lo tiene
            if (!img.hasAttribute('data-src') && img.src) {
                img.setAttribute('data-src', img.src);
                img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=';
                this.addLazyImage(img);
            }
        }
        
        // Método para recargar todas las imágenes
        reload() {
            this.loadedImages.clear();
            this.failedImages.clear();
            this.observeLazyImages();
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
    window.ImageManager = new ImageManager();
    
    // Exponer métodos útiles globalmente
    window.addLazyImage = (img) => window.ImageManager.addLazyImage(img);
    window.optimizeImage = (img) => window.ImageManager.optimizeImage(img);
    window.reloadImages = () => window.ImageManager.reload();
    window.getImageStats = () => window.ImageManager.getStats();
    
    console.log('✅ Image Manager listo');
    
})();
