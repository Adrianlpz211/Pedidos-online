/* ===================================
   JAVASCRIPT MÓDULO DESEOS (WISHLIST)
   =================================== */

(function() {
    'use strict';
    
    console.log('Módulo Deseos cargado');
    
    let deseosData = {};
    
    // Inicialización
    function init() {
        cargarDeseos();
        setupEventListeners();
    }
    
    // Event Listeners
    function setupEventListeners() {
        const btnDeseo = document.querySelector('.menu-btn[data-module="lonuevo"]');
        
        if (btnDeseo) {
            btnDeseo.addEventListener('click', function() {
                mostrarSeccionDeseos();
            });
        }
    }
    
    // Cargar deseos desde localStorage
    function cargarDeseos() {
        const savedLikes = localStorage.getItem('productLikes');
        if (savedLikes) {
            deseosData = JSON.parse(savedLikes);
        }
    }
    
    // Verificar y restaurar contenido original si es necesario
    function ensureOriginalContentAvailable() {
        const mainContent = document.querySelector('.main-content');
        const productsGrid = document.getElementById('productsGrid');
        
        // Si productsGrid no existe, usar la función del menu-funcional
        if (!productsGrid && mainContent) {
            console.log('🔄 Restaurando contenido original desde deseo.js...');
            if (window.menuFuncional && window.menuFuncional.restoreOriginalProductsGrid) {
                window.menuFuncional.restoreOriginalProductsGrid();
            } else if (window.restoreOriginalProductsGrid) {
                window.restoreOriginalProductsGrid();
            } else {
                // Fallback: recargar la página como último recurso
                console.warn('⚠️ No se pudo restaurar contenido, recargando página...');
                window.location.reload();
            }
        }
    }
    
    // Mostrar sección de deseos
    function mostrarSeccionDeseos() {
        console.log('Mostrando sección de deseos...');
        
        // Recargar deseos por si hubo cambios
        cargarDeseos();
        
        // Contar productos con like
        const productosConLike = Object.values(deseosData).filter(item => item.liked).length;
        
        // Crear vista de deseos
        let deseosHTML = `
            <div class="deseo-section">
                <div class="deseo-header">
                    <h2 class="deseo-title">Mis Deseos</h2>
                    <p class="deseo-count">${productosConLike} producto${productosConLike !== 1 ? 's' : ''}</p>
                </div>
        `;
        
        if (productosConLike === 0) {
            // Vista vacía
            deseosHTML += `
                <div class="deseo-empty">
                    <i class="fas fa-heart deseo-empty-icon"></i>
                    <p class="deseo-empty-text">Aún no tienes productos deseados</p>
                    <p class="deseo-empty-subtext">Dale like a tus productos favoritos para encontrarlos más rápido aquí</p>
                    <button class="btn-explorar" onclick="catalogoModule.volverAlCatalogo()">
                        Explorar Productos
                    </button>
                </div>
            `;
        } else {
            // Mostrar productos con like
            deseosHTML += '<div class="deseo-products-grid" id="deseosGrid">';
            
            // Obtener todos los productos del DOM original
            const todosLosProductos = Array.from(document.querySelectorAll('#productsGrid .product-card'));
            
            todosLosProductos.forEach(card => {
                const likeBtn = card.querySelector('.like-btn');
                const productId = likeBtn ? likeBtn.getAttribute('data-product') : null;
                
                if (productId && deseosData[productId] && deseosData[productId].liked) {
                    // Clonar la tarjeta del producto
                    deseosHTML += card.outerHTML;
                }
            });
            
            deseosHTML += '</div>';
        }
        
        deseosHTML += '</div>';
        
        // Obtener o crear contenedor de deseos
        let deseosContainer = document.getElementById('deseosContainer');
        if (!deseosContainer) {
            console.log('🔧 Creando contenedor de deseos...');
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                deseosContainer = document.createElement('div');
                deseosContainer.id = 'deseosContainer';
                deseosContainer.className = 'module-content';
                mainContent.appendChild(deseosContainer);
            }
        }
        
        // Cargar contenido en el contenedor
        if (deseosContainer) {
            deseosContainer.innerHTML = deseosHTML;
            console.log('✅ Contenido de deseos cargado en contenedor');
        }
        
        // Re-inicializar eventos en la vista de deseos
        setTimeout(() => {
            reinicializarEventosEnDeseos();
        }, 100);
    }
    
    // Re-inicializar todos los eventos en la vista de deseos
    function reinicializarEventosEnDeseos() {
        const deseosGrid = document.getElementById('deseosGrid');
        if (!deseosGrid) return;
        
        // Re-inicializar likes
        deseosGrid.querySelectorAll('.like-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const productId = this.getAttribute('data-product');
                const icon = this.querySelector('i');
                const countSpan = this.querySelector('.like-count');
                
                // Cargar datos actuales
                cargarDeseos();
                
                if (!deseosData[productId]) {
                    deseosData[productId] = { liked: false, count: 0 };
                }
                
                // Toggle like
                if (deseosData[productId].liked) {
                    // Quitar like
                    deseosData[productId].liked = false;
                    deseosData[productId].count = Math.max(0, deseosData[productId].count - 1);
                    this.classList.remove('liked');
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                } else {
                    // Dar like
                    deseosData[productId].liked = true;
                    deseosData[productId].count += 1;
                    this.classList.add('liked');
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                }
                
                countSpan.textContent = deseosData[productId].count;
                localStorage.setItem('productLikes', JSON.stringify(deseosData));
                
                // Animar y recargar vista si se quitó el like
                if (!deseosData[productId].liked) {
                    const card = this.closest('.product-card');
                    card.classList.add('removing');
                    setTimeout(() => {
                        mostrarSeccionDeseos();
                    }, 300);
                }
            });
        });
        
        // Re-inicializar quick view
        deseosGrid.querySelectorAll('.product-image-container').forEach(container => {
            const newContainer = container.cloneNode(true);
            container.parentNode.replaceChild(newContainer, container);
            
            newContainer.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const productCard = this.closest('.product-card');
                const name = productCard.querySelector('.product-name').textContent;
                const description = productCard.querySelector('.product-description').textContent;
                const price = productCard.querySelector('.price-current').textContent;
                const priceOld = productCard.querySelector('.price-old').textContent;
                const image = productCard.querySelector('.product-image').src;
                
                document.getElementById('modalName').textContent = name;
                document.getElementById('modalDescription').textContent = description;
                document.getElementById('modalPrice').textContent = price;
                document.getElementById('modalPriceOld').textContent = priceOld;
                document.getElementById('modalImage').src = image;
                
                document.getElementById('modalOverlay').classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
    }
    
    // Volver al catálogo
    function volverAlCatalogo() {
        console.log('🔄 Volviendo al catálogo desde deseos...');
        
        // Usar el ModuleManager para cambiar al catálogo
        if (window.ModuleManager) {
            window.ModuleManager.showModule('outlet');
        } else {
            // Fallback: ocultar deseos y mostrar productos
            const deseosContainer = document.getElementById('deseosContainer');
            const productsGrid = document.getElementById('productsGrid');
            
            if (deseosContainer) {
                deseosContainer.style.display = 'none';
            }
            if (productsGrid) {
                productsGrid.style.display = 'grid';
            }
            
            // Remover clase active del botón deseo
            document.querySelectorAll('.menu-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        }
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Función para cargar el módulo de deseos (compatibilidad)
    function loadDeseosModule() {
        console.log('📦 Cargando módulo de deseos...');
        mostrarSeccionDeseos();
    }
    
    // Exportar funciones
    window.deseosModule = {
        mostrarSeccionDeseos,
        volverAlCatalogo,
        cargarDeseos,
        loadDeseosModule
    };
    
    // Exponer función globalmente para compatibilidad
    window.loadDeseosModule = loadDeseosModule;
    
})();

