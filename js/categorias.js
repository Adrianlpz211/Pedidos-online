/* ===================================
   MÓDULO CATEGORÍAS - JAVASCRIPT
   =================================== */

(function() {
    'use strict';
    
    console.log('Módulo Categorías cargado');
    
    // Variables del módulo
    let categorias = [];
    let subcategorias = [];
    let currentCategoria = null;
    let currentSubcategoria = null;
    let isEditingCategoria = false;
    let isEditingSubcategoria = false;
    
    // Elementos del DOM
    const categoriasContent = document.getElementById('categoriasContent');
    const btnNuevaCategoria = document.getElementById('btnNuevaCategoria');
    const btnNuevaSubcategoria = document.getElementById('btnNuevaSubcategoria');
    
    // ===================================
    // INICIALIZACIÓN
    // ===================================
    function init() {
        setupEventListeners();
        loadCategorias();
        loadSubcategorias();
        console.log('Módulo Categorías inicializado');
    }
    
    // ===================================
    // EVENT LISTENERS
    // ===================================
    function setupEventListeners() {
        if (btnNuevaCategoria) {
            btnNuevaCategoria.addEventListener('click', showNewCategoriaForm);
        }
        
        if (btnNuevaSubcategoria) {
            btnNuevaSubcategoria.addEventListener('click', showNewSubcategoriaForm);
        }
    }
    
    // ===================================
    // CARGA DE DATOS
    // ===================================
    function loadCategorias() {
        console.log('Cargando categorías...');
        
        const savedCategorias = localStorage.getItem('dashboardCategorias');
        if (savedCategorias) {
            try {
                categorias = JSON.parse(savedCategorias);
                console.log('Categorías cargadas desde localStorage:', categorias);
            } catch (error) {
                console.error('Error al cargar categorías:', error);
                categorias = [];
            }
        } else {
            // Datos de ejemplo
            categorias = getSampleCategorias();
            console.log('Categorías de ejemplo creadas:', categorias);
            saveCategorias();
        }
        
        // CORRECCIÓN: Validar que las categorías tengan la estructura correcta
        categorias = categorias.filter(cat => cat && cat.id && cat.name);
        console.log('Categorías validadas:', categorias);
        
        renderCategorias();
    }
    
    function loadSubcategorias() {
        console.log('Cargando subcategorías...');
        
        const savedSubcategorias = localStorage.getItem('dashboardSubcategorias');
        if (savedSubcategorias) {
            try {
                subcategorias = JSON.parse(savedSubcategorias);
                console.log('Subcategorías cargadas desde localStorage:', subcategorias);
            } catch (error) {
                console.error('Error al cargar subcategorías:', error);
                subcategorias = [];
            }
        } else {
            // Datos de ejemplo
            subcategorias = getSampleSubcategorias();
            console.log('Subcategorías de ejemplo creadas:', subcategorias);
            saveSubcategorias();
        }
        
        // CORRECCIÓN: Validar que las subcategorías tengan la estructura correcta
        subcategorias = subcategorias.filter(sub => sub && sub.id && sub.name);
        console.log('Subcategorías validadas:', subcategorias);
        
        renderSubcategorias();
    }
    
    function getSampleCategorias() {
        return [
            {
                id: 1,
                name: 'Electrodomésticos',
                createdAt: new Date().toISOString(),
                productCount: 5
            },
            {
                id: 2,
                name: 'Tecnología',
                createdAt: new Date().toISOString(),
                productCount: 3
            },
            {
                id: 3,
                name: 'Ropa',
                createdAt: new Date().toISOString(),
                productCount: 2
            }
        ];
    }
    
    function getSampleSubcategorias() {
        return [
            {
                id: 1,
                name: 'Cocina',
                description: 'Electrodomésticos para la cocina',
                categoriaIds: [1], // Relación con Electrodomésticos
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Limpieza',
                description: 'Productos de limpieza para el hogar',
                categoriaIds: [1], // Relación con Electrodomésticos
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Móviles',
                description: 'Teléfonos inteligentes y accesorios',
                categoriaIds: [2], // Relación con Tecnología
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                name: 'Computadoras',
                description: 'Laptops, PCs y accesorios',
                categoriaIds: [2], // Relación con Tecnología
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                name: 'Accesorios',
                description: 'Accesorios para tecnología',
                categoriaIds: [2], // Relación con Tecnología
                createdAt: new Date().toISOString()
            },
            {
                id: 6,
                name: 'Decoración',
                description: 'Elementos decorativos para el hogar',
                categoriaIds: [3], // Relación con Hogar
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                name: 'Calzado',
                description: 'Zapatos y calzado deportivo',
                categoriaIds: [3], // Relación con Ropa
                createdAt: new Date().toISOString()
            },
            {
                id: 6,
                name: 'Accesorios',
                description: 'Accesorios de moda y tecnología',
                categoriaIds: [2, 3], // Relación con Tecnología y Ropa
                createdAt: new Date().toISOString()
            }
        ];
    }
    
    function saveCategorias() {
        try {
            localStorage.setItem('dashboardCategorias', JSON.stringify(categorias));
            console.log('Categorías guardadas');
        } catch (error) {
            console.error('Error al guardar categorías:', error);
        }
    }
    
    function saveSubcategorias() {
        try {
            localStorage.setItem('dashboardSubcategorias', JSON.stringify(subcategorias));
            console.log('Subcategorías guardadas');
        } catch (error) {
            console.error('Error al guardar subcategorías:', error);
        }
    }
    
    // ===================================
    // RENDERIZADO
    // ===================================
    function renderCategorias() {
        if (!categoriasContent) return;
        
        const categoriasHTML = `
            <div class="categorias-tabs">
                <div class="tabs-header">
                    <button class="tab-button active" data-tab="categorias">
                        <i class="fas fa-tags"></i>
                        Categorías (${categorias.length})
                    </button>
                    <button class="tab-button" data-tab="subcategorias">
                        <i class="fas fa-list"></i>
                        Subcategorías (${subcategorias.length})
                    </button>
                </div>
                
                <div class="tabs-content">
                    <div class="tab-panel active" id="categorias-tab">
                        <div class="tab-header">
                            <h3 class="tab-title">Categorías</h3>
                            <button class="btn btn-primary" onclick="showNewCategoriaForm()">
                                <i class="fas fa-plus"></i>
                                Agregar
                            </button>
                        </div>
                        <div class="categorias-list" id="categoriasList">
                            ${categorias.map(categoria => createCategoriaCard(categoria)).join('')}
                        </div>
                    </div>
                    
                    <div class="tab-panel" id="subcategorias-tab">
                        <div class="tab-header">
                            <h3 class="tab-title">Subcategorías</h3>
                            <button class="btn btn-primary" onclick="showNewSubcategoriaForm()">
                                <i class="fas fa-plus"></i>
                                Agregar
                            </button>
                        </div>
                        <div class="subcategorias-list" id="subcategoriasList">
                            ${subcategorias.map(subcategoria => createSubcategoriaCard(subcategoria)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        categoriasContent.innerHTML = categoriasHTML;
        
        // Agregar event listeners
        setupTabsListeners();
        addCategoriaCardListeners();
        addSubcategoriaCardListeners();
    }
    
    function createCategoriaCard(categoria) {
        // CORRECCIÓN: Validar que la categoría tenga los datos necesarios
        if (!categoria || !categoria.id) {
            console.error('Categoría inválida:', categoria);
            return '';
        }
        
        const subcategoriasRelacionadas = subcategorias.filter(sub => 
            sub.categoriaIds && sub.categoriaIds.includes(categoria.id)
        );
        
        return `
            <div class="categoria-item" data-categoria-id="${categoria.id}">
                <div class="categoria-header">
                    <h4 class="categoria-name">${categoria.name || 'Sin nombre'}</h4>
                    <div class="categoria-actions">
                        <button class="btn btn-primary btn-sm" onclick="editCategoria(${categoria.id})">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteCategoria(${categoria.id})">
                            <i class="fas fa-trash"></i>
                            Eliminar
                        </button>
                    </div>
                </div>
                <div class="categoria-info">
                    <span class="categoria-count">${categoria.productCount || 0} productos</span>
                    <span class="categoria-date">${formatDate(categoria.createdAt)}</span>
                </div>
                
                <div class="subcategorias-container">
                    <button class="subcategorias-accordion-toggle" onclick="toggleSubcategorias(${categoria.id})" aria-expanded="false" aria-controls="subcats-${categoria.id}">
                        <div class="subcategorias-title">
                            <i class="fas fa-list"></i>
                            Subcategorías (${subcategoriasRelacionadas.length})
                        </div>
                        <i id="subcats-toggle-icon-${categoria.id}" class="fas fa-chevron-down"></i>
                    </button>
                    <div id="subcats-${categoria.id}" class="subcategorias-accordion-body">
                        <ul class="subcategorias-list">
                            ${subcategoriasRelacionadas.map(sub => `
                                <li class="subcategoria-item">
                                    <span class="subcategoria-name">${sub.name}</span>
                                    <div class="subcategoria-actions">
                                        <button class="btn btn-secondary btn-sm" onclick="editSubcategoria(${sub.id})">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-danger btn-sm" onclick="removeSubcategoriaFromCategoria(${categoria.id}, ${sub.id})">
                                            <i class="fas fa-unlink"></i>
                                        </button>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
    
    function createSubcategoriaCard(subcategoria) {
        const categoriasRelacionadas = categorias.filter(cat => 
            subcategoria.categoriaIds.includes(cat.id)
        );
        
        return `
            <div class="subcategoria-item" data-subcategoria-id="${subcategoria.id}">
                <div>
                    <div class="subcategoria-name">${subcategoria.name}</div>
                    <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
                        Categorías: ${categoriasRelacionadas.map(cat => cat.name).join(', ')}
                    </div>
                </div>
                <div class="subcategoria-actions">
                    <button class="btn btn-primary btn-sm" onclick="editSubcategoria(${subcategoria.id})">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSubcategoria(${subcategoria.id})">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }
    
    function renderSubcategorias() {
        // Esta función se llama desde renderCategorias
    }
    
    
    // ===================================
    // MODAL FUNCTIONS
    // ===================================
    function createModal(title, content, size = 'medium') {
        console.log('🚀 createModal iniciado:', title);
        
        // Remover modal existente si existe
        const existingModal = document.getElementById('categoriaModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Crear overlay con estilos inline para garantizar visibilidad
        const overlay = document.createElement('div');
        overlay.id = 'categoriaModal';
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
            background: rgb(48, 48, 48) !important;
            border-radius: 8px !important;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
            max-width: ${size === 'large' ? '800px' : '600px'} !important;
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
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #555; background: rgb(60, 60, 60); border-radius: 8px 8px 0 0;">
                <h3 style="font-size: 18px; font-weight: 600; color: #ffffff; margin: 0;">${title}</h3>
                <button onclick="closeCategoriaModal()" style="background: none; border: none; font-size: 18px; color: #cccccc; cursor: pointer; padding: 5px; border-radius: 8px; transition: all 0.3s ease;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="padding: 20px; background: rgb(48, 48, 48);">
                ${content}
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Agregar listener para cerrar al hacer clic en el overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeCategoriaModal();
            }
        });
        
        // Agregar hover effects al botón de cerrar
        const closeBtn = modal.querySelector('button');
        if (closeBtn) {
            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.backgroundColor = 'rgb(60, 60, 60)';
                closeBtn.style.color = '#ffffff';
            });
            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.backgroundColor = 'transparent';
                closeBtn.style.color = '#cccccc';
            });
        }
        
        console.log('✅ Modal de categoría creado y mostrado correctamente');
    }
    
    function closeCategoriaModal() {
        const modal = document.getElementById('categoriaModal');
        if (modal) {
            modal.remove();
            console.log('Modal de categoría cerrado');
        }
    }
    
    // showToast ahora se usa directamente desde window.dashboard.showToast

    // ===================================
    // FORMULARIOS
    // ===================================
    function showNewCategoriaForm() {
        isEditingCategoria = false;
        currentCategoria = null;
        showCategoriaForm();
    }
    
    function showCategoriaForm() {
        const formHTML = createCategoriaForm();
        
        createModal(
            isEditingCategoria ? 'Editar Categoría' : 'Nueva Categoría',
            formHTML,
            'medium'
        );
        
        setupCategoriaFormListeners();
    }
    
    function createCategoriaForm() {
        const categoria = currentCategoria || {
            name: '',
            description: ''
        };
        
        return `
            <form id="categoriaForm" class="categoria-form">
                <div class="form-section-categoria">
                    <h4 class="form-section-title-categoria">Información de la Categoría</h4>
                    
                    <div class="form-group-categoria">
                        <label for="categoriaName" class="form-label-categoria">Nombre de la Categoría *</label>
                        <input type="text" id="categoriaName" name="name" class="form-control-categoria" 
                               value="${categoria.name}" required>
                    </div>
                    
                    <div class="form-group-categoria">
                        <label for="categoriaDescription" class="form-label-categoria">Descripción</label>
                        <textarea id="categoriaDescription" name="description" class="form-control-categoria" 
                                  rows="3">${categoria.description}</textarea>
                    </div>
                </div>
                
                <div class="form-section-categoria">
                    <div class="categoria-subcats-accordion-header">
                        <h4 class="form-section-title-categoria" style="margin: 0;">Asignar Subcategorías</h4>
                        <button type="button" id="subcatsAccordionToggle" class="categoria-subcats-accordion-toggle" aria-expanded="false">
                            <span>Mostrar</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    </div>
                    <div id="categoriaSubcatsAccordion" class="categoria-subcats-accordion-body">
                        <div class="categoria-subcats-toolbar">
                            <input type="text" id="categoriaSubcatsSearch" class="form-control-categoria" placeholder="Buscar subcategorías...">
                        </div>
                        <div id="categoriaSubcatsGrid" class="categoria-subcats-grid">
                            ${subcategorias.map(sub => {
                                const checked = currentCategoria && Array.isArray(sub.categoriaIds) && sub.categoriaIds.includes(currentCategoria.id) ? 'checked' : '';
                                const safeName = (sub.name || '').replace(/"/g, '&quot;');
                                return `
                                    <label class=\"categoria-subcat-item\" data-subcat-name=\"${safeName.toLowerCase()}\">
                                        <input type=\"checkbox\" name=\"subcategoriaIds\" value=\"${sub.id}\" ${checked}>
                                        <span>${sub.name}</span>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="form-actions-categoria">
                    <button type="button" class="btn btn-secondary" onclick="closeCategoriaModal()">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${isEditingCategoria ? 'Actualizar' : 'Crear'} Categoría
                    </button>
                </div>
            </form>
        `;
    }
    
    function setupCategoriaFormListeners() {
        const categoriaForm = document.getElementById('categoriaForm');
        if (categoriaForm) {
            categoriaForm.addEventListener('submit', handleCategoriaSubmit);
        }
        // Acordeón subcategorías
        const accordionBody = document.getElementById('categoriaSubcatsAccordion');
        const accordionToggle = document.getElementById('subcatsAccordionToggle');
        if (accordionBody && accordionToggle) {
            // colapsado por defecto
            accordionBody.style.maxHeight = '0px';
            accordionToggle.addEventListener('click', () => {
                const isOpen = accordionBody.classList.contains('open');
                if (isOpen) {
                    accordionBody.style.maxHeight = '0px';
                    accordionBody.classList.remove('open');
                    accordionToggle.setAttribute('aria-expanded', 'false');
                    const tSpan = accordionToggle.querySelector('span');
                    const tIcon = accordionToggle.querySelector('i');
                    if (tSpan) tSpan.textContent = 'Mostrar';
                    if (tIcon) tIcon.classList.remove('rotated');
                } else {
                    accordionBody.classList.add('open');
                    accordionBody.style.maxHeight = accordionBody.scrollHeight + 'px';
                    accordionToggle.setAttribute('aria-expanded', 'true');
                    const tSpan = accordionToggle.querySelector('span');
                    const tIcon = accordionToggle.querySelector('i');
                    if (tSpan) tSpan.textContent = 'Ocultar';
                    if (tIcon) tIcon.classList.add('rotated');
                }
            });
            // Ajustar altura al contenido (por si cambia por búsqueda)
            if (window.ResizeObserver) {
                const resizeObserver = new ResizeObserver(() => {
                    if (accordionBody.classList.contains('open')) {
                        accordionBody.style.maxHeight = accordionBody.scrollHeight + 'px';
                    }
                });
                resizeObserver.observe(accordionBody);
            }
        }
        // Buscador de subcategorías
        const searchInput = document.getElementById('categoriaSubcatsSearch');
        const grid = document.getElementById('categoriaSubcatsGrid');
        if (searchInput && grid) {
            searchInput.addEventListener('input', () => {
                const term = searchInput.value.trim().toLowerCase();
                const items = grid.querySelectorAll('.categoria-subcat-item');
                let visibleCount = 0;
                items.forEach(item => {
                    const name = item.getAttribute('data-subcat-name') || '';
                    const show = !term || name.includes(term);
                    item.style.display = show ? 'flex' : 'none';
                    if (show) visibleCount++;
                });
                grid.setAttribute('data-visible-count', String(visibleCount));
                // reajustar altura si está abierto
                if (accordionBody && accordionBody.classList.contains('open')) {
                    accordionBody.style.maxHeight = accordionBody.scrollHeight + 'px';
                }
            });
        }
    }
    
    function handleCategoriaSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const categoriaData = {
            name: formData.get('name'),
            description: formData.get('description')
        };
        const selectedSubcategoriaIds = formData.getAll('subcategoriaIds').map(id => parseInt(id));
        
        // Validaciones
        if (!categoriaData.name) {
            window.dashboard.window.dashboard.showToast('El nombre de la categoría es obligatorio', 'error');
            return;
        }
        
        // Verificar si ya existe una categoría con el mismo nombre
        const existingCategoria = categorias.find(cat => 
            cat.name.toLowerCase() === categoriaData.name.toLowerCase() && 
            cat.id !== currentCategoria?.id
        );
        
        if (existingCategoria) {
            window.dashboard.window.dashboard.showToast('Ya existe una categoría con ese nombre', 'error');
            return;
        }
        
        if (isEditingCategoria) {
            updateCategoria(currentCategoria.id, categoriaData, selectedSubcategoriaIds);
        } else {
            createCategoria(categoriaData, selectedSubcategoriaIds);
        }
    }
    
    function showNewSubcategoriaForm() {
        isEditingSubcategoria = false;
        currentSubcategoria = null;
        showSubcategoriaForm();
    }
    
    function showSubcategoriaForm() {
        const formHTML = createSubcategoriaForm();
        
        createModal(
            isEditingSubcategoria ? 'Editar Subcategoría' : 'Nueva Subcategoría',
            formHTML,
            'large'
        );
        
        setupSubcategoriaFormListeners();
    }
    
    function createSubcategoriaForm() {
        const subcategoria = currentSubcategoria || {
            name: '',
            description: '',
            categoriaIds: []
        };
        
        return `
            <form id="subcategoriaForm" class="subcategoria-form">
                <div class="form-section-categoria">
                    <h4 class="form-section-title-categoria">Información de la Subcategoría</h4>
                    
                    <div class="form-group-categoria">
                        <label for="subcategoriaName" class="form-label-categoria">Nombre de la Subcategoría *</label>
                        <input type="text" id="subcategoriaName" name="name" class="form-control-categoria" 
                               value="${subcategoria.name}" required>
                    </div>
                    
                    <div class="form-group-categoria">
                        <label for="subcategoriaDescription" class="form-label-categoria">Descripción</label>
                        <textarea id="subcategoriaDescription" name="description" class="form-control-categoria" 
                                  rows="3">${subcategoria.description}</textarea>
                    </div>
                </div>
                
                <div class="form-section-categoria">
                    <h4 class="form-section-title-categoria">Categorías Relacionadas</h4>
                    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 15px;">
                        Selecciona las categorías a las que pertenece esta subcategoría. Una subcategoría puede pertenecer a múltiples categorías.
                    </p>
                    
                    <div class="form-group-categoria">
                        ${categorias.map(categoria => `
                            <div style="margin-bottom: 10px;">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" name="categoriaIds" value="${categoria.id}" 
                                           ${subcategoria.categoriaIds.includes(categoria.id) ? 'checked' : ''}>
                                    <span>${categoria.name}</span>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="form-actions-categoria">
                    <button type="button" class="btn btn-secondary" onclick="closeCategoriaModal()">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${isEditingSubcategoria ? 'Actualizar' : 'Crear'} Subcategoría
                    </button>
                </div>
            </form>
        `;
    }
    
    function setupSubcategoriaFormListeners() {
        const subcategoriaForm = document.getElementById('subcategoriaForm');
        if (subcategoriaForm) {
            subcategoriaForm.addEventListener('submit', handleSubcategoriaSubmit);
        }
    }
    
    function handleSubcategoriaSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const categoriaIds = formData.getAll('categoriaIds').map(id => parseInt(id));
        
        const subcategoriaData = {
            name: formData.get('name'),
            description: formData.get('description'),
            categoriaIds: categoriaIds
        };
        
        // Validaciones
        if (!subcategoriaData.name) {
            window.dashboard.showToast('El nombre de la subcategoría es obligatorio', 'error');
            return;
        }
        
        if (subcategoriaData.categoriaIds.length === 0) {
            window.dashboard.showToast('Debes seleccionar al menos una categoría', 'error');
            return;
        }
        
        // Verificar si ya existe una subcategoría con el mismo nombre
        const existingSubcategoria = subcategorias.find(sub => 
            sub.name.toLowerCase() === subcategoriaData.name.toLowerCase() && 
            sub.id !== currentSubcategoria?.id
        );
        
        if (existingSubcategoria) {
            window.dashboard.showToast('Ya existe una subcategoría con ese nombre', 'error');
            return;
        }
        
        if (isEditingSubcategoria) {
            updateSubcategoria(currentSubcategoria.id, subcategoriaData);
        } else {
            createSubcategoria(subcategoriaData);
        }
    }
    
    // ===================================
    // CRUD OPERATIONS
    // ===================================
    function createCategoria(categoriaData, selectedSubcategoriaIds = []) {
        const newCategoria = {
            ...categoriaData,
            id: window.generateId('category'),
            productCount: 0,
            createdAt: new Date().toISOString()
        };
        
        categorias.push(newCategoria);
        saveCategorias();
        // Vincular subcategorías seleccionadas con la nueva categoría
        if (Array.isArray(selectedSubcategoriaIds) && selectedSubcategoriaIds.length > 0) {
            subcategorias.forEach(sub => {
                if (!Array.isArray(sub.categoriaIds)) sub.categoriaIds = [];
                if (selectedSubcategoriaIds.includes(sub.id)) {
                    if (!sub.categoriaIds.includes(newCategoria.id)) {
                        sub.categoriaIds.push(newCategoria.id);
                    }
                }
            });
            saveSubcategorias();
        }
        renderCategorias();
        
        closeCategoriaModal();
        window.dashboard.showToast('Categoría creada exitosamente', 'success');
        
        console.log('Categoría creada:', newCategoria);
    }
    
    function updateCategoria(categoriaId, categoriaData, selectedSubcategoriaIds = []) {
        const categoriaIndex = categorias.findIndex(c => c.id === categoriaId);
        if (categoriaIndex !== -1) {
            categorias[categoriaIndex] = {
                ...categorias[categoriaIndex],
                ...categoriaData,
                id: categoriaId
            };
            
            saveCategorias();
            // Sincronizar relaciones subcategorías ↔ categoría
            if (Array.isArray(selectedSubcategoriaIds)) {
                subcategorias.forEach(sub => {
                    if (!Array.isArray(sub.categoriaIds)) sub.categoriaIds = [];
                    const isChecked = selectedSubcategoriaIds.includes(sub.id);
                    const hasRelation = sub.categoriaIds.includes(categoriaId);
                    if (isChecked && !hasRelation) {
                        sub.categoriaIds.push(categoriaId);
                    } else if (!isChecked && hasRelation) {
                        sub.categoriaIds = sub.categoriaIds.filter(id => id !== categoriaId);
                    }
                });
                saveSubcategorias();
            }
            renderCategorias();
            
            closeCategoriaModal();
            window.dashboard.showToast('Categoría actualizada exitosamente', 'success');
            
            console.log('Categoría actualizada:', categorias[categoriaIndex]);
        }
    }
    
    function deleteCategoria(categoriaId) {
        const categoria = categorias.find(c => c.id === categoriaId);
        if (!categoria) return;
        
        // Verificar si hay productos asociados
        if (categoria.productCount > 0) {
            window.dashboard.showToast('No se puede eliminar una categoría que tiene productos asociados', 'error');
            return;
        }
        
        const confirmationHTML = `
            <div class="confirmation-modal-categoria">
                <div class="confirmation-icon-categoria">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="confirmation-message-categoria">
                    ¿Estás seguro de que quieres eliminar la categoría <strong>"${categoria.name}"</strong>?<br>
                    Esta acción también eliminará todas las relaciones con subcategorías.
                </div>
                <div class="confirmation-actions-categoria">
                    <button class="btn btn-secondary" onclick="closeCategoriaModal()">
                        Cancelar
                    </button>
                    <button class="btn btn-danger" onclick="confirmDeleteCategoria(${categoriaId})">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        `;
        
        createModal('Confirmar Eliminación', confirmationHTML);
    }
    
    function confirmDeleteCategoria(categoriaId) {
        const categoriaIndex = categorias.findIndex(c => c.id === categoriaId);
        if (categoriaIndex !== -1) {
            const categoriaName = categorias[categoriaIndex].name;
            
            // Eliminar relaciones con subcategorías
            subcategorias.forEach(subcategoria => {
                subcategoria.categoriaIds = subcategoria.categoriaIds.filter(id => id !== categoriaId);
            });
            
            categorias.splice(categoriaIndex, 1);
            
            saveCategorias();
            saveSubcategorias();
            renderCategorias();
            
            closeCategoriaModal();
            window.dashboard.showToast(`Categoría "${categoriaName}" eliminada exitosamente`, 'success');
            
            console.log('Categoría eliminada:', categoriaId);
        }
    }
    
    function createSubcategoria(subcategoriaData) {
        const newSubcategoria = {
            ...subcategoriaData,
            id: window.generateId('subcategory'),
            createdAt: new Date().toISOString()
        };
        
        subcategorias.push(newSubcategoria);
        saveSubcategorias();
        renderCategorias();
        
        closeCategoriaModal();
        window.dashboard.showToast('Subcategoría creada exitosamente', 'success');
        
        console.log('Subcategoría creada:', newSubcategoria);
    }
    
    function updateSubcategoria(subcategoriaId, subcategoriaData) {
        const subcategoriaIndex = subcategorias.findIndex(s => s.id === subcategoriaId);
        if (subcategoriaIndex !== -1) {
            subcategorias[subcategoriaIndex] = {
                ...subcategorias[subcategoriaIndex],
                ...subcategoriaData,
                id: subcategoriaId
            };
            
            saveSubcategorias();
            renderCategorias();
            
            closeCategoriaModal();
            window.dashboard.showToast('Subcategoría actualizada exitosamente', 'success');
            
            console.log('Subcategoría actualizada:', subcategorias[subcategoriaIndex]);
        }
    }
    
    function deleteSubcategoria(subcategoriaId) {
        const subcategoria = subcategorias.find(s => s.id === subcategoriaId);
        if (!subcategoria) return;
        
        const confirmationHTML = `
            <div class="confirmation-modal-categoria">
                <div class="confirmation-icon-categoria">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="confirmation-message-categoria">
                    ¿Estás seguro de que quieres eliminar la subcategoría <strong>"${subcategoria.name}"</strong>?<br>
                    Esta acción eliminará todas las relaciones con categorías.
                </div>
                <div class="confirmation-actions-categoria">
                    <button class="btn btn-secondary" onclick="closeCategoriaModal()">
                        Cancelar
                    </button>
                    <button class="btn btn-danger" onclick="confirmDeleteSubcategoria(${subcategoriaId})">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        `;
        
        createModal('Confirmar Eliminación', confirmationHTML);
    }
    
    function confirmDeleteSubcategoria(subcategoriaId) {
        const subcategoriaIndex = subcategorias.findIndex(s => s.id === subcategoriaId);
        if (subcategoriaIndex !== -1) {
            const subcategoriaName = subcategorias[subcategoriaIndex].name;
            subcategorias.splice(subcategoriaIndex, 1);
            
            saveSubcategorias();
            renderCategorias();
            
            closeCategoriaModal();
            window.dashboard.showToast(`Subcategoría "${subcategoriaName}" eliminada exitosamente`, 'success');
            
            console.log('Subcategoría eliminada:', subcategoriaId);
        }
    }
    
    // ===================================
    // RELACIÓN CATEGORÍA - SUBCATEGORÍA: DESVINCULAR
    // ===================================
    function removeSubcategoriaFromCategoria(categoriaId, subcategoriaId) {
        const subcategoria = subcategorias.find(s => s.id === subcategoriaId);
        if (!subcategoria) {
            window.dashboard.showToast('Subcategoría no encontrada', 'error');
            return;
        }
        if (!Array.isArray(subcategoria.categoriaIds)) {
            subcategoria.categoriaIds = [];
        }
        const beforeLength = subcategoria.categoriaIds.length;
        subcategoria.categoriaIds = subcategoria.categoriaIds.filter(id => id !== categoriaId);
        const afterLength = subcategoria.categoriaIds.length;
        
        if (beforeLength === afterLength) {
            window.dashboard.showToast('La subcategoría ya no estaba vinculada a esta categoría', 'info');
            return;
        }
        
        saveSubcategorias();
        renderCategorias();
        window.dashboard.showToast('Subcategoría desvinculada de la categoría', 'success');
    }
    
    function editCategoria(categoriaId) {
        const categoria = categorias.find(c => c.id === categoriaId);
        if (!categoria) return;
        
        isEditingCategoria = true;
        currentCategoria = categoria;
        showCategoriaForm();
    }
    
    function editSubcategoria(subcategoriaId) {
        const subcategoria = subcategorias.find(s => s.id === subcategoriaId);
        if (!subcategoria) return;
        
        isEditingSubcategoria = true;
        currentSubcategoria = subcategoria;
        showSubcategoriaForm();
    }
    
    
    // ===================================
    // TABS FUNCTIONALITY
    // ===================================
    function setupTabsListeners() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanels = document.querySelectorAll('.tab-panel');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remover clase active de todos los botones y paneles
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                
                // Agregar clase active al botón clickeado y su panel correspondiente
                button.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });
    }

    // ===================================
    // UTILIDADES
    // ===================================
    function addCategoriaCardListeners() {
        // Los event listeners se agregan mediante onclick en el HTML generado
    }
    
    function addSubcategoriaCardListeners() {
        // Los event listeners se agregan mediante onclick en el HTML generado
    }
    
    // Acordeón de subcategorías por categoría
    function toggleSubcategorias(categoriaId) {
        const body = document.getElementById(`subcats-${categoriaId}`);
        const icon = document.getElementById(`subcats-toggle-icon-${categoriaId}`);
        if (!body) return;
        const isOpen = body.classList.contains('open');
        if (isOpen) {
            body.style.maxHeight = '0px';
            body.classList.remove('open');
            if (icon) icon.classList.remove('rotated');
            // actualizar aria
            const toggleBtn = body.previousElementSibling;
            if (toggleBtn && toggleBtn.setAttribute) toggleBtn.setAttribute('aria-expanded', 'false');
        } else {
            body.classList.add('open');
            body.style.maxHeight = body.scrollHeight + 'px';
            if (icon) icon.classList.add('rotated');
            const toggleBtn = body.previousElementSibling;
            if (toggleBtn && toggleBtn.setAttribute) toggleBtn.setAttribute('aria-expanded', 'true');
        }
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // ===================================
    // FUNCIONES PÚBLICAS
    // ===================================
    window.loadCategoriasModule = function() {
        console.log('Cargando módulo de categorías...');
        loadCategorias();
        loadSubcategorias();
    };
    
    // Exportar datos para uso en otros módulos
    window.categoriasModule = {
        getCategorias: () => categorias,
        getSubcategorias: () => subcategorias,
        getCategoriaById: (id) => categorias.find(c => c.id == id),
        getSubcategoriasByCategoria: (categoriaId) => subcategorias.filter(s => s.categoria_id == categoriaId)
    };
    
    // Funciones globales para los botones
    window.editCategoria = editCategoria;
    window.deleteCategoria = deleteCategoria;
    window.confirmDeleteCategoria = confirmDeleteCategoria;
    window.showNewCategoriaForm = showNewCategoriaForm;
    window.editSubcategoria = editSubcategoria;
    window.deleteSubcategoria = deleteSubcategoria;
    window.confirmDeleteSubcategoria = confirmDeleteSubcategoria;
    window.showNewSubcategoriaForm = showNewSubcategoriaForm;
    window.closeCategoriaModal = closeCategoriaModal;
    window.removeSubcategoriaFromCategoria = removeSubcategoriaFromCategoria;
    window.toggleSubcategorias = toggleSubcategorias;
    
    // ===================================
    // INICIALIZACIÓN
    // ===================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();