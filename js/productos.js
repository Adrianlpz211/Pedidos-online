/* ===================================
   MÓDULO PRODUCTOS - JAVASCRIPT
   =================================== */

(function() {
    'use strict';
    
    console.log('Módulo Productos cargado');
    
    // Variables del módulo
    let products = [];
    let filteredProducts = [];
    let currentProduct = null;
    let isEditing = false;
    let currentPage = 1;
    let itemsPerPage = 10;
    let sortColumn = 'name';
    let sortDirection = 'asc';
    let searchTerm = '';
    let selectedProducts = new Set();
    let filters = {
        category: '',
        status: '',
        priceMin: '',
        priceMax: ''
    };
    
    // Variables de inventario
    let inventoryMovements = [];
    let inventoryLocations = [];
    let currentMovement = null;
    
    // Variables para sistema de chips M:M
    let selectedCategories = [];
    let selectedSubcategories = [];
    let availableCategories = [];
    let availableSubcategories = [];
    
    // Elementos del DOM
    const productsGrid = document.getElementById('productsGrid');
    const btnNuevoProducto = document.getElementById('btnNuevoProducto');
    const btnGestionarInventario = document.getElementById('btnGestionarInventario');
    
    // ===================================
    // INICIALIZACIÓN
    // ===================================
    function init() {
        setupEventListeners();
        loadProducts();
        loadInventoryData();
        loadCategoriesAndSubcategories();
        
        // Listener para redimensionar ventana
        window.addEventListener('resize', () => {
            if (productsGrid && productsGrid.innerHTML) {
                renderProducts();
            }
        });
        
        console.log('Módulo Productos inicializado');
    }
    
    // ===================================
    // EVENT LISTENERS
    // ===================================
    function setupEventListeners() {
        if (btnNuevoProducto) {
            btnNuevoProducto.addEventListener('click', showNewProductForm);
        }
        
        if (btnGestionarInventario) {
            btnGestionarInventario.addEventListener('click', showInventoryModal);
        }
    }
    
    // ===================================
    // CARGA DE DATOS
    // ===================================
    function loadInventoryData() {
        // Cargar movimientos de inventario
        const savedMovements = localStorage.getItem('inventoryMovements');
        inventoryMovements = savedMovements ? JSON.parse(savedMovements) : [];
        
        // Cargar ubicaciones
        const savedLocations = localStorage.getItem('inventoryLocations');
        inventoryLocations = savedLocations ? JSON.parse(savedLocations) : [
            {
                id: 1,
                name: 'Estante A-1',
                description: 'Electrodomésticos',
                capacity: 50,
                occupied: 0,
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Estante A-2',
                description: 'Tecnología',
                capacity: 30,
                occupied: 0,
                status: 'active',
                createdAt: new Date().toISOString()
            }
        ];
        
        // Calcular ocupación de ubicaciones
        calculateLocationOccupation();
    }
    
    function calculateLocationOccupation() {
        inventoryLocations.forEach(location => {
            const productsInLocation = products.filter(p => p.location === location.name);
            location.occupied = productsInLocation.length;
        });
        saveInventoryLocations();
    }
    
    function saveInventoryMovements() {
        localStorage.setItem('inventoryMovements', JSON.stringify(inventoryMovements));
    }
    
    function saveInventoryLocations() {
        localStorage.setItem('inventoryLocations', JSON.stringify(inventoryLocations));
    }
    
    // ===================================
    // CARGA DE CATEGORÍAS Y SUBCATEGORÍAS
    // ===================================
    function loadCategoriesAndSubcategories() {
        console.log('Cargando categorías y subcategorías...');
        
        // Cargar categorías desde localStorage o usar datos por defecto
        const savedCategories = localStorage.getItem('dashboardCategories');
        if (savedCategories) {
            try {
                availableCategories = JSON.parse(savedCategories);
            } catch (error) {
                console.error('Error al cargar categorías:', error);
                availableCategories = getDefaultCategories();
            }
        } else {
            availableCategories = getDefaultCategories();
        }
        
        // Cargar subcategorías desde localStorage o usar datos por defecto
        const savedSubcategories = localStorage.getItem('dashboardSubcategories');
        if (savedSubcategories) {
            try {
                availableSubcategories = JSON.parse(savedSubcategories);
            } catch (error) {
                console.error('Error al cargar subcategorías:', error);
                availableSubcategories = getDefaultSubcategories();
            }
        } else {
            availableSubcategories = getDefaultSubcategories();
        }
        
        console.log('Categorías cargadas:', availableCategories.length);
        console.log('Subcategorías cargadas:', availableSubcategories.length);
    }
    
    function getDefaultCategories() {
        return [
            { id: 1, name: 'Electrodomésticos', color: '#3B82F6', icon: 'fas fa-tv' },
            { id: 2, name: 'Tecnología', color: '#10B981', icon: 'fas fa-mobile-alt' },
            { id: 3, name: 'Ropa', color: '#F59E0B', icon: 'fas fa-tshirt' },
            { id: 4, name: 'Hogar', color: '#EF4444', icon: 'fas fa-home' },
            { id: 5, name: 'Ofertas', color: '#8B5CF6', icon: 'fas fa-tag' }
        ];
    }
    
    function getDefaultSubcategories() {
        return [
            { id: 1, name: 'Cocina', categoryId: 1, color: '#3B82F6' },
            { id: 2, name: 'Limpieza', categoryId: 1, color: '#3B82F6' },
            { id: 3, name: 'Móviles', categoryId: 2, color: '#10B981' },
            { id: 4, name: 'Computadoras', categoryId: 2, color: '#10B981' },
            { id: 5, name: 'Calzado', categoryId: 3, color: '#F59E0B' },
            { id: 6, name: 'Accesorios', categoryId: 3, color: '#F59E0B' },
            { id: 7, name: 'Muebles', categoryId: 4, color: '#EF4444' },
            { id: 8, name: 'Decoración', categoryId: 4, color: '#EF4444' },
            { id: 9, name: 'Promociones', categoryId: 5, color: '#8B5CF6' },
            { id: 10, name: 'Descuentos', categoryId: 5, color: '#8B5CF6' }
        ];
    }
    
    // ===================================
    // SISTEMA DE CHIPS M:M
    // ===================================
    function renderChipSelector(type, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const isCategory = type === 'category';
        const selectedItems = isCategory ? selectedCategories : selectedSubcategories;
        const availableItems = isCategory ? availableCategories : availableSubcategories;
        
        const chipsHTML = selectedItems.map(item => `
            <div class="chip" data-id="${item.id}" data-type="${type}">
                <i class="${item.icon || 'fas fa-tag'}"></i>
                <span>${item.name}</span>
                <button class="chip-remove" onclick="removeChip('${type}', ${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        const addButtonHTML = `
            <button type="button" class="chip-add-btn" data-type="${type}">
                <i class="fas fa-plus"></i>
                Agregar ${isCategory ? 'Categoría' : 'Subcategoría'}
            </button>
        `;
        
        container.innerHTML = `
            <div class="chip-container">
                ${chipsHTML}
                ${addButtonHTML}
            </div>
        `;
        
        // Agregar event listener al botón de agregar
        const addButton = container.querySelector('.chip-add-btn');
        if (addButton) {
            addButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openChipSelector(this.dataset.type);
            });
        }
    }
    
    function openChipSelector(type) {
        const isCategory = type === 'category';
        const availableItems = isCategory ? availableCategories : availableSubcategories;
        const selectedItems = isCategory ? selectedCategories : selectedSubcategories;
        
        const modalHTML = `
            <div class="chip-selector-modal">
                <div class="chip-selector-header">
                    <h3>Seleccionar ${isCategory ? 'Categorías' : 'Subcategorías'}</h3>
                    <button type="button" class="chip-selector-close" data-action="close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="chip-selector-search">
                    <input type="text" id="chipSearchInput" placeholder="Buscar ${isCategory ? 'categorías' : 'subcategorías'}..." 
                           onkeyup="filterChipItems('${type}')">
                    <i class="fas fa-search"></i>
                </div>
                
                <div class="chip-selector-content" id="chipSelectorContent">
                    ${renderChipSelectorItems(type, availableItems, selectedItems)}
                </div>
                
                <div class="chip-selector-footer">
                    <button type="button" class="btn btn-secondary" data-action="cancel">Cancelar</button>
                    <button type="button" class="btn btn-primary" data-action="apply" data-type="${type}">
                        Aplicar (${selectedItems.length})
                    </button>
                </div>
            </div>
        `;
        
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.className = 'chip-selector-overlay';
        overlay.style.zIndex = '100000';
        overlay.innerHTML = modalHTML;
        document.body.appendChild(overlay);
        
        // Agregar event listeners a los botones del modal
        const closeBtn = overlay.querySelector('[data-action="close"]');
        const cancelBtn = overlay.querySelector('[data-action="cancel"]');
        const applyBtn = overlay.querySelector('[data-action="apply"]');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeChipSelector();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeChipSelector();
            });
        }
        
        if (applyBtn) {
            applyBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                applyChipSelection(this.dataset.type);
            });
        }
        
        // Enfocar input de búsqueda
        setTimeout(() => {
            const searchInput = document.getElementById('chipSearchInput');
            if (searchInput) searchInput.focus();
        }, 100);
    }
    
    function renderChipSelectorItems(type, availableItems, selectedItems) {
        const selectedIds = selectedItems.map(item => item.id);
        
        return availableItems.map(item => {
            const isSelected = selectedIds.includes(item.id);
            return `
                <div class="chip-selector-item ${isSelected ? 'selected' : ''}" 
                     data-id="${item.id}" data-type="${type}"
                     onclick="toggleChipSelection('${type}', ${item.id})">
                    <div class="chip-selector-checkbox">
                        <i class="fas fa-check"></i>
                    </div>
                    <div class="chip-selector-icon" style="color: ${item.color}">
                        <i class="${item.icon || 'fas fa-tag'}"></i>
                    </div>
                    <div class="chip-selector-text">
                        <div class="chip-selector-name">${item.name}</div>
                        ${type === 'subcategory' ? `<div class="chip-selector-category">${getCategoryName(item.categoryId)}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function getCategoryName(categoryId) {
        const category = availableCategories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Sin categoría';
    }
    
    function toggleChipSelection(type, itemId) {
        const isCategory = type === 'category';
        const availableItems = isCategory ? availableCategories : availableSubcategories;
        const selectedItems = isCategory ? selectedCategories : selectedSubcategories;
        
        const item = availableItems.find(i => i.id === itemId);
        if (!item) return;
        
        const existingIndex = selectedItems.findIndex(i => i.id === itemId);
        
        if (existingIndex >= 0) {
            // Remover si ya está seleccionado
            selectedItems.splice(existingIndex, 1);
        } else {
            // Agregar si no está seleccionado
            selectedItems.push(item);
        }
        
        // Actualizar UI
        updateChipSelectorUI(type);
    }
    
    function updateChipSelectorUI(type) {
        const isCategory = type === 'category';
        const availableItems = isCategory ? availableCategories : availableSubcategories;
        const selectedItems = isCategory ? selectedCategories : selectedSubcategories;
        
        const content = document.getElementById('chipSelectorContent');
        if (content) {
            content.innerHTML = renderChipSelectorItems(type, availableItems, selectedItems);
        }
        
        // Actualizar contador en footer
        const footer = document.querySelector('.chip-selector-footer .btn-primary');
        if (footer) {
            footer.textContent = `Aplicar (${selectedItems.length})`;
        }
    }
    
    function applyChipSelection(type) {
        const isCategory = type === 'category';
        const containerId = isCategory ? 'categoriesChips' : 'subcategoriesChips';
        
        // Actualizar UI de chips
        renderChipSelector(type, containerId);
        
        // Cerrar modal
        closeChipSelector();
        
        console.log(`${type} seleccionadas:`, isCategory ? selectedCategories : selectedSubcategories);
        
        // Actualizar el contador en el botón de aplicar
        updateApplyButtonCount(type);
    }
    
    function updateApplyButtonCount(type) {
        const isCategory = type === 'category';
        const selectedItems = isCategory ? selectedCategories : selectedSubcategories;
        const applyBtn = document.querySelector(`[data-action="apply"][data-type="${type}"]`);
        
        if (applyBtn) {
            applyBtn.textContent = `Aplicar (${selectedItems.length})`;
        }
    }
    
    function removeChip(type, itemId) {
        const isCategory = type === 'category';
        const selectedItems = isCategory ? selectedCategories : selectedSubcategories;
        
        const index = selectedItems.findIndex(item => item.id === itemId);
        if (index >= 0) {
            selectedItems.splice(index, 1);
            renderChipSelector(type, isCategory ? 'categoriesChips' : 'subcategoriesChips');
        }
    }
    
    function closeChipSelector() {
        const overlay = document.querySelector('.chip-selector-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    function filterChipItems(type) {
        const searchInput = document.getElementById('chipSearchInput');
        const searchTerm = searchInput.value.toLowerCase();
        
        const isCategory = type === 'category';
        const availableItems = isCategory ? availableCategories : availableSubcategories;
        const selectedItems = isCategory ? selectedCategories : selectedSubcategories;
        
        const filteredItems = availableItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm)
        );
        
        const content = document.getElementById('chipSelectorContent');
        if (content) {
            content.innerHTML = renderChipSelectorItems(type, filteredItems, selectedItems);
        }
    }
    
    // ===================================
    // CARGA DE PRODUCTOS
    // ===================================
    function loadProducts() {
        console.log('Cargando productos...');
        
        // Mostrar loading
        showLoadingState();
        
        // Simular carga de datos (en producción vendría de una API)
        setTimeout(() => {
            // Intentar cargar desde 'productos' primero (compatibilidad con index)
            let savedProducts = localStorage.getItem('productos');
            
            // Si no hay en 'productos', intentar desde 'dashboardProducts'
            if (!savedProducts) {
                savedProducts = localStorage.getItem('dashboardProducts');
            }
            
            if (savedProducts) {
                try {
                    products = JSON.parse(savedProducts);
                    console.log('Productos cargados desde localStorage:', products.length);
                } catch (error) {
                    console.error('Error al cargar productos:', error);
                    products = [];
                }
            } else {
                // Datos de ejemplo
                products = getSampleProducts();
                saveProducts();
            }
            
            renderProducts();
        }, 500);
    }
    
    function getSampleProducts() {
        return [
            {
                id: 1,
                name: 'Microonda Damasco',
                description: 'Horno microondas de alta calidad con múltiples funciones',
                regularPrice: 250000,
                offerPrice: 200000,
                discount: 20,
                category: 'Electrodomésticos',
                subcategory: 'Cocina',
                image: 'img/productos/microonda.jpg',
                status: 'active',
                featured: true,
                stock: 15,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Smartphone Galaxy',
                description: 'Teléfono inteligente con cámara de alta resolución',
                regularPrice: 800000,
                offerPrice: 720000,
                discount: 10,
                category: 'Tecnología',
                subcategory: 'Móviles',
                image: 'img/placeholder.svg',
                status: 'active',
                featured: false,
                stock: 8,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Zapatos Deportivos',
                description: 'Zapatos cómodos para correr y hacer ejercicio',
                regularPrice: 120000,
                offerPrice: 96000,
                discount: 20,
                category: 'Ropa',
                subcategory: 'Calzado',
                image: 'img/placeholder.svg',
                status: 'inactive',
                featured: false,
                stock: 0,
                createdAt: new Date().toISOString()
            }
        ];
    }
    
    function saveProducts() {
        try {
            // Guardar en ambas claves para compatibilidad
            localStorage.setItem('dashboardProducts', JSON.stringify(products));
            localStorage.setItem('productos', JSON.stringify(products));
            console.log('Productos guardados en dashboardProducts y productos');
        } catch (error) {
            console.error('Error al guardar productos:', error);
        }
    }
    
    // ===================================
    // RENDERIZADO
    // ===================================
    function renderProducts() {
        if (!productsGrid) return;
        
        // Aplicar filtros y búsqueda
        applyFiltersAndSearch();
        
        if (filteredProducts.length === 0) {
            showEmptyState();
            return;
        }
        
        // Renderizar controles superiores
        renderControls();
        
        // Renderizar contenido según el tamaño de pantalla
        if (window.innerWidth <= 768) {
            console.log('Renderizando vista móvil - tarjetas');
            renderMobileCardsView();
        } else {
            console.log('Renderizando vista escritorio - tabla');
            renderTableView();
        }
        
        // Renderizar paginación
        renderPagination();
        
        // Agregar event listeners
        addProductCardListeners();
    }
    
    function renderControls() {
        const controlsHTML = `
            <div class="products-controls">
                <div class="controls-row">
                    <div class="controls-left">
                        <div class="search-box">
                            <input type="text" class="search-input" id="productSearch" 
                                   placeholder="Buscar productos..." value="${searchTerm}">
                            <i class="fas fa-search search-icon"></i>
                        </div>
                        <select class="filter-select" id="categoryFilter">
                            <option value="">Todas las categorías</option>
                            <option value="Electrodomésticos" ${filters.category === 'Electrodomésticos' ? 'selected' : ''}>Electrodomésticos</option>
                            <option value="Tecnología" ${filters.category === 'Tecnología' ? 'selected' : ''}>Tecnología</option>
                            <option value="Ropa" ${filters.category === 'Ropa' ? 'selected' : ''}>Ropa</option>
                            <option value="Hogar" ${filters.category === 'Hogar' ? 'selected' : ''}>Hogar</option>
                        </select>
                        <select class="filter-select" id="statusFilter">
                            <option value="">Todos los estados</option>
                            <option value="active" ${filters.status === 'active' ? 'selected' : ''}>Activos</option>
                            <option value="inactive" ${filters.status === 'inactive' ? 'selected' : ''}>Inactivos</option>
                        </select>
                    </div>
                </div>
                
                <div class="advanced-filters" id="advancedFilters">
                    <h4 class="filters-title" onclick="toggleAdvancedFilters()">
                        <i class="fas fa-chevron-right"></i>
                        Filtros Avanzados
                    </h4>
                    <div class="filters-grid">
                        <div class="filter-group">
                            <label class="filter-label">Precio Mínimo</label>
                            <input type="number" class="filter-input" id="priceMinFilter" 
                                   placeholder="0" value="${filters.priceMin}">
                        </div>
                        <div class="filter-group">
                            <label class="filter-label">Precio Máximo</label>
                            <input type="number" class="filter-input" id="priceMaxFilter" 
                                   placeholder="999999" value="${filters.priceMax}">
                        </div>
                        <div class="filter-group">
                            <label class="filter-label">Ordenar por</label>
                            <select class="filter-input" id="sortSelect">
                                <option value="name" ${sortColumn === 'name' ? 'selected' : ''}>Nombre</option>
                                <option value="price" ${sortColumn === 'price' ? 'selected' : ''}>Precio</option>
                                <option value="category" ${sortColumn === 'category' ? 'selected' : ''}>Categoría</option>
                                <option value="createdAt" ${sortColumn === 'createdAt' ? 'selected' : ''}>Fecha</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label class="filter-label">Dirección</label>
                            <select class="filter-input" id="sortDirection">
                                <option value="asc" ${sortDirection === 'asc' ? 'selected' : ''}>Ascendente</option>
                                <option value="desc" ${sortDirection === 'desc' ? 'selected' : ''}>Descendente</option>
                            </select>
                        </div>
                    </div>
                    <div class="filter-actions">
                        <button class="btn btn-secondary" onclick="clearFilters()">
                            <i class="fas fa-times"></i>
                            Limpiar Filtros
                        </button>
                        <button class="btn btn-primary" onclick="applyFilters()">
                            <i class="fas fa-search"></i>
                            Aplicar Filtros
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Insertar controles antes del grid
        if (productsGrid && productsGrid.parentNode) {
            const existingControls = productsGrid.parentNode.querySelector('.products-controls');
            if (existingControls) {
                existingControls.remove();
            }
            productsGrid.parentNode.insertAdjacentHTML('afterbegin', controlsHTML);
            
            // Configurar event listeners de controles
            setupControlsListeners();
        }
    }
    
    function renderTableView() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageProducts = filteredProducts.slice(startIndex, endIndex);
        
        const tableHTML = `
            <div class="products-table-container">
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" id="selectAll" onchange="toggleSelectAll(this)">
                            </th>
                            <th class="sortable" onclick="sortProducts('image')">Imagen</th>
                            <th class="sortable" onclick="sortProducts('name')">Producto</th>
                            <th class="sortable" onclick="sortProducts('category')">Categoría</th>
                            <th class="sortable" onclick="sortProducts('price')">Precio</th>
                            <th class="sortable" onclick="sortProducts('stock')">Stock</th>
                            <th class="sortable" onclick="sortProducts('status')">Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pageProducts.map(product => createTableRow(product)).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        productsGrid.innerHTML = tableHTML;
        productsGrid.style.width = '100%';
        productsGrid.className = 'products-grid table-view';
    }
    
    function renderMobileCardsView() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageProducts = filteredProducts.slice(startIndex, endIndex);
        
        const cardsHTML = `
            <div class="mobile-products-grid">
                ${pageProducts.map(product => createMobileCard(product)).join('')}
            </div>
        `;
        
        productsGrid.innerHTML = cardsHTML;
        productsGrid.className = 'products-grid mobile-cards-view';
    }
    
    
    function renderPagination() {
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage + 1;
        const endIndex = Math.min(currentPage * itemsPerPage, filteredProducts.length);
        
        if (totalPages <= 1) return;
        
        const paginationHTML = `
            <div class="pagination-container">
                <div class="pagination-info">
                    Mostrando ${startIndex}-${endIndex} de ${filteredProducts.length} productos
                </div>
                <div class="pagination-controls">
                    <button class="pagination-btn" onclick="goToPage(1)" ${currentPage === 1 ? 'disabled' : ''}>
                        <i class="fas fa-angle-double-left"></i>
                    </button>
                    <button class="pagination-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                        <i class="fas fa-angle-left"></i>
                    </button>
                    
                    <div class="pagination-pages">
                        ${generatePaginationPages(totalPages)}
                    </div>
                    
                    <button class="pagination-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                        <i class="fas fa-angle-right"></i>
                    </button>
                    <button class="pagination-btn" onclick="goToPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>
                        <i class="fas fa-angle-double-right"></i>
                    </button>
                    
                    <div class="pagination-size">
                        <span>Mostrar:</span>
                        <select onchange="changeItemsPerPage(this.value)">
                            <option value="10" ${itemsPerPage === 10 ? 'selected' : ''}>10</option>
                            <option value="25" ${itemsPerPage === 25 ? 'selected' : ''}>25</option>
                            <option value="50" ${itemsPerPage === 50 ? 'selected' : ''}>50</option>
                            <option value="100" ${itemsPerPage === 100 ? 'selected' : ''}>100</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
        
        // Insertar paginación después del grid
        if (productsGrid && productsGrid.parentNode) {
            const existingPagination = productsGrid.parentNode.querySelector('.pagination-container');
            if (existingPagination) {
                existingPagination.remove();
            }
            productsGrid.parentNode.insertAdjacentHTML('beforeend', paginationHTML);
        }
    }
    
    function generatePaginationPages(totalPages) {
        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(`
                <button class="pagination-page ${i === currentPage ? 'active' : ''}" 
                        onclick="goToPage(${i})">${i}</button>
            `);
        }
        
        return pages.join('');
    }
    
    function createTableRow(product) {
        const statusClass = product.status === 'active' ? 'active' : 'inactive';
        const statusText = product.status === 'active' ? 'Activo' : 'Inactivo';
        const isSelected = selectedProducts.has(product.id);
        
        return `
            <tr class="${isSelected ? 'selected' : ''}" data-product-id="${product.id}">
                <td>
                    <input type="checkbox" class="product-checkbox" 
                           ${isSelected ? 'checked' : ''} 
                           onchange="toggleProductSelection(${product.id}, this)">
                </td>
                <td>
                    <img src="${product.image}" alt="${product.name}" class="product-image-small" 
                         onerror="this.src='img/placeholder.svg'">
                </td>
                <td>
                    <div class="product-name">${product.name}</div>
                    <div class="product-category-small">${product.category} - ${product.subcategory}</div>
                </td>
                <td>${product.category}</td>
                <td>
                    <div class="product-price-small">$${product.offerPrice.toLocaleString()}</div>
                    ${product.regularPrice > product.offerPrice ? 
                        `<div class="product-price-original-small">$${product.regularPrice.toLocaleString()}</div>` : ''
                    }
                </td>
                <td>
                    <span class="product-stock-small">${product.stock || 0}</span>
                </td>
                <td>
                    <span class="product-status-small ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="product-actions-small">
                        <button class="btn btn-primary btn-sm" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
    
    function createMobileCard(product) {
        const statusClass = product.status === 'active' ? 'active' : 'inactive';
        const statusText = product.status === 'active' ? 'Activo' : 'Inactivo';
        const featuredClass = product.featured ? 'featured' : '';
        const isSelected = selectedProducts.has(product.id);
        const discount = product.regularPrice > product.offerPrice ? 
            Math.round(((product.regularPrice - product.offerPrice) / product.regularPrice) * 100) : 0;
        
        return `
            <div class="mobile-product-card ${isSelected ? 'selected' : ''}" data-product-id="${product.id}">
                <div class="mobile-product-image-container">
                    <input type="checkbox" class="mobile-product-checkbox" 
                           ${isSelected ? 'checked' : ''} 
                           onchange="toggleProductSelection(${product.id}, this)">
                    ${discount > 0 ? `<span class="mobile-discount-badge">-${discount}%</span>` : ''}
                    <img src="${product.image}" alt="${product.name}" class="mobile-product-image" 
                         onerror="this.src='img/placeholder.svg'">
                    <div class="mobile-product-status ${statusClass} ${featuredClass}">
                        ${product.featured ? 'Destacado' : statusText}
                    </div>
                </div>
                
                <div class="mobile-product-info">
                    <div class="mobile-product-brand">${product.category}</div>
                    <h3 class="mobile-product-name">${product.name}</h3>
                    <p class="mobile-product-description">${product.description}</p>
                    
                    <div class="mobile-product-price-container">
                        <div class="mobile-price-info">
                            <span class="mobile-price-current">$${product.offerPrice.toLocaleString()}</span>
                            ${product.regularPrice > product.offerPrice ? 
                                `<span class="mobile-price-old">$${product.regularPrice.toLocaleString()}</span>` : ''
                            }
                        </div>
                        <div class="mobile-stock-info">
                            <span class="mobile-stock-label">Stock:</span>
                            <span class="mobile-stock-value">${product.stock || 0}</span>
                        </div>
                    </div>
                    
                    <div class="mobile-product-actions">
                        <button class="mobile-btn-edit" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="mobile-btn-delete" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    
    function showLoadingState() {
        if (!productsGrid) return;
        
        const skeletonHTML = `
            <div class="products-loading">
                ${Array(6).fill(0).map(() => `
                    <div class="product-skeleton">
                        <div class="skeleton-image"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-line"></div>
                            <div class="skeleton-line short"></div>
                            <div class="skeleton-line medium"></div>
                            <div class="skeleton-line short"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        productsGrid.innerHTML = skeletonHTML;
    }
    
    function showEmptyState() {
        if (!productsGrid) return;
        
        const emptyHTML = `
            <div class="products-empty">
                <i class="fas fa-box-open"></i>
                <h3>No hay productos</h3>
                <p>Comienza agregando tu primer producto al catálogo. Los productos aparecerán aquí una vez que los crees.</p>
                <button class="btn btn-primary" onclick="showNewProductForm()">
                    <i class="fas fa-plus"></i>
                    Agregar Producto
                </button>
            </div>
        `;
        
        productsGrid.innerHTML = emptyHTML;
    }
    
    // ===================================
    // FORMULARIOS
    // ===================================
    function showNewProductForm() {
        console.log('showNewProductForm llamado');
        isEditing = false;
        currentProduct = null;
        console.log('Llamando a showProductForm...');
        showProductForm();
    }
    
    
    function showProductForm() {
        console.log('showProductForm iniciado');
        
        // Asegurar que las categorías estén cargadas
        if (availableCategories.length === 0 || availableSubcategories.length === 0) {
            loadCategoriesAndSubcategories();
        }
        
        // Inicializar selecciones de chips
        if (isEditing && currentProduct) {
            // Cargar categorías y subcategorías del producto existente
            // Convertir IDs a objetos completos
            selectedCategories = (currentProduct.categories || []).map(catId => 
                availableCategories.find(cat => cat.id === catId)
            ).filter(cat => cat !== undefined);
            
            selectedSubcategories = (currentProduct.subcategories || []).map(subId => 
                availableSubcategories.find(sub => sub.id === subId)
            ).filter(sub => sub !== undefined);
            
            console.log('Categorías cargadas:', selectedCategories);
            console.log('Subcategorías cargadas:', selectedSubcategories);
        } else {
            // Limpiar selecciones para nuevo producto
            selectedCategories = [];
            selectedSubcategories = [];
        }
        
        const formHTML = createProductForm();
        console.log('Formulario HTML creado, longitud:', formHTML.length);
        
        // Forzar el uso de createModal manual (window.dashboard.openModal no funciona)
        console.log('Usando createModal manual (forzado)');
        createModal(
            isEditing ? 'Editar Producto' : 'Nuevo Producto',
            formHTML,
            'large'
        );
        
        console.log('Configurando event listeners...');
        // Configurar event listeners del formulario
        setupProductFormListeners();
        
        // Inicializar chips después de que el modal esté en el DOM
        setTimeout(() => {
            renderChipSelector('category', 'categoriesChips');
            renderChipSelector('subcategory', 'subcategoriesChips');
            setupCreditoOptions();
        }, 100);
        
        console.log('showProductForm completado');
    }
    
    function createModal(title, content, size = 'medium') {
        console.log('🚀 createModal iniciado:', title);
        
        // Eliminar modal existente si existe
        const existingModal = document.getElementById('productModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Crear overlay con estilos inline para garantizar visibilidad
        const overlay = document.createElement('div');
        overlay.id = 'productModal';
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background: rgba(0, 0, 0, 0.5) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 99999 !important;
            padding: 20px !important;
        `;
        
        // Crear modal con estilos inline del dashboard
        const modal = document.createElement('div');
        modal.style.cssText = `
            background:rgb(48, 48, 48) !important;
            border-radius: 8px !important;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
            max-width: 800px !important;
            width: 100% !important;
            max-height: 90vh !important;
            overflow-y: auto !important;
            transform: scale(0.9) translateY(-20px) !important;
            opacity: 0 !important;
            transition: all 0.3s ease !important;
        `;
        
        // Aplicar animación después de un breve delay
        setTimeout(() => {
            modal.style.transform = 'scale(1) translateY(0)';
            modal.style.opacity = '1';
        }, 10);
        
        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e9ecef; background:rgb(49, 49, 49); border-radius: 8px 8px 0 0;">
                <h3 style="font-size: 18px; font-weight: 600; color:rgb(255, 255, 255); margin: 0;">${title}</h3>
                <button onclick="closeModal()" style="background: none; border: none; font-size: 18px; color: #7f8c8d; cursor: pointer; padding: 5px; border-radius: 8px; transition: all 0.3s ease;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="padding: 20px; background:rgb(40, 40, 41);">
                ${content}
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Agregar listener para cerrar al hacer clic en el overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
        
        // Agregar hover effects al botón de cerrar
        const closeBtn = modal.querySelector('button');
        if (closeBtn) {
            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.backgroundColor = '#f8f9fa';
                closeBtn.style.color = '#2c3e50';
            });
            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.backgroundColor = 'transparent';
                closeBtn.style.color = '#7f8c8d';
            });
        }
        
        console.log('✅ Modal creado y mostrado correctamente');
    }
    
    function closeModal() {
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.remove();
            console.log('Modal cerrado');
        }
    }
    
    // showToast ahora se usa directamente desde window.dashboard.showToast
    
    function createProductForm() {
        const product = currentProduct || {
            name: '',
            description: '',
            regularPrice: '',
            offerPrice: '',
            category: '',
            subcategory: '',
            image: '',
            status: 'active',
            featured: false,
            stock: 0
        };
        
        return `
            <form id="productForm" class="product-form">
                <div class="form-section">
                    <h4 class="form-section-title">Información Básica</h4>
                    
                    <div class="form-group">
                        <label for="productName" class="form-label">Nombre del Producto *</label>
                        <input type="text" id="productName" name="name" class="form-control" 
                               value="${product.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="productDescription" class="form-label">Descripción *</label>
                        <textarea id="productDescription" name="description" class="form-control" 
                                  rows="3" required>${product.description}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Categorías *</label>
                        <div id="categoriesChips" class="chip-selector-container">
                            <!-- Los chips se cargarán dinámicamente -->
                        </div>
                        <small class="form-help">Selecciona una o más categorías para este producto</small>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Subcategorías</label>
                        <div id="subcategoriesChips" class="chip-selector-container">
                            <!-- Los chips se cargarán dinámicamente -->
                        </div>
                        <small class="form-help">Selecciona una o más subcategorías para este producto (opcional)</small>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4 class="form-section-title">Precios</h4>
                    
                    <div class="price-inputs">
                        <div class="form-group">
                            <label for="productRegularPrice" class="form-label">Precio Regular *</label>
                            <input type="number" id="productRegularPrice" name="regularPrice" 
                                   class="form-control" value="${product.regularPrice}" min="0" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="productOfferPrice" class="form-label">Precio de Oferta</label>
                            <input type="number" id="productOfferPrice" name="offerPrice" 
                                   class="form-control" value="${product.offerPrice}" min="0">
                        </div>
                    </div>
                    
                    <div class="discount-calculator" id="discountCalculator" style="display: none;">
                        <h4>Calculadora de Descuento</h4>
                        <div class="discount-preview">
                            <span class="original-price">Precio original: $0</span>
                            <span class="discount-amount">Descuento: $0 (0%)</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4 class="form-section-title">Opciones de Crédito</h4>
                    
                    <div class="form-group">
                        <div class="switch-container">
                            <label class="switch">
                                <input type="checkbox" id="creditoEnabled" name="creditoEnabled" 
                                       ${product.credito?.habilitado ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                            <label for="creditoEnabled" class="switch-label">Habilitar venta a crédito</label>
                        </div>
                        <small class="form-help">Permite vender este producto en cuotas</small>
                    </div>
                    
                    <div class="credito-options" id="creditoOptions" style="display: ${product.credito?.habilitado ? 'block' : 'none'};">
                        <div class="form-group">
                            <label for="creditoCuotas" class="form-label">Número de Cuotas</label>
                            <select id="creditoCuotas" name="creditoCuotas" class="form-control">
                                <option value="2" ${product.credito?.cuotas === 2 ? 'selected' : ''}>2 Cuotas</option>
                                <option value="3" ${product.credito?.cuotas === 3 ? 'selected' : ''}>3 Cuotas</option>
                                <option value="4" ${product.credito?.cuotas === 4 ? 'selected' : ''}>4 Cuotas</option>
                            </select>
                            <small class="form-help">Selecciona el número de cuotas para este producto</small>
                        </div>
                        
                        <div class="credito-preview" id="creditoPreview" style="display: none;">
                            <div class="preview-info">
                                <span class="preview-label">Monto por cuota:</span>
                                <span class="preview-value" id="cuotaValue">$0.00</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4 class="form-section-title">Imagen del Producto</h4>
                    
                    <div class="image-upload-area" id="imageUploadArea">
                        <div class="image-upload-icon">
                            <i class="fas fa-cloud-upload-alt"></i>
                        </div>
                        <div class="image-upload-text">Arrastra una imagen aquí o haz clic para seleccionar</div>
                        <div class="image-upload-hint">Formatos: JPG, PNG, GIF. Tamaño máximo: 2MB</div>
                        <input type="file" id="productImage" name="image" accept="image/*" style="display: none;">
                    </div>
                    
                    <div class="image-preview" id="imagePreview" style="display: none;">
                        <img id="previewImage" src="" alt="Vista previa">
                    </div>
                </div>
                
                <div class="form-section">
                    <h4 class="form-section-title">Configuración</h4>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="productStock" class="form-label">Stock Disponible</label>
                            <input type="number" id="productStock" name="stock" 
                                   class="form-control" value="${product.stock}" min="0">
                        </div>
                        
                        <div class="form-group">
                            <label for="productStatus" class="form-label">Estado</label>
                            <select id="productStatus" name="status" class="form-control">
                                <option value="active" ${product.status === 'active' ? 'selected' : ''}>Activo</option>
                                <option value="inactive" ${product.status === 'inactive' ? 'selected' : ''}>Inactivo</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" id="productFeatured" name="featured" 
                                   ${product.featured ? 'checked' : ''} style="margin-right: 8px;">
                            Producto destacado
                        </label>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${isEditing ? 'Actualizar' : 'Crear'} Producto
                    </button>
                </div>
            </form>
        `;
    }
    
    function setupProductFormListeners() {
        // Upload de imagen
        const imageUploadArea = document.getElementById('imageUploadArea');
        const productImage = document.getElementById('productImage');
        const imagePreview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        
        if (imageUploadArea && productImage) {
            imageUploadArea.addEventListener('click', () => productImage.click());
            
            imageUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                imageUploadArea.classList.add('dragover');
            });
            
            imageUploadArea.addEventListener('dragleave', () => {
                imageUploadArea.classList.remove('dragover');
            });
            
            imageUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                imageUploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    handleImageUpload(files[0]);
                }
            });
            
            productImage.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleImageUpload(e.target.files[0]);
                }
            });
        }
        
        // Calculadora de descuento
        const regularPriceInput = document.getElementById('productRegularPrice');
        const offerPriceInput = document.getElementById('productOfferPrice');
        const discountCalculator = document.getElementById('discountCalculator');
        
        if (regularPriceInput && offerPriceInput && discountCalculator) {
            [regularPriceInput, offerPriceInput].forEach(input => {
                input.addEventListener('input', updateDiscountCalculator);
            });
        }
        
        // Formulario
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', handleProductSubmit);
        }
    }
    
    function handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            window.dashboard.showToast('Por favor selecciona un archivo de imagen válido', 'error');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            window.dashboard.showToast('La imagen es demasiado grande. Máximo 2MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImage = document.getElementById('previewImage');
            const imagePreview = document.getElementById('imagePreview');
            
            if (previewImage && imagePreview) {
                previewImage.src = e.target.result;
                imagePreview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
    
    function updateDiscountCalculator() {
        const regularPrice = parseFloat(document.getElementById('productRegularPrice').value) || 0;
        const offerPrice = parseFloat(document.getElementById('productOfferPrice').value) || 0;
        const discountCalculator = document.getElementById('discountCalculator');
        
        if (regularPrice > 0 && offerPrice > 0 && offerPrice < regularPrice) {
            const discount = regularPrice - offerPrice;
            const discountPercent = Math.round((discount / regularPrice) * 100);
            
            discountCalculator.style.display = 'block';
            discountCalculator.querySelector('.original-price').textContent = `Precio original: $${regularPrice.toLocaleString()}`;
            discountCalculator.querySelector('.discount-amount').textContent = `Descuento: $${discount.toLocaleString()} (${discountPercent}%)`;
        } else {
            discountCalculator.style.display = 'none';
        }
    }
    
    function handleProductSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            // Relaciones M:M - usar arrays de IDs
            categories: selectedCategories.map(cat => cat.id),
            subcategories: selectedSubcategories.map(sub => sub.id),
            regularPrice: parseFloat(formData.get('regularPrice')),
            offerPrice: parseFloat(formData.get('offerPrice')) || parseFloat(formData.get('regularPrice')),
            stock: parseInt(formData.get('stock')) || 0,
            status: formData.get('status'),
            featured: formData.has('featured'),
            image: currentProduct?.image || 'img/placeholder.svg',
            // Sistema de crédito
            credito: {
                habilitado: formData.has('creditoEnabled'),
                cuotas: formData.has('creditoEnabled') ? parseInt(formData.get('creditoCuotas')) : null
            }
        };
        
        // Validaciones
        if (!productData.name || !productData.description) {
            window.dashboard.showToast('Por favor completa todos los campos obligatorios', 'error');
            return;
        }
        
        if (selectedCategories.length === 0) {
            window.dashboard.showToast('Debes seleccionar al menos una categoría', 'error');
            return;
        }
        
        // Las subcategorías son opcionales, no se valida
        
        if (productData.regularPrice <= 0) {
            window.dashboard.showToast('El precio regular debe ser mayor a 0', 'error');
            return;
        }
        
        if (productData.offerPrice > productData.regularPrice) {
            window.dashboard.showToast('El precio de oferta no puede ser mayor al precio regular', 'error');
            return;
        }
        
        // Calcular descuento
        if (productData.offerPrice < productData.regularPrice) {
            productData.discount = Math.round(((productData.regularPrice - productData.offerPrice) / productData.regularPrice) * 100);
        } else {
            productData.discount = 0;
        }
        
        if (isEditing) {
            updateProduct(currentProduct.id, productData);
        } else {
            createProduct(productData);
        }
    }
    
    // ===================================
    // CRUD OPERATIONS
    // ===================================
    function createProduct(productData) {
        const newProduct = {
            ...productData,
            id: window.generateId('product'),
            createdAt: new Date().toISOString()
        };
        
        products.push(newProduct);
        saveProducts();
        renderProducts();
        
        closeModal();
        window.dashboard.showToast('Producto creado exitosamente', 'success');
        
        // Actualizar badges de crédito en el frontend
        if (typeof window.updateProductCreditoBadges === 'function') {
            window.updateProductCreditoBadges();
        }
        
        console.log('Producto creado:', newProduct);
    }
    
    function updateProduct(productId, productData) {
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            products[productIndex] = {
                ...products[productIndex],
                ...productData,
                id: productId
            };
            
            saveProducts();
            renderProducts();
            
            closeModal();
            window.dashboard.showToast('Producto actualizado exitosamente', 'success');
            
            // Actualizar badges de crédito en el frontend
            if (typeof window.updateProductCreditoBadges === 'function') {
                window.updateProductCreditoBadges();
            }
            
            console.log('Producto actualizado:', products[productIndex]);
        }
    }
    
    function deleteProduct(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        const confirmationHTML = `
            <div class="confirmation-modal">
                <div class="confirmation-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="confirmation-message">
                    ¿Estás seguro de que quieres eliminar el producto <strong>"${product.name}"</strong>?<br>
                    Esta acción no se puede deshacer.
                </div>
                <div class="confirmation-actions">
                    <button class="btn btn-secondary" onclick="closeModal()">
                        Cancelar
                    </button>
                    <button class="btn btn-danger" onclick="confirmDeleteProduct(${productId})">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        `;
        
        createModal('Confirmar Eliminación', confirmationHTML);
    }
    
    function confirmDeleteProduct(productId) {
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            const productName = products[productIndex].name;
            products.splice(productIndex, 1);
            
            saveProducts();
            renderProducts();
            
            closeModal();
            window.dashboard.showToast(`Producto "${productName}" eliminado exitosamente`, 'success');
            
            console.log('Producto eliminado:', productId);
        }
    }
    
    function editProduct(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        isEditing = true;
        currentProduct = product;
        showProductForm();
    }
    
    // ===================================
    // UTILIDADES
    // ===================================
    function addProductCardListeners() {
        // Los event listeners se agregan mediante onclick en el HTML generado
        // para evitar problemas con elementos dinámicos
    }
    
    // ===================================
    // FUNCIONES DE CONTROL
    // ===================================
    function setupControlsListeners() {
        // Búsqueda
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchTerm = e.target.value;
                currentPage = 1;
                renderProducts();
            });
        }
        
        // Filtros básicos
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                filters.category = e.target.value;
                currentPage = 1;
                renderProducts();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                filters.status = e.target.value;
                currentPage = 1;
                renderProducts();
            });
        }
        
        // Filtros avanzados
        const priceMinFilter = document.getElementById('priceMinFilter');
        const priceMaxFilter = document.getElementById('priceMaxFilter');
        const sortSelect = document.getElementById('sortSelect');
        const sortDirection = document.getElementById('sortDirection');
        
        if (priceMinFilter) {
            priceMinFilter.addEventListener('input', (e) => {
                filters.priceMin = e.target.value;
            });
        }
        
        if (priceMaxFilter) {
            priceMaxFilter.addEventListener('input', (e) => {
                filters.priceMax = e.target.value;
            });
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                sortColumn = e.target.value;
                renderProducts();
            });
        }
        
        if (sortDirection) {
            sortDirection.addEventListener('change', (e) => {
                sortDirection = e.target.value;
                renderProducts();
            });
        }
    }
    
    function applyFiltersAndSearch() {
        filteredProducts = products.filter(product => {
            // Búsqueda por texto
            if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !product.description.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            
            // Filtro por categoría
            if (filters.category && product.category !== filters.category) {
                return false;
            }
            
            // Filtro por estado
            if (filters.status && product.status !== filters.status) {
                return false;
            }
            
            // Filtro por precio mínimo
            if (filters.priceMin && product.offerPrice < parseFloat(filters.priceMin)) {
                return false;
            }
            
            // Filtro por precio máximo
            if (filters.priceMax && product.offerPrice > parseFloat(filters.priceMax)) {
                return false;
            }
            
            return true;
        });
        
        // Ordenar productos
        filteredProducts.sort((a, b) => {
            let aValue = a[sortColumn];
            let bValue = b[sortColumn];
            
            if (sortColumn === 'price') {
                aValue = a.offerPrice;
                bValue = b.offerPrice;
            }
            
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }
    
    
    function toggleAdvancedFilters() {
        const filtersElement = document.getElementById('advancedFilters');
        const titleElement = document.querySelector('.filters-title');
        
        if (filtersElement && titleElement) {
            filtersElement.classList.toggle('expanded');
            titleElement.classList.toggle('expanded');
        }
    }
    
    function clearFilters() {
        searchTerm = '';
        filters = {
            category: '',
            status: '',
            priceMin: '',
            priceMax: ''
        };
        currentPage = 1;
        renderProducts();
    }
    
    function applyFilters() {
        currentPage = 1;
        renderProducts();
    }
    
    function sortProducts(column) {
        if (sortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = column;
            sortDirection = 'asc';
        }
        renderProducts();
    }
    
    function goToPage(page) {
        currentPage = page;
        renderProducts();
    }
    
    function changeItemsPerPage(newSize) {
        itemsPerPage = parseInt(newSize);
        currentPage = 1;
        renderProducts();
    }
    
    function toggleSelectAll(checkbox) {
        const isChecked = checkbox.checked;
        const productCheckboxes = document.querySelectorAll('.product-checkbox, .product-checkbox-card');
        
        productCheckboxes.forEach(cb => {
            if (cb !== checkbox) {
                cb.checked = isChecked;
                const productId = parseInt(cb.closest('[data-product-id]').dataset.productId);
                if (isChecked) {
                    selectedProducts.add(productId);
                } else {
                    selectedProducts.delete(productId);
                }
            }
        });
        
        renderProducts();
    }
    
    function toggleProductSelection(productId, checkbox) {
        if (checkbox.checked) {
            selectedProducts.add(productId);
        } else {
            selectedProducts.delete(productId);
        }
        renderProducts();
    }
    
    function bulkAction(action) {
        if (selectedProducts.size === 0) {
            window.dashboard.showToast('Selecciona al menos un producto', 'warning');
            return;
        }
        
        const selectedIds = Array.from(selectedProducts);
        
        switch (action) {
            case 'activate':
                selectedIds.forEach(id => {
                    const product = products.find(p => p.id === id);
                    if (product) product.status = 'active';
                });
                saveProducts();
                selectedProducts.clear();
                renderProducts();
                window.dashboard.showToast(`${selectedIds.length} productos activados`, 'success');
                break;
                
            case 'deactivate':
                selectedIds.forEach(id => {
                    const product = products.find(p => p.id === id);
                    if (product) product.status = 'inactive';
                });
                saveProducts();
                selectedProducts.clear();
                renderProducts();
                window.dashboard.showToast(`${selectedIds.length} productos desactivados`, 'success');
                break;
                
            case 'delete':
                const confirmationHTML = `
                    <div class="confirmation-modal">
                        <div class="confirmation-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="confirmation-message">
                            ¿Estás seguro de que quieres eliminar ${selectedIds.length} productos?<br>
                            Esta acción no se puede deshacer.
                        </div>
                        <div class="confirmation-actions">
                            <button class="btn btn-secondary" onclick="closeModal()">
                                Cancelar
                            </button>
                            <button class="btn btn-danger" onclick="confirmBulkDelete()">
                                <i class="fas fa-trash"></i>
                                Eliminar
                            </button>
                        </div>
                    </div>
                `;
                
                createModal('Confirmar Eliminación Masiva', confirmationHTML);
                break;
        }
    }
    
    function confirmBulkDelete() {
        const selectedIds = Array.from(selectedProducts);
        const deletedCount = selectedIds.length;
        
        products = products.filter(product => !selectedIds.includes(product.id));
        saveProducts();
        selectedProducts.clear();
        renderProducts();
        
        closeModal();
        window.dashboard.showToast(`${deletedCount} productos eliminados`, 'success');
    }
    
    // ===================================
    // GESTIÓN DE INVENTARIO
    // ===================================
    function showInventoryModal() {
        console.log('Mostrando modal de inventario');
        const inventoryHTML = createInventoryModal();
        createPersistentModal('Gestión de Inventario', inventoryHTML, 'large');
    }
    
    function createPersistentModal(title, content, size = 'medium') {
        // Eliminar modal existente si existe
        const existingModal = document.getElementById('inventoryModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.id = 'inventoryModal';
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background: rgba(0, 0, 0, 0.5) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 99999 !important;
            padding: 20px !important;
        `;
        
        // Crear modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: rgb(48, 48, 48) !important;
            border-radius: 8px !important;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
            max-width: 1200px !important;
            width: 100% !important;
            max-height: 90vh !important;
            overflow-y: auto !important;
            transform: scale(0.9) translateY(-20px) !important;
            opacity: 0 !important;
            transition: all 0.3s ease !important;
        `;
        
        // Aplicar animación
        setTimeout(() => {
            modal.style.transform = 'scale(1) translateY(0)';
            modal.style.opacity = '1';
        }, 10);
        
        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e9ecef; background: rgb(49, 49, 49); border-radius: 8px 8px 0 0;">
                <h3 style="font-size: 18px; font-weight: 600; color: rgb(255, 255, 255); margin: 0;">${title}</h3>
                <button onclick="closeInventoryModal()" style="background: none; border: none; font-size: 18px; color: #7f8c8d; cursor: pointer; padding: 5px; border-radius: 8px; transition: all 0.3s ease;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="padding: 20px; background: rgb(40, 40, 41);">
                ${content}
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // NO cerrar al hacer clic en overlay (modal persistente)
        // overlay.addEventListener('click', (e) => {
        //     if (e.target === overlay) {
        //         closeInventoryModal();
        //     }
        // });
    }
    
    function closeInventoryModal() {
        const modal = document.getElementById('inventoryModal');
        if (modal) {
            modal.remove();
        }
    }
    
    function createInventoryModal() {
        return `
            <div class="inventory-container">
                <div class="inventory-tabs">
                    <button class="inventory-tab active" onclick="switchInventoryTab('overview')">
                        <i class="fas fa-chart-pie"></i>
                        Resumen
                    </button>
                    <button class="inventory-tab" onclick="switchInventoryTab('products')">
                        <i class="fas fa-boxes"></i>
                        Productos
                    </button>
                    <button class="inventory-tab" onclick="switchInventoryTab('movements')">
                        <i class="fas fa-exchange-alt"></i>
                        Movimientos
                    </button>
                    <button class="inventory-tab" onclick="switchInventoryTab('locations')">
                        <i class="fas fa-map-marker-alt"></i>
                        Ubicaciones
                    </button>
                </div>
                
                <div class="inventory-content">
                    <div class="inventory-tab-content active" id="overview-tab">
                        ${createInventoryOverview()}
                    </div>
                    
                    <div class="inventory-tab-content" id="products-tab">
                        ${createInventoryProducts()}
                    </div>
                    
                    <div class="inventory-tab-content" id="movements-tab">
                        ${createInventoryMovements()}
                    </div>
                    
                    <div class="inventory-tab-content" id="locations-tab">
                        ${createInventoryLocations()}
                    </div>
                </div>
            </div>
        `;
    }
    
    function createInventoryOverview() {
        const totalProducts = products.length;
        const lowStockProducts = products.filter(p => p.stock < 10).length;
        const outOfStockProducts = products.filter(p => p.stock === 0).length;
        const totalValue = products.reduce((sum, p) => sum + (p.stock * p.regularPrice), 0);
        
        // Detectar tipo de negocio basado en productos
        const hasPhysicalStock = products.some(p => p.stock > 0);
        const businessType = hasPhysicalStock ? 'fisico' : 'digital';
        
        return `
            <div class="inventory-overview">
                <div class="business-type-indicator">
                    <div class="business-type ${businessType}">
                        <i class="fas fa-${businessType === 'fisico' ? 'warehouse' : 'laptop'}"></i>
                        <span>${businessType === 'fisico' ? 'Negocio Físico' : 'Negocio Digital/Crédito'}</span>
                    </div>
                </div>
                
                <div class="overview-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-boxes"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${totalProducts}</div>
                            <div class="stat-label">Total Productos</div>
                        </div>
                    </div>
                    
                    ${businessType === 'fisico' ? `
                    <div class="stat-card warning">
                        <div class="stat-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${lowStockProducts}</div>
                            <div class="stat-label">Stock Bajo</div>
                        </div>
                    </div>
                    
                    <div class="stat-card danger">
                        <div class="stat-icon">
                            <i class="fas fa-times-circle"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${outOfStockProducts}</div>
                            <div class="stat-label">Sin Stock</div>
                        </div>
                    </div>
                    ` : `
                    <div class="stat-card info">
                        <div class="stat-icon">
                            <i class="fas fa-credit-card"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${products.filter(p => p.stock === 0).length}</div>
                            <div class="stat-label">Productos Disponibles</div>
                        </div>
                    </div>
                    
                    <div class="stat-card success">
                        <div class="stat-icon">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${products.length - products.filter(p => p.stock === 0).length}</div>
                            <div class="stat-label">En Crédito</div>
                        </div>
                    </div>
                    `}
                    
                    <div class="stat-card success">
                        <div class="stat-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">$${totalValue.toLocaleString()}</div>
                            <div class="stat-label">Valor Total</div>
                        </div>
                    </div>
                </div>
                
                <div class="overview-alerts">
                    <h4>Alertas de Stock</h4>
                    <div class="alerts-list">
                        ${products.filter(p => p.stock < 10).map(product => `
                            <div class="alert-item ${product.stock === 0 ? 'danger' : 'warning'}">
                                <i class="fas fa-${product.stock === 0 ? 'times-circle' : 'exclamation-triangle'}"></i>
                                <span>${product.name} - Stock: ${product.stock}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    function createInventoryProducts() {
        // Detectar tipo de negocio
        const hasPhysicalStock = products.some(p => p.stock > 0);
        const businessType = hasPhysicalStock ? 'fisico' : 'digital';
        
        return `
            <div class="inventory-products">
                <div class="products-controls">
                    <div class="search-box">
                        <input type="text" class="search-input" id="inventorySearch" placeholder="Buscar productos...">
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <button class="btn btn-primary" onclick="showAdjustStockModal()">
                        <i class="fas fa-${businessType === 'fisico' ? 'plus' : 'edit'}"></i>
                        ${businessType === 'fisico' ? 'Ajustar Stock' : 'Gestionar Productos'}
                    </button>
                </div>
                
                <div class="products-table">
                    <table class="inventory-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                ${businessType === 'fisico' ? `
                                <th>Stock Actual</th>
                                <th>Stock Mínimo</th>
                                <th>Ubicación</th>
                                <th>Último Movimiento</th>
                                ` : `
                                <th>Estado</th>
                                <th>Precio</th>
                                <th>Disponibilidad</th>
                                <th>Última Actualización</th>
                                `}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map(product => createInventoryProductRow(product, businessType)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    function createInventoryProductRow(product, businessType = 'fisico') {
        const stockStatus = product.stock === 0 ? 'danger' : product.stock < 10 ? 'warning' : 'success';
        const lastMovement = product.lastMovement || 'Nunca';
        const location = product.location || 'Sin ubicación';
        const lastUpdate = product.lastUpdate || new Date().toLocaleDateString();
        
        return `
            <tr class="inventory-row">
                <td>
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-category">${product.category}</div>
                    </div>
                </td>
                ${businessType === 'fisico' ? `
                <td>
                    <span class="stock-badge ${stockStatus}">${product.stock}</span>
                </td>
                <td>${product.minStock || 10}</td>
                <td>${location}</td>
                <td>${lastMovement}</td>
                ` : `
                <td>
                    <span class="status-badge ${product.stock === 0 ? 'available' : 'credit'}">
                        ${product.stock === 0 ? 'Disponible' : 'En Crédito'}
                    </span>
                </td>
                <td>$${product.regularPrice.toLocaleString()}</td>
                <td>
                    <span class="availability-badge ${product.stock === 0 ? 'available' : 'credit'}">
                        ${product.stock === 0 ? 'Inmediata' : 'Por Acordar'}
                    </span>
                </td>
                <td>${lastUpdate}</td>
                `}
                <td>
                    <div class="inventory-actions">
                        <button class="btn btn-sm btn-primary" onclick="adjustProductStock(${product.id})" title="${businessType === 'fisico' ? 'Ajustar Stock' : 'Gestionar Producto'}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="viewProductHistory(${product.id})" title="Ver Historial">
                            <i class="fas fa-history"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
    
    function createInventoryMovements() {
        return `
            <div class="inventory-movements">
                <div class="movements-controls">
                    <div class="filter-group">
                        <label>Tipo de Movimiento</label>
                        <select class="filter-select" id="movementType">
                            <option value="">Todos</option>
                            <option value="entrada">Entrada</option>
                            <option value="salida">Salida</option>
                            <option value="ajuste">Ajuste</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Fecha Desde</label>
                        <input type="date" class="filter-input" id="dateFrom">
                    </div>
                    <div class="filter-group">
                        <label>Fecha Hasta</label>
                        <input type="date" class="filter-input" id="dateTo">
                    </div>
                    <button class="btn btn-primary" onclick="filterMovements()">
                        <i class="fas fa-search"></i>
                        Filtrar
                    </button>
                </div>
                
                <div class="movements-list">
                    ${inventoryMovements.length === 0 ? `
                        <div class="empty-state">
                            <i class="fas fa-exchange-alt"></i>
                            <h4>Historial de Movimientos</h4>
                            <p>Los movimientos de inventario se mostrarán aquí.</p>
                        </div>
                    ` : `
                        ${inventoryMovements.map(movement => createMovementItem(movement)).join('')}
                    `}
                </div>
            </div>
        `;
    }
    
    function createInventoryLocations() {
        return `
            <div class="inventory-locations">
                <div class="locations-header">
                    <h4>Gestión de Ubicaciones</h4>
                    <button class="btn btn-primary" onclick="addNewLocation()">
                        <i class="fas fa-plus"></i>
                        Nueva Ubicación
                    </button>
                </div>
                
                <div class="locations-grid">
                    ${inventoryLocations.map(location => createLocationCard(location)).join('')}
                </div>
            </div>
        `;
    }
    
    function createLocationCard(location) {
        const occupancyPercentage = (location.occupied / location.capacity) * 100;
        const statusClass = location.status === 'active' ? 'active' : 'inactive';
        const statusText = location.status === 'active' ? 'Activo' : 'Inactivo';
        
        return `
            <div class="location-card">
                <div class="location-header">
                    <h5>${location.name}</h5>
                    <span class="location-status ${statusClass}">${statusText}</span>
                </div>
                <div class="location-info">
                    <p><strong>Capacidad:</strong> ${location.capacity} productos</p>
                    <p><strong>Ocupado:</strong> ${location.occupied} productos</p>
                    <p><strong>Descripción:</strong> ${location.description}</p>
                    <div class="occupancy-bar">
                        <div class="occupancy-fill" style="width: ${occupancyPercentage}%"></div>
                    </div>
                    <p class="occupancy-text">${occupancyPercentage.toFixed(1)}% ocupado</p>
                </div>
                <div class="location-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editLocation(${location.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteLocation(${location.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    function editLocation(locationId) {
        const location = inventoryLocations.find(loc => loc.id === locationId);
        if (!location) return;
        
        const editLocationHTML = createEditLocationModal(location);
        createPersistentModal(`Editar Ubicación - ${location.name}`, editLocationHTML, 'medium');
    }
    
    function createEditLocationModal(location) {
        return `
            <div class="edit-location-container">
                <div class="edit-location-form">
                    <div class="form-group">
                        <label>Nombre de la Ubicación</label>
                        <input type="text" class="form-control" id="editLocationName" value="${location.name}">
                    </div>
                    
                    <div class="form-group">
                        <label>Descripción</label>
                        <input type="text" class="form-control" id="editLocationDescription" value="${location.description}">
                    </div>
                    
                    <div class="form-group">
                        <label>Capacidad Máxima</label>
                        <input type="number" class="form-control" id="editLocationCapacity" value="${location.capacity}" min="1">
                    </div>
                    
                    <div class="form-group">
                        <label>Estado</label>
                        <select class="form-control" id="editLocationStatus">
                            <option value="active" ${location.status === 'active' ? 'selected' : ''}>Activo</option>
                            <option value="inactive" ${location.status === 'inactive' ? 'selected' : ''}>Inactivo</option>
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <button class="btn btn-secondary" onclick="closeInventoryModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="updateLocation(${location.id})">
                            <i class="fas fa-save"></i>
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function updateLocation(locationId) {
        const name = document.getElementById('editLocationName').value.trim();
        const description = document.getElementById('editLocationDescription').value.trim();
        const capacity = parseInt(document.getElementById('editLocationCapacity').value);
        const status = document.getElementById('editLocationStatus').value;
        
        if (!name || !capacity) {
            window.dashboard.showToast('Por favor completa todos los campos requeridos', 'error');
            return;
        }
        
        const location = inventoryLocations.find(loc => loc.id === locationId);
        if (!location) {
            window.dashboard.showToast('Ubicación no encontrada', 'error');
            return;
        }
        
        // Verificar que no exista otra ubicación con el mismo nombre
        if (inventoryLocations.some(loc => loc.id !== locationId && loc.name.toLowerCase() === name.toLowerCase())) {
            window.dashboard.showToast('Ya existe una ubicación con ese nombre', 'error');
            return;
        }
        
        // Actualizar ubicación
        location.name = name;
        location.description = description;
        location.capacity = capacity;
        location.status = status;
        
        // Actualizar productos que usan esta ubicación
        products.forEach(product => {
            if (product.location === location.name) {
                product.location = name;
            }
        });
        
        saveInventoryLocations();
        saveProducts();
        calculateLocationOccupation();
        
        closeInventoryModal();
        showInventoryModal();
        
        window.dashboard.showToast('Ubicación actualizada exitosamente', 'success');
    }
    
    function deleteLocation(locationId) {
        const location = inventoryLocations.find(loc => loc.id === locationId);
        if (!location) return;
        
        // Verificar si hay productos en esta ubicación
        const productsInLocation = products.filter(p => p.location === location.name);
        if (productsInLocation.length > 0) {
            window.dashboard.showToast(`No se puede eliminar la ubicación. Hay ${productsInLocation.length} productos asignados a esta ubicación.`, 'error');
            return;
        }
        
        if (confirm(`¿Estás seguro de que quieres eliminar la ubicación "${location.name}"?`)) {
            inventoryLocations = inventoryLocations.filter(loc => loc.id !== locationId);
            saveInventoryLocations();
            
            closeInventoryModal();
            showInventoryModal();
            
            window.dashboard.showToast('Ubicación eliminada exitosamente', 'success');
        }
    }
    
    function switchInventoryTab(tabName) {
        // Ocultar todas las pestañas
        document.querySelectorAll('.inventory-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Desactivar todos los botones
        document.querySelectorAll('.inventory-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Mostrar la pestaña seleccionada
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Activar el botón correspondiente
        document.querySelector(`[onclick="switchInventoryTab('${tabName}')"]`).classList.add('active');
    }
    
    function showAdjustStockModal() {
        const adjustStockHTML = createAdjustStockModal();
        createPersistentModal('Ajuste de Stock', adjustStockHTML, 'medium');
    }
    
    function createAdjustStockModal() {
        return `
            <div class="adjust-stock-container">
                <div class="adjust-stock-form">
                    <div class="form-group">
                        <label>Producto</label>
                        <select class="form-control" id="adjustProductSelect">
                            <option value="">Seleccionar producto...</option>
                            ${products.map(product => `
                                <option value="${product.id}">${product.name} - Stock: ${product.stock}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Tipo de Movimiento</label>
                        <select class="form-control" id="movementType">
                            <option value="entrada">Entrada (+)</option>
                            <option value="salida">Salida (-)</option>
                            <option value="ajuste">Ajuste (=)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Cantidad</label>
                        <input type="number" class="form-control" id="movementQuantity" min="1" placeholder="Cantidad">
                    </div>
                    
                    <div class="form-group">
                        <label>Ubicación</label>
                        <select class="form-control" id="movementLocation">
                            <option value="">Sin ubicación</option>
                            ${inventoryLocations.map(location => `
                                <option value="${location.name}">${location.name} - ${location.description}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Motivo/Notas</label>
                        <textarea class="form-control" id="movementNotes" rows="3" placeholder="Motivo del movimiento..."></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button class="btn btn-secondary" onclick="closeInventoryModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="processStockAdjustment()">
                            <i class="fas fa-check"></i>
                            Procesar Movimiento
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function adjustProductStock(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        const adjustStockHTML = createSingleProductAdjustModal(product);
        createPersistentModal(`Ajustar Stock - ${product.name}`, adjustStockHTML, 'medium');
    }
    
    function createSingleProductAdjustModal(product) {
        return `
            <div class="adjust-stock-container">
                <div class="product-info-header">
                    <h4>${product.name}</h4>
                    <p class="product-category">${product.category}</p>
                    <div class="current-stock">
                        <span class="stock-label">Stock Actual:</span>
                        <span class="stock-value">${product.stock}</span>
                    </div>
                </div>
                
                <div class="adjust-stock-form">
                    <div class="form-group">
                        <label>Tipo de Movimiento</label>
                        <select class="form-control" id="movementType">
                            <option value="entrada">Entrada (+)</option>
                            <option value="salida">Salida (-)</option>
                            <option value="ajuste">Ajuste (=)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Cantidad</label>
                        <input type="number" class="form-control" id="movementQuantity" min="1" placeholder="Cantidad">
                    </div>
                    
                    <div class="form-group">
                        <label>Ubicación</label>
                        <select class="form-control" id="movementLocation">
                            <option value="">Sin ubicación</option>
                            ${inventoryLocations.map(location => `
                                <option value="${location.name}" ${product.location === location.name ? 'selected' : ''}>${location.name} - ${location.description}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Motivo/Notas</label>
                        <textarea class="form-control" id="movementNotes" rows="3" placeholder="Motivo del movimiento..."></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button class="btn btn-secondary" onclick="closeInventoryModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="processSingleStockAdjustment(${product.id})">
                            <i class="fas fa-check"></i>
                            Procesar Movimiento
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function processStockAdjustment() {
        const productId = document.getElementById('adjustProductSelect').value;
        const movementType = document.getElementById('movementType').value;
        const quantity = parseInt(document.getElementById('movementQuantity').value);
        const location = document.getElementById('movementLocation').value;
        const notes = document.getElementById('movementNotes').value;
        
        if (!productId || !quantity) {
            window.dashboard.showToast('Por favor completa todos los campos requeridos', 'error');
            return;
        }
        
        const product = products.find(p => p.id == productId);
        if (!product) {
            window.dashboard.showToast('Producto no encontrado', 'error');
            return;
        }
        
        processMovement(product, movementType, quantity, location, notes);
    }
    
    function processSingleStockAdjustment(productId) {
        const movementType = document.getElementById('movementType').value;
        const quantity = parseInt(document.getElementById('movementQuantity').value);
        const location = document.getElementById('movementLocation').value;
        const notes = document.getElementById('movementNotes').value;
        
        if (!quantity) {
            window.dashboard.showToast('Por favor ingresa una cantidad válida', 'error');
            return;
        }
        
        const product = products.find(p => p.id == productId);
        if (!product) {
            window.dashboard.showToast('Producto no encontrado', 'error');
            return;
        }
        
        processMovement(product, movementType, quantity, location, notes);
    }
    
    function processMovement(product, movementType, quantity, location, notes) {
        const oldStock = product.stock;
        let newStock = oldStock;
        
        switch (movementType) {
            case 'entrada':
                newStock = oldStock + quantity;
                break;
            case 'salida':
                newStock = Math.max(0, oldStock - quantity);
                break;
            case 'ajuste':
                newStock = quantity;
                break;
        }
        
        // Actualizar producto
        product.stock = newStock;
        product.location = location;
        product.lastMovement = new Date().toLocaleString();
        product.lastUpdate = new Date().toISOString();
        
        // Crear movimiento
        const movement = {
            id: Date.now(),
            productId: product.id,
            productName: product.name,
            movementType: movementType,
            quantity: quantity,
            oldStock: oldStock,
            newStock: newStock,
            location: location,
            notes: notes,
            timestamp: new Date().toISOString(),
            user: 'Usuario Actual' // En un sistema real sería el usuario logueado
        };
        
        inventoryMovements.unshift(movement);
        
        // Guardar cambios
        saveProducts();
        saveInventoryMovements();
        calculateLocationOccupation();
        
        // Cerrar modal y actualizar vista
        closeInventoryModal();
        showInventoryModal();
        
        window.dashboard.showToast(`Stock actualizado: ${oldStock} → ${newStock}`, 'success');
    }
    
    function viewProductHistory(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        const productMovements = inventoryMovements.filter(m => m.productId === productId);
        const historyHTML = createProductHistoryModal(product, productMovements);
        createPersistentModal(`Historial - ${product.name}`, historyHTML, 'large');
    }
    
    function createProductHistoryModal(product, movements) {
        return `
            <div class="product-history-container">
                <div class="product-info-header">
                    <h4>${product.name}</h4>
                    <p class="product-category">${product.category}</p>
                    <div class="current-stock">
                        <span class="stock-label">Stock Actual:</span>
                        <span class="stock-value">${product.stock}</span>
                    </div>
                </div>
                
                <div class="movements-history">
                    <h5>Historial de Movimientos</h5>
                    ${movements.length === 0 ? `
                        <div class="empty-state">
                            <i class="fas fa-history"></i>
                            <p>No hay movimientos registrados para este producto</p>
                        </div>
                    ` : `
                        <div class="movements-list">
                            ${movements.map(movement => createMovementItem(movement)).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    }
    
    function createMovementItem(movement) {
        const movementTypeLabels = {
            'entrada': 'Entrada',
            'salida': 'Salida',
            'ajuste': 'Ajuste'
        };
        
        const movementTypeColors = {
            'entrada': 'success',
            'salida': 'danger',
            'ajuste': 'warning'
        };
        
        const date = new Date(movement.timestamp).toLocaleString();
        
        return `
            <div class="movement-item">
                <div class="movement-header">
                    <div class="movement-type">
                        <span class="movement-badge ${movementTypeColors[movement.movementType]}">
                            ${movementTypeLabels[movement.movementType]}
                        </span>
                    </div>
                    <div class="movement-date">${date}</div>
                </div>
                
                <div class="movement-details">
                    <div class="movement-quantity">
                        <span class="quantity-label">Cantidad:</span>
                        <span class="quantity-value">${movement.quantity}</span>
                    </div>
                    
                    <div class="movement-stock">
                        <span class="stock-change">
                            ${movement.oldStock} → ${movement.newStock}
                        </span>
                    </div>
                    
                    ${movement.location ? `
                        <div class="movement-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${movement.location}
                        </div>
                    ` : ''}
                    
                    ${movement.notes ? `
                        <div class="movement-notes">
                            <i class="fas fa-sticky-note"></i>
                            ${movement.notes}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    function filterMovements() {
        const movementType = document.getElementById('movementType').value;
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        
        let filteredMovements = [...inventoryMovements];
        
        // Filtrar por tipo
        if (movementType) {
            filteredMovements = filteredMovements.filter(m => m.movementType === movementType);
        }
        
        // Filtrar por fechas
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            filteredMovements = filteredMovements.filter(m => new Date(m.timestamp) >= fromDate);
        }
        
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filteredMovements = filteredMovements.filter(m => new Date(m.timestamp) <= toDate);
        }
        
        // Actualizar la vista de movimientos
        updateMovementsView(filteredMovements);
    }
    
    function updateMovementsView(movements) {
        const movementsList = document.querySelector('.movements-list');
        if (!movementsList) return;
        
        if (movements.length === 0) {
            movementsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h4>No se encontraron movimientos</h4>
                    <p>No hay movimientos que coincidan con los filtros aplicados</p>
                </div>
            `;
        } else {
            movementsList.innerHTML = movements.map(movement => createMovementItem(movement)).join('');
        }
    }
    
    function addNewLocation() {
        const newLocationHTML = createNewLocationModal();
        createPersistentModal('Nueva Ubicación', newLocationHTML, 'medium');
    }
    
    function createNewLocationModal() {
        return `
            <div class="new-location-container">
                <div class="new-location-form">
                    <div class="form-group">
                        <label>Nombre de la Ubicación</label>
                        <input type="text" class="form-control" id="locationName" placeholder="Ej: Estante B-1">
                    </div>
                    
                    <div class="form-group">
                        <label>Descripción</label>
                        <input type="text" class="form-control" id="locationDescription" placeholder="Ej: Ropa y Accesorios">
                    </div>
                    
                    <div class="form-group">
                        <label>Capacidad Máxima</label>
                        <input type="number" class="form-control" id="locationCapacity" min="1" placeholder="50">
                    </div>
                    
                    <div class="form-group">
                        <label>Estado</label>
                        <select class="form-control" id="locationStatus">
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <button class="btn btn-secondary" onclick="closeInventoryModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="saveNewLocation()">
                            <i class="fas fa-save"></i>
                            Guardar Ubicación
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function saveNewLocation() {
        const name = document.getElementById('locationName').value.trim();
        const description = document.getElementById('locationDescription').value.trim();
        const capacity = parseInt(document.getElementById('locationCapacity').value);
        const status = document.getElementById('locationStatus').value;
        
        if (!name || !capacity) {
            window.dashboard.showToast('Por favor completa todos los campos requeridos', 'error');
            return;
        }
        
        // Verificar que no exista una ubicación con el mismo nombre
        if (inventoryLocations.some(loc => loc.name.toLowerCase() === name.toLowerCase())) {
            window.dashboard.showToast('Ya existe una ubicación con ese nombre', 'error');
            return;
        }
        
        const newLocation = {
            id: Date.now(),
            name: name,
            description: description,
            capacity: capacity,
            occupied: 0,
            status: status,
            createdAt: new Date().toISOString()
        };
        
        inventoryLocations.push(newLocation);
        saveInventoryLocations();
        
        closeInventoryModal();
        showInventoryModal();
        
        window.dashboard.showToast('Ubicación creada exitosamente', 'success');
    }
    
    // ===================================
    // FUNCIONES PÚBLICAS
    // ===================================
    window.loadProductosModule = function() {
        console.log('Cargando módulo de productos...');
        loadProducts();
    };
    
    // Funciones globales para los botones
    window.editProduct = editProduct;
    window.deleteProduct = deleteProduct;
    window.confirmDeleteProduct = confirmDeleteProduct;
    
    // Funciones globales para inventario
    window.closeInventoryModal = closeInventoryModal;
    window.switchInventoryTab = switchInventoryTab;
    window.showAdjustStockModal = showAdjustStockModal;
    window.adjustProductStock = adjustProductStock;
    window.viewProductHistory = viewProductHistory;
    window.filterMovements = filterMovements;
    window.addNewLocation = addNewLocation;
    window.processStockAdjustment = processStockAdjustment;
    window.processSingleStockAdjustment = processSingleStockAdjustment;
    window.saveNewLocation = saveNewLocation;
    window.editLocation = editLocation;
    window.updateLocation = updateLocation;
    window.deleteLocation = deleteLocation;
    window.showNewProductForm = showNewProductForm;
    window.toggleAdvancedFilters = toggleAdvancedFilters;
    window.clearFilters = clearFilters;
    window.applyFilters = applyFilters;
    window.sortProducts = sortProducts;
    window.goToPage = goToPage;
    window.changeItemsPerPage = changeItemsPerPage;
    window.toggleSelectAll = toggleSelectAll;
    window.toggleProductSelection = toggleProductSelection;
    window.bulkAction = bulkAction;
    window.confirmBulkDelete = confirmBulkDelete;
    
    // Funciones del sistema de chips
    window.openChipSelector = openChipSelector;
    window.closeChipSelector = closeChipSelector;
    window.toggleChipSelection = toggleChipSelection;
    window.applyChipSelection = applyChipSelection;
    window.removeChip = removeChip;
    window.filterChipItems = filterChipItems;
    window.updateApplyButtonCount = updateApplyButtonCount;
    window.loadCategoriesAndSubcategories = loadCategoriesAndSubcategories;
    window.closeModal = closeModal;
    
    // ===================================
    // FUNCIONES DE CRÉDITO
    // ===================================
    
    function setupCreditoOptions() {
        const creditoEnabled = document.getElementById('creditoEnabled');
        const creditoOptions = document.getElementById('creditoOptions');
        const creditoCuotas = document.getElementById('creditoCuotas');
        const creditoPreview = document.getElementById('creditoPreview');
        const cuotaValue = document.getElementById('cuotaValue');
        const regularPriceInput = document.getElementById('productRegularPrice');
        
        if (!creditoEnabled || !creditoOptions) return;
        
        // Toggle de crédito
        creditoEnabled.addEventListener('change', function() {
            if (this.checked) {
                creditoOptions.style.display = 'block';
                updateCreditoPreview();
            } else {
                creditoOptions.style.display = 'none';
                creditoPreview.style.display = 'none';
            }
        });
        
        // Cambio de cuotas
        if (creditoCuotas) {
            creditoCuotas.addEventListener('change', updateCreditoPreview);
        }
        
        // Cambio de precio
        if (regularPriceInput) {
            regularPriceInput.addEventListener('input', updateCreditoPreview);
        }
        
        function updateCreditoPreview() {
            if (!creditoEnabled.checked) return;
            
            const precio = parseFloat(regularPriceInput?.value || 0);
            const cuotas = parseInt(creditoCuotas?.value || 2);
            
            if (precio > 0 && cuotas > 0) {
                const montoPorCuota = precio / cuotas;
                cuotaValue.textContent = `$${montoPorCuota.toFixed(2)}`;
                creditoPreview.style.display = 'block';
            } else {
                creditoPreview.style.display = 'none';
            }
        }
    }
    
    // ===================================
    // INICIALIZACIÓN
    // ===================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();