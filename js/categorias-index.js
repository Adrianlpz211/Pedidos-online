/* ===================================
   MÓDULO CATEGORÍAS - INDEX (FRONTEND)
   =================================== */

(function() {
    'use strict';
    
    console.log('Módulo Categorías Index cargado');
    
    // Variables del módulo
    let categorias = [];
    let subcategorias = [];
    let categoriaSeleccionada = null;
    
    // Elementos del DOM
    const categoriesModal = document.getElementById('categoriesModal');
    const categoriesList = document.getElementById('categoriesList');
    const subcategoryContainer = document.getElementById('subcategoryContainer');
    const btnCategorias = document.getElementById('btnCategorias');
    
    // ===================================
    // INICIALIZACIÓN
    // ===================================
    function init() {
        setupEventListeners();
        loadCategorias();
        loadSubcategorias();
        console.log('Módulo Categorías Index inicializado');
    }
    
    // ===================================
    // EVENT LISTENERS
    // ===================================
    function setupEventListeners() {
        // Conectar con el sistema de módulos del index
        if (btnCategorias) {
            console.log('🔧 Configurando event listener para btnCategorias');
            btnCategorias.addEventListener('click', (e) => {
                console.log('🎯 Click detectado en btnCategorias');
                e.preventDefault();
                showCategoriesModal();
            });
        } else {
            console.warn('❌ btnCategorias no encontrado');
        }
        
        // Cerrar modal al hacer click fuera
        if (categoriesModal) {
            categoriesModal.addEventListener('click', (e) => {
                if (e.target === categoriesModal) {
                    hideCategoriesModal();
                }
            });
        }
        
        // Botón de cerrar modal
        const categoriesClose = document.getElementById('categoriesClose');
        if (categoriesClose) {
            categoriesClose.addEventListener('click', hideCategoriesModal);
        }
    }
    
    // ===================================
    // CARGA DE DATOS
    // ===================================
    function loadCategorias() {
        console.log('Cargando categorías...');
        // Usar datos hardcodeados del módulo de categorías
        if (window.categoriasModule && window.categoriasModule.getCategorias) {
            categorias = window.categoriasModule.getCategorias();
            console.log('Categorías cargadas desde módulo:', categorias);
        } else {
            console.log('Módulo de categorías no disponible, usando datos de respaldo');
            // Datos hardcodeados de respaldo
            categorias = [
                { id: 1, name: 'Tecnología', description: 'Dispositivos electrónicos y accesorios' },
                { id: 2, name: 'Ropa', description: 'Vestimenta y accesorios de moda' },
                { id: 3, name: 'Hogar', description: 'Artículos para el hogar y decoración' },
                { id: 4, name: 'Deportes', description: 'Equipamiento y accesorios deportivos' },
                { id: 5, name: 'Libros', description: 'Libros de diversos géneros' }
            ];
        }
        console.log('Categorías finales:', categorias);
        renderCategorias();
    }
    
    function loadSubcategorias() {
        console.log('Cargando subcategorías...');
        // Usar datos hardcodeados del módulo de categorías
        if (window.categoriasModule && window.categoriasModule.getSubcategorias) {
            subcategorias = window.categoriasModule.getSubcategorias();
        } else {
            // Datos hardcodeados de respaldo
            subcategorias = [
                { id: 1, name: 'Smartphones', categoria_id: 1 },
                { id: 2, name: 'Laptops', categoria_id: 1 },
                { id: 3, name: 'Camisetas', categoria_id: 2 },
                { id: 4, name: 'Pantalones', categoria_id: 2 },
                { id: 5, name: 'Decoración', categoria_id: 3 },
                { id: 6, name: 'Muebles', categoria_id: 3 },
                { id: 7, name: 'Fútbol', categoria_id: 4 },
                { id: 8, name: 'Básquetbol', categoria_id: 4 },
                { id: 9, name: 'Ficción', categoria_id: 5 },
                { id: 10, name: 'Educativos', categoria_id: 5 }
            ];
        }
        console.log('Subcategorías cargadas:', subcategorias);
        renderSubcategorias();
    }
    
    // ===================================
    // RENDERIZADO
    // ===================================
    function renderCategorias() {
        console.log('Renderizando categorías...');
        console.log('categoriesList:', categoriesList);
        console.log('categorias.length:', categorias.length);
        
        if (!categoriesList) {
            console.error('categoriesList no encontrado');
            return;
        }
        
        if (categorias.length === 0) {
            console.log('No hay categorías, mostrando loading...');
            categoriesList.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Cargando categorías...</p>
                </div>
            `;
            return;
        }
        
        const categoriasHTML = `
            <div class="category-item" data-categoria-id="todos">
                <div class="category-icon">
                    <i class="fas fa-grid-3x3"></i>
                </div>
                <div class="category-info">
                    <h4 class="category-name">Todos los Productos</h4>
                </div>
                
            </div>
            ${categorias.map(categoria => `
                <div class="category-item" data-categoria-id="${categoria.id}">
                    <div class="category-icon">
                        <i class="fas fa-th"></i>
                    </div>
                    <div class="category-info">
                        <h4 class="category-name">${categoria.name || categoria.nombre}</h4>
                    </div>
                   
                </div>
            `).join('')}
        `;
        
        categoriesList.innerHTML = categoriasHTML;
        
        // Agregar event listeners a las categorías
        addCategoriaListeners();
    }
    
    function renderSubcategorias() {
        if (!subcategoryContainer) {
            console.warn('subcategoryContainer no encontrado');
            return;
        }
        
        console.log('Renderizando subcategorías...');
        console.log('Categoría seleccionada:', categoriaSeleccionada);
        console.log('Todas las subcategorías:', subcategorias);
        
        if (categoriaSeleccionada) {
            const subcategoriasFiltradas = subcategorias.filter(sub => {
                // Manejar tanto categoria_id como categoriaIds
                if (sub.categoria_id) {
                    return parseInt(sub.categoria_id) === parseInt(categoriaSeleccionada.id);
                } else if (sub.categoriaIds && Array.isArray(sub.categoriaIds)) {
                    return sub.categoriaIds.includes(parseInt(categoriaSeleccionada.id));
                }
                return false;
            });
            
            console.log('Subcategorías filtradas:', subcategoriasFiltradas);
            
            if (subcategoriasFiltradas.length > 0) {
                const subcategoriasHTML = `
                    <button class="subcategory-btn active" data-sub="todas">Todas</button>
                    ${subcategoriasFiltradas.map(sub => `
                        <button class="subcategory-btn" data-sub="${sub.id}">${sub.name || sub.nombre}</button>
                    `).join('')}
                `;
                
                // Insertar en el contenedor de scroll, no en el contenedor principal
                const subcategoryScroll = document.getElementById('subcategoryScroll');
                if (subcategoryScroll) {
                    subcategoryScroll.innerHTML = subcategoriasHTML;
                    subcategoryContainer.style.display = 'block';
                } else {
                    // Fallback si no encuentra el contenedor de scroll
                    subcategoryContainer.innerHTML = `<div class="subcategory-scroll">${subcategoriasHTML}</div>`;
                    subcategoryContainer.style.display = 'block';
                }
                
                // Agregar event listeners a las subcategorías
                addSubcategoriaListeners();
            } else {
                console.log('No hay subcategorías para esta categoría');
                subcategoryContainer.style.display = 'none';
            }
        } else {
            console.log('No hay categoría seleccionada, ocultando subcategorías');
            subcategoryContainer.style.display = 'none';
        }
    }
    
    // ===================================
    // EVENT LISTENERS
    // ===================================
    function addCategoriaListeners() {
        const categoryItems = document.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            item.addEventListener('click', () => {
                const categoriaId = item.dataset.categoriaId;
                
                if (categoriaId === 'todos') {
                    selectTodos();
                } else {
                    const categoria = categorias.find(cat => cat.id == categoriaId);
                    if (categoria) {
                        selectCategoria(categoria);
                    }
                }
            });
        });
    }
    
    function addSubcategoriaListeners() {
        const subcategoryBtns = document.querySelectorAll('.subcategory-btn');
        subcategoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remover active de todos los botones
                subcategoryBtns.forEach(b => b.classList.remove('active'));
                // Agregar active al botón clickeado
                btn.classList.add('active');
                
                const subcategoriaId = btn.dataset.sub;
                
                // VERIFICAR SI HAY MÓDULOS ACTIVOS QUE NECESITEN SER OCULTADOS
                checkAndHideActiveModules();
                
                if (subcategoriaId === 'todas') {
                    // Mostrar todos los productos de la categoría
                    console.log('Mostrando todos los productos de la categoría:', categoriaSeleccionada.nombre);
                    // Aquí puedes llamar a una función para cargar productos
                    if (window.loadProductosPorCategoria) {
                        window.loadProductosPorCategoria(categoriaSeleccionada.id);
                    }
                } else {
                    // Mostrar productos de la subcategoría específica
                    const subcategoria = subcategorias.find(sub => sub.id == subcategoriaId);
                    console.log('Mostrando productos de la subcategoría:', subcategoria.nombre);
                    // Aquí puedes llamar a una función para cargar productos
                    if (window.loadProductosPorSubcategoria) {
                        window.loadProductosPorSubcategoria(subcategoriaId);
                    }
                }
            });
        });
    }
    
    // ===================================
    // FUNCIONES DE MODAL
    // ===================================
    function showCategoriesModal() {
        console.log('🚀 Intentando mostrar modal de categorías');
        if (categoriesModal) {
            console.log('✅ Modal encontrado, mostrando...');
            categoriesModal.style.display = 'block';
            categoriesModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            console.error('❌ categoriesModal no encontrado');
        }
    }
    
    function hideCategoriesModal() {
        if (categoriesModal) {
            categoriesModal.classList.remove('active');
            setTimeout(() => {
                categoriesModal.style.display = 'none';
            }, 300); // Esperar a que termine la animación
            document.body.style.overflow = 'auto';
        }
    }
    
    function selectTodos() {
        categoriaSeleccionada = null;
        hideCategoriesModal();
        
        // Ocultar slider de subcategorías
        if (subcategoryContainer) {
            subcategoryContainer.style.display = 'none';
            console.log('✅ Submenú de subcategorías ocultado');
        }
        
        console.log('Mostrando todos los productos');
        
        // VERIFICAR SI HAY MÓDULOS ACTIVOS QUE NECESITEN SER OCULTADOS
        checkAndHideActiveModules();
        
        // Notificar a otros módulos que se seleccionó "todos"
        if (window.onTodosSelected) {
            window.onTodosSelected();
        } else if (window.onCategoriaSelected) {
            window.onCategoriaSelected(null); // null = todos
        }
    }
    
    function selectCategoria(categoria) {
        categoriaSeleccionada = categoria;
        console.log('Categoría seleccionada:', categoria);
        console.log('Subcategorías disponibles:', subcategorias);
        
        renderSubcategorias();
        hideCategoriesModal();
        
        // VERIFICAR SI HAY MÓDULOS ACTIVOS QUE NECESITEN SER OCULTADOS
        checkAndHideActiveModules();
        
        // Notificar a otros módulos que se seleccionó una categoría
        if (window.onCategoriaSelected) {
            window.onCategoriaSelected(categoria);
        }
    }
    
    // ===================================
    // FUNCIÓN PARA OCULTAR MÓDULOS ACTIVOS
    // ===================================
    function checkAndHideActiveModules() {
        console.log('🔍 Verificando módulos activos que necesiten ser ocultados...');
        
        // Verificar si el módulo de Pedidos está activo
        const mainContent = document.querySelector('.main-content');
        const productsGrid = document.getElementById('productsGrid');
        
        // Verificar si el módulo de pedidos está visible (por contenido en main-content)
        if (mainContent && mainContent.innerHTML.includes('pedidos-header')) {
            console.log('📦 Módulo de Pedidos activo detectado, ocultando...');
            
            // Restaurar contenido principal SIN recargar la página
            if (productsGrid) {
                productsGrid.style.display = 'grid';
            }
            if (mainContent) {
                mainContent.style.display = 'block';
                // Restaurar el contenido original del HTML usando la estructura exacta del index.html
                mainContent.innerHTML = `
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
                                <div class="product-brand">MIDEA</div>
                                
                                <div class="product-rating">
                                    <i class="fas fa-star star-active"></i>
                                    <i class="fas fa-star star-active"></i>
                                    <i class="fas fa-star star-active"></i>
                                    <i class="fas fa-star star-active"></i>
                                    <i class="far fa-star"></i>
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
                                        <span class="price-current">USD 95.20</span>
                                        <span class="price-old">USD 112.00</span>
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
                                <div class="product-brand">SAMSUNG</div>
                                
                                <div class="product-rating">
                                    <i class="fas fa-star star-active"></i>
                                    <i class="fas fa-star star-active"></i>
                                    <i class="fas fa-star star-active"></i>
                                    <i class="fas fa-star star-active"></i>
                                    <i class="far fa-star"></i>
                                </div>
                                
                                <h3 class="product-name">Refrigeradora Samsung 300L</h3>
                                <p class="product-description">Refrigeradora de dos puertas con tecnología inverter</p>
                                
                                <div class="product-price-container">
                                    <div class="price-info">
                                        <span class="price-current">USD 118.80</span>
                                        <span class="price-old">USD 148.50</span>
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
                                        <span class="price-current">USD 103.50</span>
                                        <span class="price-old">USD 115.00</span>
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
                                <div class="product-brand">SAMSUNG</div>
                                
                                <div class="product-rating">
                                    <i class="fas fa-star star-active"></i>
                                    <i class="fas fa-star star-active"></i>
                                    <i class="fas fa-star star-active"></i>
                                    <i class="fas fa-star star-active"></i>
                                    <i class="far fa-star"></i>
                                </div>
                                
                                <h3 class="product-name">Televisor Smart 55"</h3>
                                <p class="product-description">Smart TV 4K con Android TV y HDR</p>
                                
                                <div class="product-price-container">
                                    <div class="price-info">
                                        <span class="price-current">USD 187.50</span>
                                        <span class="price-old">USD 250.00</span>
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
                
                // Reinicializar estilos y event listeners después de restaurar contenido
                setTimeout(() => {
                    // Asegurar que los botones tengan el estilo correcto
                    const productButtons = document.querySelectorAll('.product-buttons');
                    productButtons.forEach(buttons => {
                        buttons.style.display = 'flex';
                        buttons.style.flexDirection = 'row';
                        buttons.style.gap = '12px';
                    });
                    
                    // Reinicializar event listeners
                    if (window.initializeProductActions) {
                        window.initializeProductActions();
                    }
                    if (window.initializeLikes) {
                        window.initializeLikes();
                    }
                }, 100);
            }
        }
        
        // Verificar si el módulo de Deseos está activo
        const deseoContainer = document.getElementById('deseosContainer');
        
        // Verificar si el contenedor de deseos está visible
        if (deseoContainer && deseoContainer.style.display !== 'none') {
            console.log('❤️ Módulo de Deseos activo detectado, ocultando...');
            
            // Ocultar contenedor de deseos
            deseoContainer.style.display = 'none';
            
            // Mostrar grid de productos
            if (productsGrid) {
                productsGrid.style.display = 'grid';
            }
            
            // NO ocultar submenú al restaurar desde deseos
            // Solo ocultar cuando realmente se va al catálogo
            
            // Restaurar contenido principal
            if (window.deseosModule && window.deseosModule.volverAlCatalogo) {
                window.deseosModule.volverAlCatalogo();
            }
        }
        
        // Asegurar que el catálogo principal esté visible
        if (mainContent) {
            mainContent.style.display = 'block';
            console.log('✅ Catálogo principal restaurado');
        }
        
        // Remover clase active de todos los botones del menú
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        console.log('✅ Verificación de módulos completada');
    }
    
    // ===================================
    // FUNCIONES PÚBLICAS
    // ===================================
    window.showCategoriesModal = showCategoriesModal;
    window.hideCategoriesModal = hideCategoriesModal;
    window.selectCategoria = selectCategoria;
    window.selectTodos = selectTodos;
    window.getCategorias = () => categorias;
    window.getSubcategorias = () => subcategorias;
    window.getCategoriaSeleccionada = () => categoriaSeleccionada;
    
    // ===================================
    // INICIALIZACIÓN
    // ===================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
