/* ===================================
   JAVASCRIPT HERO SLIDER PROMOCIONES
   =================================== */

(function() {
    'use strict';
    
    console.log('Módulo Hero Promociones cargado');
    
    // Configuración del slider (será configurable desde dashboard)
    let sliderConfig = {
        autoPlay: true,
        autoPlayInterval: 5000, // 5 segundos
        showNav: true,
        showIndicators: true,
        slides: [] // Se cargará dinámicamente
    };
    
    let currentSlide = 0;
    let autoPlayTimer = null;
    let isTransitioning = false;
    
    // Inicialización
    function init() {
        cargarConfiguracion();
        setupSlider();
        setupEventListeners();
        
        if (sliderConfig.autoPlay && sliderConfig.slides.length > 1) {
            startAutoPlay();
        }
    }
    
    // Cargar configuración desde localStorage o usar default
    function cargarConfiguracion() {
        const savedConfig = localStorage.getItem('heroPromocionesConfig');
        
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            sliderConfig = { ...sliderConfig, ...config };
        } else {
            // Configuración por defecto (ejemplo)
            sliderConfig.slides = [
                {
                    id: 1,
                    image: 'img/promociones/promo1.jpg',
                    showButtons: true,
                    whatsappMessage: 'Me interesa esta promoción'
                },
                {
                    id: 2,
                    image: 'img/promociones/promo2.jpg',
                    showButtons: true,
                    whatsappMessage: 'Quiero información sobre esta oferta'
                },
                {
                    id: 3,
                    image: 'img/promociones/promo3.jpg',
                    showButtons: false
                }
            ];
        }
        
        // Ocultar hero si no hay slides o está desactivado
        const heroSection = document.getElementById('heroPromociones');
        if (!sliderConfig.slides || sliderConfig.slides.length === 0 || sliderConfig.hidden) {
            if (heroSection) {
                heroSection.classList.add('hidden');
            }
        }
    }
    
    // Setup del slider
    function setupSlider() {
        const wrapper = document.getElementById('heroSliderWrapper');
        const indicators = document.getElementById('heroIndicators');
        
        if (!wrapper || !indicators) return;
        
        // Limpiar contenido
        wrapper.innerHTML = '';
        indicators.innerHTML = '';
        
        // Crear slides
        sliderConfig.slides.forEach((slide, index) => {
            // Crear slide
            const slideElement = document.createElement('div');
            slideElement.className = 'hero-slide';
            slideElement.setAttribute('data-slide', index);
            
            // Imagen
            const img = document.createElement('img');
            img.src = slide.image;
            img.alt = `Promoción ${index + 1}`;
            img.onerror = function() {
                this.src = 'img/placeholder-promocion-' + (index + 1) + '.svg';
            };
            slideElement.appendChild(img);
            
            // Botones (si están habilitados)
            const overlay = document.createElement('div');
            overlay.className = 'hero-slide-overlay';
            
            // Botón Pedir (si está habilitado)
            if (slide.showPedirButton !== false) {
                const btnPedir = document.createElement('button');
                btnPedir.className = 'hero-slide-btn-pedir';
                btnPedir.innerHTML = '<i class="fas fa-shopping-bag"></i> Ver Oferta';
                btnPedir.onclick = () => handlePedirClick(slide);
                overlay.appendChild(btnPedir);
            }
            
            // Botón WhatsApp (si está habilitado)
            if (slide.showWhatsAppButton !== false) {
                const btnWhatsapp = document.createElement('button');
                btnWhatsapp.className = 'hero-slide-btn-whatsapp';
                btnWhatsapp.innerHTML = '<i class="fab fa-whatsapp"></i> Consultar';
                btnWhatsapp.onclick = () => handleWhatsappClick(slide);
                overlay.appendChild(btnWhatsapp);
            }
            
            // Solo agregar overlay si tiene botones
            if (overlay.children.length > 0) {
                slideElement.appendChild(overlay);
            }
            
            wrapper.appendChild(slideElement);
            
            // Crear indicador
            const indicator = document.createElement('button');
            indicator.className = 'hero-indicator';
            if (index === 0) indicator.classList.add('active');
            indicator.setAttribute('data-slide', index);
            indicator.onclick = () => goToSlide(index);
            indicators.appendChild(indicator);
        });
        
        // Ocultar controles si solo hay un slide
        if (sliderConfig.slides.length <= 1) {
            document.querySelector('.hero-nav-prev')?.classList.add('hidden');
            document.querySelector('.hero-nav-next')?.classList.add('hidden');
            indicators.style.display = 'none';
        }
    }
    
    // Event Listeners
    function setupEventListeners() {
        const prevBtn = document.getElementById('heroPrev');
        const nextBtn = document.getElementById('heroNext');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => previousSlide());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => nextSlide());
        }
        
        // Touch/swipe support
        setupTouchEvents();
    }
    
    // Touch events para swipe en móvil
    function setupTouchEvents() {
        const container = document.getElementById('heroSliderContainer');
        if (!container) return;
        
        let startX = 0;
        let endX = 0;
        
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        container.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) { // Mínimo 50px de swipe
                if (diff > 0) {
                    nextSlide();
                } else {
                    previousSlide();
                }
            }
        }
    }
    
    // Navegación
    function nextSlide() {
        if (isTransitioning) return;
        const nextIndex = (currentSlide + 1) % sliderConfig.slides.length;
        goToSlide(nextIndex);
    }
    
    function previousSlide() {
        if (isTransitioning) return;
        const prevIndex = (currentSlide - 1 + sliderConfig.slides.length) % sliderConfig.slides.length;
        goToSlide(prevIndex);
    }
    
    function goToSlide(index) {
        if (isTransitioning || index === currentSlide) return;
        
        isTransitioning = true;
        currentSlide = index;
        
        const wrapper = document.getElementById('heroSliderWrapper');
        const indicators = document.querySelectorAll('.hero-indicator');
        
        if (wrapper) {
            wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
        
        // Actualizar indicadores
        indicators.forEach((indicator, i) => {
            if (i === currentSlide) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
        
        setTimeout(() => {
            isTransitioning = false;
        }, 500);
        
        // Reiniciar autoplay
        if (sliderConfig.autoPlay) {
            stopAutoPlay();
            startAutoPlay();
        }
    }
    
    // AutoPlay
    function startAutoPlay() {
        if (sliderConfig.slides.length <= 1) return;
        
        autoPlayTimer = setInterval(() => {
            nextSlide();
        }, sliderConfig.autoPlayInterval);
    }
    
    function stopAutoPlay() {
        if (autoPlayTimer) {
            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }
    }
    
    // Handlers de botones
    function handlePedirClick(slide) {
        console.log('Ver oferta:', slide);
        // Aquí puedes agregar lógica específica, como:
        // - Mostrar modal con detalles
        // - Redirigir a categoría específica
        // - Agregar producto al carrito
        alert('¡Oferta disponible! Funcionalidad próximamente...');
    }
    
    function handleWhatsappClick(slide) {
        const message = slide.whatsappMessage || 'Hola! Me interesa esta promoción';
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    }
    
    // Pausar autoplay cuando la pestaña no está visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoPlay();
        } else if (sliderConfig.autoPlay) {
            startAutoPlay();
        }
    });
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Exportar funciones para dashboard
    window.heroPromocionesModule = {
        reload: init,
        goToSlide,
        nextSlide,
        previousSlide,
        updateConfig: (newConfig) => {
            sliderConfig = { ...sliderConfig, ...newConfig };
            localStorage.setItem('heroPromocionesConfig', JSON.stringify(sliderConfig));
            init();
        }
    };
    
    // Función global para actualizar el slider desde el dashboard
    window.updateHeroSlider = function(config) {
        console.log('Actualizando slider con configuración:', config);
        
        // Actualizar configuración
        sliderConfig.visible = config.visible;
        sliderConfig.maxSlides = config.maxSlides;
        sliderConfig.showPedirButton = config.showPedirButton;
        sliderConfig.showWhatsAppButton = config.showWhatsAppButton;
        sliderConfig.slides = config.slides || [];
        
        // Recrear el slider
        setupSlider();
        
        // Reiniciar autoplay si es necesario
        if (sliderConfig.autoPlay && sliderConfig.slides.length > 1) {
            startAutoPlay();
        } else {
            stopAutoPlay();
        }
    };
    
})();

