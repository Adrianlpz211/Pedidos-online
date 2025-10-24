/* ===================================
   MENÚ FUNCIONAL - INDEX
   =================================== */

(function() {
    'use strict';
    
    console.log('Menú Funcional cargado');
    
    // Variables del módulo
    let currentModule = 'outlet'; // Módulo por defecto
    
    // Elementos del DOM
    const menuButtons = document.querySelectorAll('.menu-btn');
    const moduleSections = document.querySelectorAll('.module-section');
    
    // ===================================
    // SISTEMA DE GESTIÓN DE ESTADOS CENTRALIZADO
    // ===================================
    const ModuleManager = {
        currentModule: null,
        containers: {
            products: 'productsGrid',
            pedidos: 'pedidosContainer', 
            deseos: 'deseosContainer',
            lonuevo: 'deseosContainer', // Mapear lonuevo a deseosContainer
            usuario: 'usuarioContainer',
            categorias: 'categoriesContainer'
        },
        
        // Mostrar un módulo específico
        showModule(moduleName) {
            console.log(`🎯 ModuleManager: Mostrando módulo ${moduleName}`);
            
            // 1. Ocultar TODOS los contenedores
            this.hideAllContainers();
            
            // 2. Mostrar solo el módulo solicitado
            this.showSpecificModule(moduleName);
            
            // 3. Actualizar estado
            this.currentModule = moduleName;
            
            // 4. Actualizar navegación visual
            this.updateNavigationUI(moduleName);
            
            console.log(`✅ ModuleManager: Módulo ${moduleName} activado`);
        },
        
        // Ocultar todos los contenedores
        hideAllContainers() {
            console.log('🔄 ModuleManager: Ocultando todos los contenedores...');
            
            // Ocultar grid de productos
            const productsGrid = document.getElementById('productsGrid');
            if (productsGrid) {
                productsGrid.style.display = 'none';
                console.log('✅ productsGrid oculto');
            }
            
            // Ocultar todos los contenedores de módulos
            Object.values(this.containers).forEach(containerId => {
                const container = document.getElementById(containerId);
                if (container) {
                    container.style.display = 'none';
                    console.log(`✅ ${containerId} oculto`);
                }
            });
            
            // Ocultar secciones de módulos del HTML
            moduleSections.forEach(section => {
                section.classList.remove('active');
                section.style.display = 'none';
            });
        },
        
        // Mostrar módulo específico
        showSpecificModule(moduleName) {
            console.log(`🎯 ModuleManager: Mostrando módulo específico ${moduleName}`);
            
            if (moduleName === 'catalogo' || moduleName === 'outlet') {
                // Mostrar grid de productos original
                const productsGrid = document.getElementById('productsGrid');
                if (productsGrid) {
                    productsGrid.style.display = 'grid';
                    console.log('✅ productsGrid mostrado');
                } else {
                    console.warn('⚠️ productsGrid no encontrado, restaurando...');
                    this.restoreProductsGrid();
                }
            } else {
                // Mostrar contenedor específico del módulo
                const containerId = this.containers[moduleName];
                if (containerId) {
                    let container = document.getElementById(containerId);
                    if (container) {
                        container.style.display = 'block';
                        console.log(`✅ ${containerId} mostrado`);
                    } else {
                        // Crear contenedor si no existe
                        console.log(`🔧 Creando contenedor ${containerId}...`);
                        container = this.createModuleContainer(moduleName);
                        if (container) {
                            container.style.display = 'block';
                            console.log(`✅ ${containerId} creado y mostrado`);
                        }
                    }
                } else {
                    console.error(`❌ No se encontró configuración para módulo: ${moduleName}`);
                }
            }
        },
        
        // Crear contenedor de módulo
        createModuleContainer(moduleName) {
            const mainContent = document.querySelector('.main-content');
            if (!mainContent) {
                console.error('❌ mainContent no encontrado');
                return null;
            }
            
            const containerId = this.containers[moduleName];
            if (!containerId) {
                console.error(`❌ No se encontró containerId para módulo: ${moduleName}`);
                return null;
            }
            
            const container = document.createElement('div');
            container.id = containerId;
            container.className = 'module-content';
            container.style.display = 'block';
            
            mainContent.appendChild(container);
            console.log(`✅ Contenedor ${containerId} creado`);
            
            return container;
        },
        
        // Restaurar grid de productos
        restoreProductsGrid() {
            const mainContent = document.querySelector('.main-content');
            if (!mainContent) return;
            
            // Restaurar el grid de productos original
            mainContent.innerHTML = getOriginalProductsGridHTML();
            
            // Re-inicializar eventos después de restaurar
            setTimeout(() => {
                if (window.initializeApp) {
                    window.initializeApp();
                }
                console.log('✅ Grid de productos restaurado y eventos reinicializados');
            }, 100);
        },
        
        // Actualizar navegación visual
        updateNavigationUI(moduleName) {
            // Remover clase active de todos los botones
            menuButtons.forEach(button => {
                button.classList.remove('active');
            });
            
            // Agregar clase active al botón correspondiente
            const activeButton = document.querySelector(`[data-module="${moduleName}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
                console.log(`✅ Botón ${moduleName} marcado como activo`);
            }
        },
        
        // Obtener módulo actual
        getCurrentModule() {
            return this.currentModule;
        }
    };
    
    // ===================================
    // INICIALIZACIÓN
    // ===================================
    function init() {
        setupEventListeners();
        showModule(currentModule);
        console.log('Menú Funcional inicializado');
    }
    
    // ===================================
    // EVENT LISTENERS
    // ===================================
    function setupEventListeners() {
        // Botones del menú inferior (excluyendo categorías que tiene su propio manejador)
        menuButtons.forEach(button => {
            const module = button.getAttribute('data-module');
            
            // No manejar categorías aquí, tiene su propio event listener
            if (module !== 'categorias') {
                button.addEventListener('click', function() {
                    switchModule(module);
                });
            }
        });
    }
    
    // ===================================
    // NAVEGACIÓN ENTRE MÓDULOS
    // ===================================
    function switchModule(moduleName) {
        console.log(`🔄 Cambiando a módulo: ${moduleName}`);
        
        // Usar el ModuleManager para gestionar la navegación
        ModuleManager.showModule(moduleName);
        
        // Actualizar variable local
        currentModule = moduleName;
        
        // Cargar datos del módulo si existe la función
        let moduleFunction;
        if (moduleName === 'lonuevo') {
            moduleFunction = 'loadDeseosModule'; // Usar la función específica de deseos
        } else {
            moduleFunction = `load${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Module`;
        }
        
        if (window[moduleFunction] && typeof window[moduleFunction] === 'function') {
            console.log(`📦 Cargando datos del módulo: ${moduleFunction}`);
            window[moduleFunction]();
        } else {
            console.log(`ℹ️ No se encontró función de carga para módulo: ${moduleName} (${moduleFunction})`);
        }
    }
    
    // ===================================
    // GESTIÓN CENTRALIZADA DE CONTENIDO
    // ===================================
    function ensureOriginalContentAvailable() {
        const mainContent = document.querySelector('.main-content');
        const productsGrid = document.getElementById('productsGrid');
        
        // Si productsGrid no existe, restaurarlo
        if (!productsGrid && mainContent) {
            console.log('🔄 Restaurando productsGrid original...');
            restoreOriginalProductsGrid();
        }
    }
    
    function restoreOriginalProductsGrid() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        
        // Restaurar el grid de productos original
        mainContent.innerHTML = getOriginalProductsGridHTML();
        
        // Re-inicializar eventos después de restaurar
        setTimeout(() => {
            if (window.initializeApp) {
                window.initializeApp();
            }
            console.log('✅ Contenido original restaurado y eventos reinicializados');
        }, 100);
    }
    
    function getOriginalProductsGridHTML() {
        return `
            <div class="products-grid" id="productsGrid">
                <!-- Producto 1 -->
                <div class="product-card">
                    <div class="product-image-container" data-product="1">
                        <span class="discount-badge">-5%</span>
                        <img src="img/productos/microonda.jpg" alt="Microonda Damasco EM720C" class="product-image" onerror="this.style.display='none'">
                    </div>
                    
                    <div class="product-info">
                        <div class="product-brand">DAMASCO</div>
                        
                        <div class="product-rating">
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="far fa-star"></i>
                        </div>
                        
                        <h3 class="product-name">Microonda Damasco EM720C</h3>
                        <p class="product-description">Microonda moderna con múltiples funciones</p>
                        
                        <div class="product-price-container">
                            <div class="price-info">
                                <span class="price-current">USD 85.50</span>
                                <span class="price-old">USD 90.00</span>
                            </div>
                            <button class="like-btn" data-product="1">
                                <i class="far fa-heart"></i>
                                <span class="like-count">0</span>
                            </button>
                        </div>
                        
                        <div class="product-actions">
                            <button class="btn-pedir">
                                <i class="fas fa-shopping-bag"></i>
                            </button>
                            <button class="btn-whatsapp">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Producto 2 -->
                <div class="product-card">
                    <div class="product-image-container" data-product="2">
                        <span class="discount-badge">-5%</span>
                        <img src="img/placeholder.svg" alt="Producto 2" class="product-image">
                    </div>
                    
                    <div class="product-info">
                        <div class="product-brand">Midea</div>
                        
                        <div class="product-rating">
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                        </div>
                        
                        <h3 class="product-name">Microondas Midea 30L 10...</h3>
                        <p class="product-description">Microondas de alta capacidad con diseño moderno</p>
                        
                        <div class="product-price-container">
                            <div class="price-info">
                                <span class="price-current">USD 90.25</span>
                                <span class="price-old">USD 95.00</span>
                            </div>
                            <button class="like-btn" data-product="2">
                                <i class="far fa-heart"></i>
                                <span class="like-count">0</span>
                            </button>
                        </div>
                        
                        <div class="product-actions">
                            <button class="btn-pedir">
                                <i class="fas fa-shopping-bag"></i>
                            </button>
                            <button class="btn-whatsapp">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Producto 3 -->
                <div class="product-card">
                    <div class="product-image-container" data-product="3">
                        <span class="discount-badge">-10%</span>
                        <img src="img/placeholder.svg" alt="Producto 3" class="product-image">
                    </div>
                    
                    <div class="product-info">
                        <div class="product-brand">SAMSUNG</div>
                        
                        <div class="product-rating">
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="far fa-star"></i>
                        </div>
                        
                        <h3 class="product-name">Refrigeradora Samsung RT50</h3>
                        <p class="product-description">Refrigeradora de dos puertas con tecnología frost</p>
                        
                        <div class="product-price-container">
                            <div class="price-info">
                                <span class="price-current">USD 125.40</span>
                                <span class="price-old">USD 139.33</span>
                            </div>
                            <button class="like-btn" data-product="3">
                                <i class="far fa-heart"></i>
                                <span class="like-count">0</span>
                            </button>
                        </div>
                        
                        <div class="product-actions">
                            <button class="btn-pedir">
                                <i class="fas fa-shopping-bag"></i>
                            </button>
                            <button class="btn-whatsapp">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Producto 4 -->
                <div class="product-card">
                    <div class="product-image-container" data-product="4">
                        <span class="discount-badge">-15%</span>
                        <img src="img/placeholder.svg" alt="Producto 4" class="product-image">
                    </div>
                    
                    <div class="product-info">
                        <div class="product-brand">LG</div>
                        
                        <div class="product-rating">
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star"></i>
                            <i class="far fa-star"></i>
                        </div>
                        
                        <h3 class="product-name">Lavadora LG 15KG</h3>
                        <p class="product-description">Lavadora automática de alta capacidad</p>
                        
                        <div class="product-price-container">
                            <div class="price-info">
                                <span class="price-current">USD 79.80</span>
                                <span class="price-old">USD 93.88</span>
                            </div>
                            <button class="like-btn" data-product="4">
                                <i class="far fa-heart"></i>
                                <span class="like-count">0</span>
                            </button>
                        </div>
                        
                        <div class="product-actions">
                            <button class="btn-pedir">
                                <i class="fas fa-shopping-bag"></i>
                            </button>
                            <button class="btn-whatsapp">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Producto 5 -->
                <div class="product-card">
                    <div class="product-image-container" data-product="5">
                        <span class="discount-badge">-20%</span>
                        <img src="img/placeholder.svg" alt="Producto 5" class="product-image">
                    </div>
                    
                    <div class="product-info">
                        <div class="product-brand">Samsung</div>
                        
                        <div class="product-rating">
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                        </div>
                        
                        <h3 class="product-name">Refrigeradora Samsung 300L</h3>
                        <p class="product-description">Refrigeradora de dos puertas con tecnología inverter</p>
                        
                        <div class="product-price-container">
                            <div class="price-info">
                                <span class="price-current">USD 450.00</span>
                                <span class="price-old">USD 562.50</span>
                            </div>
                            <button class="like-btn" data-product="5">
                                <i class="far fa-heart"></i>
                                <span class="like-count">0</span>
                            </button>
                        </div>
                        
                        <div class="product-actions">
                            <button class="btn-pedir">
                                <i class="fas fa-shopping-bag"></i>
                            </button>
                            <button class="btn-whatsapp">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Producto 6 -->
                <div class="product-card">
                    <div class="product-image-container" data-product="6">
                        <span class="discount-badge">-10%</span>
                        <img src="img/placeholder.svg" alt="Producto 6" class="product-image">
                    </div>
                    
                    <div class="product-info">
                        <div class="product-brand">LG</div>
                        
                        <div class="product-rating">
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="far fa-star"></i>
                        </div>
                        
                        <h3 class="product-name">Lavadora LG 15kg</h3>
                        <p class="product-description">Lavadora de carga frontal con tecnología TurboWash</p>
                        
                        <div class="product-price-container">
                            <div class="price-info">
                                <span class="price-current">USD 380.50</span>
                                <span class="price-old">USD 422.78</span>
                            </div>
                            <button class="like-btn" data-product="6">
                                <i class="far fa-heart"></i>
                                <span class="like-count">0</span>
                            </button>
                        </div>
                        
                        <div class="product-actions">
                            <button class="btn-pedir">
                                <i class="fas fa-shopping-bag"></i>
                            </button>
                            <button class="btn-whatsapp">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Producto 7 -->
                <div class="product-card">
                    <div class="product-image-container" data-product="7">
                        <span class="discount-badge">-25%</span>
                        <img src="img/placeholder.svg" alt="Producto 7" class="product-image">
                    </div>
                    
                    <div class="product-info">
                        <div class="product-brand">Sony</div>
                        
                        <div class="product-rating">
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                            <i class="fas fa-star star-active"></i>
                        </div>
                        
                        <h3 class="product-name">Televisor Smart 55"</h3>
                        <p class="product-description">Smart TV 4K con Android TV y HDR</p>
                        
                        <div class="product-price-container">
                            <div class="price-info">
                                <span class="price-current">USD 650.75</span>
                                <span class="price-old">USD 867.67</span>
                            </div>
                            <button class="like-btn" data-product="7">
                                <i class="far fa-heart"></i>
                                <span class="like-count">0</span>
                            </button>
                        </div>
                        
                        <div class="product-actions">
                            <button class="btn-pedir">
                                <i class="fas fa-shopping-bag"></i>
                            </button>
                            <button class="btn-whatsapp">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function showModule(moduleName) {
        switchModule(moduleName);
    }
    
    
    // ===================================
    // FUNCIONES PÚBLICAS
    // ===================================
    window.menuFuncional = {
        switchModule,
        showModule,
        getCurrentModule: () => currentModule,
        restoreOriginalProductsGrid,
        ensureOriginalContentAvailable,
        ModuleManager
    };
    
    // Exponer ModuleManager globalmente
    window.ModuleManager = ModuleManager;
    
    // Exponer funciones globalmente para compatibilidad
    window.restoreOriginalProductsGrid = restoreOriginalProductsGrid;
    window.ensureOriginalContentAvailable = ensureOriginalContentAvailable;
    
    // ===================================
    // INICIALIZACIÓN AUTOMÁTICA
    // ===================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    
})();
