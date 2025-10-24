/* ===================================
   MÓDULO PROMOCIONES - JAVASCRIPT
   =================================== */

(function() {
    'use strict';
    
    console.log('Módulo Promociones cargado');
    
    // Variables del módulo
    let promociones = [];
    let currentPromocion = null;
    let isEditing = false;
    let heroConfig = {
        visible: false, // Por defecto desmarcado
        maxSlides: 1,   // Por defecto 1 slide
        showPedirButton: true,
        showWhatsAppButton: true
    };
    
    // Elementos del DOM
    const promocionesGrid = document.getElementById('promocionesGrid');
    const btnNuevaPromocion = document.getElementById('btnNuevaPromocion');
    
    // ===================================
    // INICIALIZACIÓN
    // ===================================
    function init() {
        setupEventListeners();
        loadPromociones();
        loadHeroConfig();
        console.log('Módulo Promociones inicializado');
    }
    
    // ===================================
    // EVENT LISTENERS
    // ===================================
    function setupEventListeners() {
        if (btnNuevaPromocion) {
            btnNuevaPromocion.addEventListener('click', showNewPromocionForm);
        }
    }
    
    // ===================================
    // CARGA DE PROMOCIONES
    // ===================================
    function loadPromociones() {
        console.log('Cargando promociones...');
        
        // Mostrar loading
        showLoadingState();
        
        // Simular carga de datos
        setTimeout(() => {
            const savedPromociones = localStorage.getItem('dashboardPromociones');
            if (savedPromociones) {
                try {
                    promociones = JSON.parse(savedPromociones);
                } catch (error) {
                    console.error('Error al cargar promociones:', error);
                    promociones = [];
                }
            } else {
                // Datos de ejemplo
                promociones = getSamplePromociones();
                savePromociones();
            }
            
            updateHeroPreview();
        }, 500);
    }
    
    function getSamplePromociones() {
        return [
            {
                id: 1,
                title: 'Oferta Especial',
                description: 'Descuentos increíbles en electrodomésticos',
                image: 'img/promociones/promo1.jpg',
                order: 1,
                status: 'active',
                showPedirButton: true,
                showWhatsAppButton: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Nuevos Productos',
                description: 'Descubre nuestra nueva colección',
                image: 'img/promociones/promo2.jpg',
                order: 2,
                status: 'active',
                showPedirButton: false,
                showWhatsAppButton: true,
                createdAt: new Date().toISOString()
            }
        ];
    }
    
    function savePromociones() {
        try {
            localStorage.setItem('dashboardPromociones', JSON.stringify(promociones));
            console.log('Promociones guardadas');
        } catch (error) {
            console.error('Error al guardar promociones:', error);
        }
    }
    
    function loadHeroConfig() {
        const savedConfig = localStorage.getItem('heroConfig');
        if (savedConfig) {
            try {
                const loadedConfig = JSON.parse(savedConfig);
                // Solo cargar configuración si existe, mantener defaults si no
                if (loadedConfig.visible !== undefined) heroConfig.visible = loadedConfig.visible;
                if (loadedConfig.maxSlides !== undefined) heroConfig.maxSlides = loadedConfig.maxSlides;
            } catch (error) {
                console.error('Error al cargar configuración del hero:', error);
            }
        }
        renderHeroConfig();
        
        // Inicializar slides del hero si no existen
        initializeHeroSlides();
        
        // Sincronizar con el index al cargar
        setTimeout(() => {
            syncWithIndex();
        }, 500);
    }
    
    function initializeHeroSlides() {
        let heroSlides = JSON.parse(localStorage.getItem('heroSlides') || '[]');
        
        // Si no hay slides o hay menos de los necesarios, crear los que faltan
        while (heroSlides.length < heroConfig.maxSlides) {
            const newSlide = {
                id: Date.now() + Math.random(),
                title: `Slide ${heroSlides.length + 1}`,
                description: 'Descripción del slide',
                image: 'img/placeholder.svg',
                showPedirButton: true,
                showWhatsAppButton: true,
                whatsappMessage: 'Me interesa esta promoción',
                order: heroSlides.length + 1
            };
            heroSlides.push(newSlide);
        }
        
        // Si hay más slides de los necesarios, eliminar los extras
        if (heroSlides.length > heroConfig.maxSlides) {
            heroSlides = heroSlides.slice(0, heroConfig.maxSlides);
        }
        
        // Guardar slides actualizados
        localStorage.setItem('heroSlides', JSON.stringify(heroSlides));
        console.log('🎯 Slides del hero inicializados:', heroSlides.length, 'slides');
    }
    
    function saveHeroConfigSilent() {
        try {
            localStorage.setItem('heroConfig', JSON.stringify(heroConfig));
            console.log('Configuración del hero guardada silenciosamente');
        } catch (error) {
            console.error('Error al guardar configuración del hero:', error);
        }
    }
    
    function saveHeroConfig() {
        try {
            localStorage.setItem('heroConfig', JSON.stringify(heroConfig));
            console.log('Configuración del hero guardada');
            window.dashboard.showToast('Borrador guardado exitosamente', 'info');
        } catch (error) {
            console.error('Error al guardar configuración del hero:', error);
        }
    }
    
    // ===================================
    // RENDERIZADO
    // ===================================
    function renderPromociones() {
        if (!promocionesGrid) return;
        
        if (promociones.length === 0) {
            showEmptyState();
            return;
        }
        
        // Ordenar por order
        const sortedPromociones = [...promociones].sort((a, b) => a.order - b.order);
        
        const promocionesHTML = sortedPromociones.map(promocion => createPromocionCard(promocion)).join('');
        promocionesGrid.innerHTML = promocionesHTML;
        
        // Agregar event listeners
        addPromocionCardListeners();
    }
    
    function createPromocionCard(promocion) {
        const statusClass = promocion.status === 'active' ? 'active' : 'inactive';
        const statusText = promocion.status === 'active' ? 'Activo' : 'Inactivo';
        
        return `
            <div class="promocion-card" data-promocion-id="${promocion.id}">
                <div class="promocion-card-header">
                    <img src="${promocion.image}" alt="${promocion.title}" class="promocion-image" onerror="this.src='img/placeholder.svg'">
                    <div class="promocion-order">#${promocion.order}</div>
                    <div class="promocion-status ${statusClass}">${statusText}</div>
                </div>
                <div class="promocion-card-body">
                    <h3 class="promocion-title">${promocion.title}</h3>
                    <p class="promocion-description">${promocion.description}</p>
                    
                    <div class="promocion-buttons">
                        <span class="promocion-button pedir ${!promocion.showPedirButton ? 'hidden' : ''}">
                            <i class="fas fa-shopping-cart"></i> Pedir
                        </span>
                        <span class="promocion-button whatsapp ${!promocion.showWhatsAppButton ? 'hidden' : ''}">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </span>
                    </div>
                    
                    <div class="promocion-order-controls">
                        <button class="order-btn" onclick="movePromocionUp(${promocion.id})" 
                                ${promocion.order === 1 ? 'disabled' : ''}>
                            <i class="fas fa-chevron-up"></i>
                        </button>
                        <button class="order-btn" onclick="movePromocionDown(${promocion.id})" 
                                ${promocion.order === promociones.length ? 'disabled' : ''}>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    </div>
                    
                    <div class="promocion-actions">
                        <button class="btn btn-primary btn-sm" onclick="editPromocion(${promocion.id})">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deletePromocion(${promocion.id})">
                            <i class="fas fa-trash"></i>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function showLoadingState() {
        if (!promocionesGrid) return;
        
        const skeletonHTML = `
            <div class="promociones-loading">
                ${Array(4).fill(0).map(() => `
                    <div class="promocion-skeleton">
                        <div class="skeleton-image-promocion"></div>
                        <div class="skeleton-content-promocion">
                            <div class="skeleton-line-promocion"></div>
                            <div class="skeleton-line-promocion short"></div>
                            <div class="skeleton-line-promocion medium"></div>
                            <div class="skeleton-line-promocion short"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        promocionesGrid.innerHTML = skeletonHTML;
    }
    
    function showEmptyState() {
        if (!promocionesGrid) return;
        
        const emptyHTML = `
            <div class="promociones-empty">
                <i class="fas fa-image"></i>
                <h3>No hay promociones</h3>
                <p>Comienza creando tu primera promoción para el hero slider. Las promociones aparecerán en la parte superior de tu catálogo.</p>
                <button class="btn btn-primary" onclick="showNewPromocionForm()">
                    <i class="fas fa-plus"></i>
                    Nueva Promoción
                </button>
            </div>
        `;
        
        promocionesGrid.innerHTML = emptyHTML;
    }
    
    function renderHeroConfig() {
        const configHTML = `
            <div class="promociones-config">
                <div class="config-section">
                    <h4 class="config-title">Configuración General</h4>
                    <div class="config-options">
                        <div class="config-option">
                            <input type="checkbox" id="heroVisible" ${heroConfig.visible ? 'checked' : ''}>
                            <label for="heroVisible">Mostrar sección de promociones</label>
                        </div>
                    </div>
                </div>
                
                <div class="config-section">
                    <h4 class="config-title">Configuración de Slides</h4>
                    <div class="slides-config-container">
                        <div class="slides-controls">
                            <label for="maxSlides">Cantidad de slides a mostrar:</label>
                            <div class="config-select">
                                <select id="maxSlides">
                                    <option value="1" ${heroConfig.maxSlides === 1 ? 'selected' : ''}>1 slide</option>
                                    <option value="2" ${heroConfig.maxSlides === 2 ? 'selected' : ''}>2 slides</option>
                                    <option value="3" ${heroConfig.maxSlides === 3 ? 'selected' : ''}>3 slides</option>
                                    <option value="4" ${heroConfig.maxSlides === 4 ? 'selected' : ''}>4 slides</option>
                                    <option value="5" ${heroConfig.maxSlides === 5 ? 'selected' : ''}>5 slides</option>
                                    <option value="6" ${heroConfig.maxSlides === 6 ? 'selected' : ''}>6 slides</option>
                                    <option value="7" ${heroConfig.maxSlides === 7 ? 'selected' : ''}>7 slides</option>
                                </select>
                    </div>
                            <div class="slides-counter">Configurando ${heroConfig.maxSlides} slides para el hero</div>
                </div>
                
                        <div class="slides-management">
                            <h5>Gestionar Slides del Hero:</h5>
                            <div class="hero-slides-grid" id="heroSlidesGrid">
                                ${generateHeroSlidesCards()}
                        </div>
                    </div>
                </div>
                
                <div class="config-section">
                    <button class="btn btn-success btn-publish" onclick="publishHeroConfig()">
                        <i class="fas fa-rocket"></i>
                        Publicar Cambios
                    </button>
                    <button class="btn btn-secondary" onclick="saveHeroConfig()">
                        <i class="fas fa-save"></i>
                        Guardar Borrador
                    </button>
                </div>
            </div>
        `;
        
        // Insertar antes del grid de promociones
        if (promocionesGrid && promocionesGrid.parentNode) {
            const existingConfig = promocionesGrid.parentNode.querySelector('.promociones-config');
            if (existingConfig) {
                existingConfig.remove();
            }
            promocionesGrid.parentNode.insertAdjacentHTML('afterbegin', configHTML);
            
            // Ocultar el grid de promociones
            promocionesGrid.style.display = 'none';
            
            // Agregar event listeners
            setupHeroConfigListeners();
        }
    }
    
    function setupHeroConfigListeners() {
        const heroVisible = document.getElementById('heroVisible');
        const maxSlides = document.getElementById('maxSlides');
        
        if (heroVisible) {
            // Remover listener existente para evitar duplicados
            heroVisible.removeEventListener('change', heroVisible._changeHandler);
            heroVisible._changeHandler = (e) => {
                heroConfig.visible = e.target.checked;
                updateSlidesCounter();
                // Sincronizar inmediatamente con el index
                syncWithIndex();
            };
            heroVisible.addEventListener('change', heroVisible._changeHandler);
        }
        
        if (maxSlides) {
            // Remover listener existente para evitar duplicados
            maxSlides.removeEventListener('change', maxSlides._changeHandler);
            maxSlides._changeHandler = (e) => {
                heroConfig.maxSlides = parseInt(e.target.value);
                updateSlidesCounter();
                // Regenerar las cards de slides
                regenerateHeroSlidesCards();
            };
            maxSlides.addEventListener('change', maxSlides._changeHandler);
        }
    }
    
    function updateHeroPreview() {
        // Actualizar contador de slides en el módulo
        updateSlidesCounter();
        
        // Solo guardar silenciosamente, sin mostrar toast
        saveHeroConfigSilent();
        
        const existingPreview = document.querySelector('.hero-preview');
        if (existingPreview) {
            existingPreview.remove();
        }
        
        if (!heroConfig.visible || promociones.length === 0) {
            return;
        }
        
        const activePromociones = promociones
            .filter(p => p.status === 'active')
            .sort((a, b) => a.order - b.order)
            .slice(0, heroConfig.maxSlides);
        
        if (activePromociones.length === 0) {
            return;
        }
        
        const previewHTML = `
            <div class="hero-preview">
                <h4 class="hero-preview-title">Vista Previa del Hero</h4>
                <div class="hero-preview-container">
                    ${activePromociones.map((promocion, index) => `
                        <div class="hero-preview-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
                            <img src="${promocion.image}" alt="${promocion.title}" onerror="this.src='img/placeholder.svg'">
                        </div>
                    `).join('')}
                    
                    <div class="hero-preview-buttons">
                        ${heroConfig.showPedirButton ? '<button class="hero-preview-btn pedir">Pedir</button>' : ''}
                        ${heroConfig.showWhatsAppButton ? '<button class="hero-preview-btn whatsapp">WhatsApp</button>' : ''}
                    </div>
                    
                    <div class="hero-preview-indicators">
                        ${activePromociones.map((_, index) => `
                            <div class="hero-preview-indicator ${index === 0 ? 'active' : ''}" data-slide="${index}"></div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        if (promocionesGrid && promocionesGrid.parentNode) {
            promocionesGrid.parentNode.insertAdjacentHTML('beforeend', previewHTML);
        }
    }
    
    // ===================================
    // MODAL FUNCTIONS
    // ===================================
    function createModal(title, content, size = 'medium') {
        console.log('🚀 createModal iniciado:', title);
        
        // Remover modal existente si existe
        const existingModal = document.getElementById('promocionModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Crear overlay con estilos inline para garantizar visibilidad
        const overlay = document.createElement('div');
        overlay.id = 'promocionModal';
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
                <button onclick="closePromocionModal()" style="background: none; border: none; font-size: 18px; color: #cccccc; cursor: pointer; padding: 5px; border-radius: 8px; transition: all 0.3s ease;">
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
                closePromocionModal();
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
        
        console.log('✅ Modal de promoción creado y mostrado correctamente');
    }
    
    function closePromocionModal() {
        const modal = document.getElementById('promocionModal');
        if (modal) {
            modal.remove();
            console.log('Modal de promoción cerrado');
        }
    }
    
    // showToast ahora se usa directamente desde window.dashboard.showToast

    // ===================================
    // FORMULARIOS
    // ===================================
    function showNewPromocionForm() {
        isEditing = false;
        currentPromocion = null;
        showPromocionForm();
    }
    
    function showPromocionForm() {
        const formHTML = createPromocionForm();
        
        createModal(
            isEditing ? 'Editar Promoción' : 'Nueva Promoción',
            formHTML,
            'large'
        );
        
        // Configurar event listeners del formulario
        setupPromocionFormListeners();
    }
    
    function createPromocionForm() {
        const promocion = currentPromocion || {
            title: '',
            description: '',
            image: '',
            status: 'active',
            showPedirButton: true,
            showWhatsAppButton: true
        };
        
        return `
            <form id="promocionForm" class="promocion-form">
                <div class="form-section">
                    <h4 class="form-section-title">Información Básica</h4>
                    
                    <div class="form-group">
                        <label for="promocionTitle" class="form-label">Título de la Promoción *</label>
                        <input type="text" id="promocionTitle" name="title" class="form-control" 
                               value="${promocion.title}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="promocionDescription" class="form-label">Descripción *</label>
                        <textarea id="promocionDescription" name="description" class="form-control" 
                                  rows="3" required>${promocion.description}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="promocionStatus" class="form-label">Estado</label>
                        <select id="promocionStatus" name="status" class="form-control">
                            <option value="active" ${promocion.status === 'active' ? 'selected' : ''}>Activo</option>
                            <option value="inactive" ${promocion.status === 'inactive' ? 'selected' : ''}>Inactivo</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4 class="form-section-title">Imagen de la Promoción</h4>
                    
                    <div class="image-upload-promocion" id="imageUploadPromocion">
                        <div class="image-upload-icon">
                            <i class="fas fa-cloud-upload-alt"></i>
                        </div>
                        <div class="image-upload-text">Arrastra una imagen aquí o haz clic para seleccionar</div>
                        <div class="image-upload-hint">Formatos: JPG, PNG, GIF. Tamaño máximo: 2MB</div>
                        <input type="file" id="promocionImage" name="image" accept="image/*" style="display: none;">
                    </div>
                    
                    <div class="image-preview-promocion" id="imagePreviewPromocion" style="display: none;">
                        <img id="previewImagePromocion" src="" alt="Vista previa">
                    </div>
                </div>
                
                <div class="form-section">
                    <h4 class="form-section-title">Configuración de Botones</h4>
                    
                    <div class="button-config">
                        <h5>Botones que aparecerán en esta promoción:</h5>
                        <div class="button-options">
                            <div class="button-option">
                                <input type="checkbox" id="promocionPedirButton" name="showPedirButton" 
                                       ${promocion.showPedirButton ? 'checked' : ''}>
                                <label for="promocionPedirButton">Mostrar botón "Pedir"</label>
                            </div>
                            <div class="button-option">
                                <input type="checkbox" id="promocionWhatsAppButton" name="showWhatsAppButton" 
                                       ${promocion.showWhatsAppButton ? 'checked' : ''}>
                                <label for="promocionWhatsAppButton">Mostrar botón "WhatsApp"</label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closePromocionModal()">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${isEditing ? 'Actualizar' : 'Crear'} Promoción
                    </button>
                </div>
            </form>
        `;
    }
    
    function setupPromocionFormListeners() {
        // Upload de imagen
        const imageUploadArea = document.getElementById('imageUploadPromocion');
        const promocionImage = document.getElementById('promocionImage');
        const imagePreview = document.getElementById('imagePreviewPromocion');
        const previewImage = document.getElementById('previewImagePromocion');
        
        if (imageUploadArea && promocionImage) {
            imageUploadArea.addEventListener('click', () => promocionImage.click());
            
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
            
            promocionImage.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleImageUpload(e.target.files[0]);
                }
            });
        }
        
        // Formulario
        const promocionForm = document.getElementById('promocionForm');
        if (promocionForm) {
            promocionForm.addEventListener('submit', handlePromocionSubmit);
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
            const previewImage = document.getElementById('previewImagePromocion');
            const imagePreview = document.getElementById('imagePreviewPromocion');
            
            if (previewImage && imagePreview) {
                previewImage.src = e.target.result;
                imagePreview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
    
    function handlePromocionSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const promocionData = {
            title: formData.get('title'),
            description: formData.get('description'),
            status: formData.get('status'),
            showPedirButton: formData.has('showPedirButton'),
            showWhatsAppButton: formData.has('showWhatsAppButton'),
            image: currentPromocion?.image || 'img/placeholder.svg'
        };
        
        // Validaciones
        if (!promocionData.title || !promocionData.description) {
            window.dashboard.showToast('Por favor completa todos los campos obligatorios', 'error');
            return;
        }
        
        if (isEditing) {
            updatePromocion(currentPromocion.id, promocionData);
        } else {
            createPromocion(promocionData);
        }
    }
    
    // ===================================
    // CRUD OPERATIONS
    // ===================================
    function createPromocion(promocionData) {
        const newPromocion = {
            ...promocionData,
            id: Date.now(),
            order: promociones.length + 1,
            createdAt: new Date().toISOString()
        };
        
        promociones.push(newPromocion);
        savePromociones();
        renderPromociones();
        updateHeroPreview();
        
        closePromocionModal();
        window.dashboard.showToast('Promoción creada exitosamente', 'success');
        
        console.log('Promoción creada:', newPromocion);
    }
    
    function updatePromocion(promocionId, promocionData) {
        const promocionIndex = promociones.findIndex(p => p.id === promocionId);
        if (promocionIndex !== -1) {
            promociones[promocionIndex] = {
                ...promociones[promocionIndex],
                ...promocionData,
                id: promocionId
            };
            
            savePromociones();
            renderPromociones();
            updateHeroPreview();
            
            closePromocionModal();
            window.dashboard.showToast('Promoción actualizada exitosamente', 'success');
            
            console.log('Promoción actualizada:', promociones[promocionIndex]);
        }
    }
    
    function deletePromocion(promocionId) {
        const promocion = promociones.find(p => p.id === promocionId);
        if (!promocion) return;
        
        const confirmationHTML = `
            <div class="confirmation-modal">
                <div class="confirmation-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="confirmation-message">
                    ¿Estás seguro de que quieres eliminar la promoción <strong>"${promocion.title}"</strong>?<br>
                    Esta acción no se puede deshacer.
                </div>
                <div class="confirmation-actions">
                    <button class="btn btn-secondary" onclick="closePromocionModal()">
                        Cancelar
                    </button>
                    <button class="btn btn-danger" onclick="confirmDeletePromocion(${promocionId})">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        `;
        
        window.dashboard.openModal('Confirmar Eliminación', confirmationHTML);
    }
    
    function confirmDeletePromocion(promocionId) {
        const promocionIndex = promociones.findIndex(p => p.id === promocionId);
        if (promocionIndex !== -1) {
            const promocionName = promociones[promocionIndex].title;
            promociones.splice(promocionIndex, 1);
            
            // Reordenar las promociones restantes
            promociones.forEach((promocion, index) => {
                promocion.order = index + 1;
            });
            
            savePromociones();
            renderPromociones();
            updateHeroPreview();
            
            closePromocionModal();
            window.dashboard.showToast(`Promoción "${promocionName}" eliminada exitosamente`, 'success');
            
            console.log('Promoción eliminada:', promocionId);
        }
    }
    
    function editPromocion(promocionId) {
        const promocion = promociones.find(p => p.id === promocionId);
        if (!promocion) return;
        
        isEditing = true;
        currentPromocion = promocion;
        showPromocionForm();
    }
    
    // ===================================
    // ORDENAMIENTO
    // ===================================
    function movePromocionUp(promocionId) {
        const promocion = promociones.find(p => p.id === promocionId);
        if (!promocion || promocion.order === 1) return;
        
        const prevPromocion = promociones.find(p => p.order === promocion.order - 1);
        if (prevPromocion) {
            // Intercambiar órdenes
            const tempOrder = promocion.order;
            promocion.order = prevPromocion.order;
            prevPromocion.order = tempOrder;
            
            savePromociones();
            renderPromociones();
            updateHeroPreview();
            
            window.dashboard.showToast('Orden actualizado', 'success');
        }
    }
    
    function movePromocionDown(promocionId) {
        const promocion = promociones.find(p => p.id === promocionId);
        if (!promocion || promocion.order === promociones.length) return;
        
        const nextPromocion = promociones.find(p => p.order === promocion.order + 1);
        if (nextPromocion) {
            // Intercambiar órdenes
            const tempOrder = promocion.order;
            promocion.order = nextPromocion.order;
            nextPromocion.order = tempOrder;
            
            savePromociones();
            renderPromociones();
            updateHeroPreview();
            
            window.dashboard.showToast('Orden actualizado', 'success');
        }
    }
    
    // ===================================
    // CONFIGURACIÓN DEL HERO
    // ===================================
    
    function generateHeroSlidesCards() {
        // Obtener slides existentes del hero
        let heroSlides = JSON.parse(localStorage.getItem('heroSlides') || '[]');
        
        // Si no hay slides, crear los necesarios
        if (heroSlides.length === 0) {
            for (let i = 0; i < heroConfig.maxSlides; i++) {
                const newSlide = {
                    id: Date.now() + Math.random() + i,
                    title: `Slide ${i + 1}`,
                    description: 'Descripción del slide',
                    image: 'img/placeholder.svg',
                    showPedirButton: true,
                    showWhatsAppButton: true,
                    whatsappMessage: 'Me interesa esta promoción',
                    order: i + 1
                };
                heroSlides.push(newSlide);
            }
            localStorage.setItem('heroSlides', JSON.stringify(heroSlides));
        }
        
        // Ajustar cantidad de slides si es necesario
        if (heroSlides.length > heroConfig.maxSlides) {
            heroSlides = heroSlides.slice(0, heroConfig.maxSlides);
            localStorage.setItem('heroSlides', JSON.stringify(heroSlides));
        }
        
        // Generar HTML de las cards
        return heroSlides.map((slide, index) => `
            <div class="hero-slide-card" data-slide-id="${slide.id}">
                <div class="hero-slide-header">
                    <div class="slide-number">#${index + 1}</div>
                    <div class="slide-status active">ACTIVO</div>
                </div>
                <div class="hero-slide-image">
                    <img src="${slide.image}" alt="${slide.title}" onerror="this.src='img/placeholder.svg'">
                </div>
                <div class="hero-slide-content">
                    <div class="slide-field">
                        <label>Título:</label>
                        <input type="text" class="slide-title-input" value="${slide.title}" data-field="title">
                    </div>
                    <div class="slide-field">
                        <label>Descripción:</label>
                        <textarea class="slide-description-input" data-field="description">${slide.description}</textarea>
                    </div>
                    <div class="slide-field">
                        <label>Imagen URL:</label>
                        <input type="text" class="slide-image-input" value="${slide.image}" data-field="image">
                    </div>
                    <div class="slide-buttons-config">
                        <div class="button-option">
                            <input type="checkbox" id="pedir_${slide.id}" ${slide.showPedirButton ? 'checked' : ''} data-field="showPedirButton">
                            <label for="pedir_${slide.id}">Mostrar botón "Pedir"</label>
                        </div>
                        <div class="button-option">
                            <input type="checkbox" id="whatsapp_${slide.id}" ${slide.showWhatsAppButton ? 'checked' : ''} data-field="showWhatsAppButton">
                            <label for="whatsapp_${slide.id}">Mostrar botón "WhatsApp"</label>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    function updateSlidesCounter() {
        const counterElement = document.querySelector('.slides-counter');
        if (counterElement) {
            counterElement.textContent = `Configurando ${heroConfig.maxSlides} slides para el hero`;
        }
    }
    
    function regenerateHeroSlidesCards() {
        const heroSlidesGrid = document.getElementById('heroSlidesGrid');
        if (heroSlidesGrid) {
            // Asegurar que tenemos la cantidad correcta de slides
            let heroSlides = JSON.parse(localStorage.getItem('heroSlides') || '[]');
            
            // Si necesitamos más slides, crearlos
            while (heroSlides.length < heroConfig.maxSlides) {
                const newSlide = {
                    id: Date.now() + Math.random() + heroSlides.length,
                    title: `Slide ${heroSlides.length + 1}`,
                    description: 'Descripción del slide',
                    image: 'img/placeholder.svg',
                    showPedirButton: true,
                    showWhatsAppButton: true,
                    whatsappMessage: 'Me interesa esta promoción',
                    order: heroSlides.length + 1
                };
                heroSlides.push(newSlide);
            }
            
            // Si hay más slides de los necesarios, eliminar los extras
            if (heroSlides.length > heroConfig.maxSlides) {
                heroSlides = heroSlides.slice(0, heroConfig.maxSlides);
            }
            
            // Guardar slides actualizados
            localStorage.setItem('heroSlides', JSON.stringify(heroSlides));
            
            heroSlidesGrid.innerHTML = generateHeroSlidesCards();
            // Agregar event listeners a los inputs
            addHeroSlidesListeners();
        }
    }
    
    function addHeroSlidesListeners() {
        // Event listeners para inputs de texto
        document.querySelectorAll('.slide-title-input, .slide-description-input, .slide-image-input').forEach(input => {
            input.addEventListener('input', function() {
                updateHeroSlideData(this);
            });
        });
        
        // Event listeners para checkboxes
        document.querySelectorAll('.hero-slide-card input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                updateHeroSlideData(this);
            });
        });
    }
    
    function updateHeroSlideData(element) {
        const slideCard = element.closest('.hero-slide-card');
        const slideId = slideCard.dataset.slideId;
        const field = element.dataset.field;
        const value = element.type === 'checkbox' ? element.checked : element.value;
        
        // Obtener slides actuales
        let heroSlides = JSON.parse(localStorage.getItem('heroSlides') || '[]');
        const slideIndex = heroSlides.findIndex(slide => slide.id == slideId);
        
        if (slideIndex !== -1) {
            heroSlides[slideIndex][field] = value;
            localStorage.setItem('heroSlides', JSON.stringify(heroSlides));
            
            // Actualizar imagen en tiempo real si es el campo de imagen
            if (field === 'image') {
                const img = slideCard.querySelector('.hero-slide-image img');
                if (img) {
                    img.src = value;
                }
            }
        }
    }
    
    
    function syncWithIndex() {
        console.log('🔄 Sincronizando configuración con index...');
        console.log('📊 Configuración actual:', heroConfig);
        
        // Obtener slides del hero desde localStorage
        const heroSlides = JSON.parse(localStorage.getItem('heroSlides') || '[]');
        console.log('📋 Slides del hero encontrados:', heroSlides.length, 'slides');
        console.log('📋 Slides del hero:', heroSlides);
        
        // Mapear slides para el index
        const slidesForIndex = heroSlides.map(slide => ({
            id: slide.id,
            title: slide.title,
            description: slide.description,
            image: slide.image,
            showPedirButton: slide.showPedirButton !== false,
            showWhatsAppButton: slide.showWhatsAppButton !== false,
            whatsappMessage: slide.whatsappMessage || 'Me interesa esta promoción'
        }));
        
        console.log('🎯 Slides mapeados para index:', slidesForIndex);
        
        // Sincronizar configuración con index.html
        const heroPromocionesConfig = {
            visible: heroConfig.visible,
            maxSlides: heroConfig.maxSlides,
            slides: slidesForIndex
        };
        
        console.log('📤 Configuración a enviar:', heroPromocionesConfig);
        
        // Guardar en localStorage para el index
        localStorage.setItem('heroPromocionesConfig', JSON.stringify(heroPromocionesConfig));
        console.log('💾 Configuración guardada en localStorage');
        
        // Enviar mensaje al index si está abierto
        if (window.opener && !window.opener.closed) {
            try {
                window.opener.postMessage({
                    type: 'updateHeroPromociones',
                    config: heroPromocionesConfig,
                    timestamp: Date.now()
                }, '*');
                console.log('✅ Configuración de promociones enviada al index via postMessage');
            } catch (error) {
                console.log('❌ No se pudo enviar mensaje al index:', error);
            }
        } else {
            console.log('ℹ️ No hay ventana index abierta, usando localStorage');
        }
        
        // También usar localStorage como fallback
        localStorage.setItem('heroPromocionesUpdate', JSON.stringify({
            type: 'updateHeroPromociones',
            config: heroPromocionesConfig,
            timestamp: Date.now()
        }));
        console.log('🔄 Fallback localStorage configurado');
    }
    
    function publishHeroConfig() {
        // Regenerar las cards de slides para asegurar que estén actualizadas
        regenerateHeroSlidesCards();
        
        // Guardar configuración del hero
        saveHeroConfigSilent();
        
        // Sincronizar con index.html
        syncWithIndex();
        
        window.dashboard.showToast('Cambios publicados exitosamente', 'success');
        console.log('Configuración de slides publicada');
    }
    
    // ===================================
    // UTILIDADES
    // ===================================
    function addPromocionCardListeners() {
        // Los event listeners se agregan mediante onclick en el HTML generado
    }
    
    // ===================================
    // FUNCIONES PÚBLICAS
    // ===================================
    window.loadPromocionesModule = function() {
        console.log('Cargando módulo de promociones...');
        loadPromociones();
        loadHeroConfig();
    };
    
    // Funciones globales para los botones
    window.editPromocion = editPromocion;
    window.deletePromocion = deletePromocion;
    window.confirmDeletePromocion = confirmDeletePromocion;
    window.showNewPromocionForm = showNewPromocionForm;
    window.movePromocionUp = movePromocionUp;
    window.movePromocionDown = movePromocionDown;
    window.saveHeroConfig = saveHeroConfig;
    window.publishHeroConfig = publishHeroConfig;
    window.closePromocionModal = closePromocionModal;
    
    // ===================================
    // INICIALIZACIÓN
    // ===================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
