/* ===================================
   MÓDULO CONFIGURACIÓN - JAVASCRIPT
   =================================== */

(function() {
    'use strict';
    
    console.log('Módulo Configuración cargado');
    
    // Variables del módulo
    let configData = {};
    let currentSection = 'general';
    
    // Elementos del DOM
    const configContent = document.getElementById('configContent');
    
    // ===================================
    // INICIALIZACIÓN
    // ===================================
    function init() {
        setupEventListeners();
        loadConfigData();
        console.log('Módulo Configuración inicializado');
    }
    
    // ===================================
    // EVENT LISTENERS
    // ===================================
    function setupEventListeners() {
        // Los event listeners se configurarán dinámicamente
    }
    
    // ===================================
    // CARGA DE DATOS
    // ===================================
    function loadConfigData() {
        console.log('Cargando configuración...');
        
        const savedConfig = localStorage.getItem('dashboardConfig');
        if (savedConfig) {
            try {
                configData = JSON.parse(savedConfig);
            } catch (error) {
                console.error('Error al cargar configuración:', error);
                configData = getDefaultConfig();
            }
        } else {
            configData = getDefaultConfig();
            saveConfigData();
        }
        
        renderConfig();
        inicializarVisibilidadDesdeConfig();
    }
    
    function getDefaultConfig() {
        return {
            business: {
                whatsapp: '',
                address: '',
                email: ''
            },
            design: {
                businessSlogan: '',
                logoType: 'text', // 'text' o 'image'
                logoImage: '',
                logoText: '',
                // Paleta de colores profesional
                primaryColor: '#e74c3c',
                secondaryColor: '#2c3e50',
                accentColor: '#f39c12',
                successColor: '#27ae60',
                warningColor: '#f39c12',
                textPrimaryColor: '#2c3e50',
                textSecondaryColor: '#7f8c8d',
                backgroundColor: '#ffffff',
                borderColor: '#e0e0e0'
            },
            header: {
                showCart: false,
                showUser: true,
                showSearch: true
            },
            menu: {
                showPedidos: false,
                showCatalogo: true,
                showMenu: true,
                showDeseo: true,
                showAsesoria: false
            },
            admin: {
                password: 'admin123',
                email: 'admin@damasco.com'
            }
        };
    }
    
    function saveConfigData() {
        try {
            localStorage.setItem('dashboardConfig', JSON.stringify(configData));
            console.log('Configuración guardada');
        } catch (error) {
            console.error('Error al guardar configuración:', error);
        }
    }
    
    // ===================================
    // RENDERIZADO
    // ===================================
    function renderConfig() {
        if (!configContent) return;
        
        const configHTML = `
            <div class="config-content">
                ${renderGeneralConfig()}
                ${renderDesignConfig()}
                ${renderHeaderConfig()}
                ${renderAdminConfig()}
            </div>
        `;
        
        configContent.innerHTML = configHTML;
        
        // Configurar event listeners
        setupConfigEventListeners();
        
        // Configurar swatches de colores
        setTimeout(setupColorSwatches, 100);
    }
    
    function renderGeneralConfig() {
        const { business } = configData;
        
        return `
            <div class="config-section">
                <div class="section-header">
                    <div>
                        <h3 class="section-title">
                            <i class="fas fa-phone"></i>
                            Información de Contacto
                        </h3>
                        <p class="section-description">Configura los datos de contacto de tu negocio</p>
                    </div>
                </div>
                
                <form class="config-form" id="businessForm">
                    
                    <div class="form-group-config">
                        <label for="businessWhatsApp" class="form-label-config">WhatsApp</label>
                        <input type="tel" id="businessWhatsApp" name="whatsapp" class="form-control-config" 
                               value="${business.whatsapp}" placeholder="Ej: +1234567890">
                        <small class="form-help whatsapp-help">Número centralizado para todos los botones de WhatsApp</small>
                    </div>
                    
                    <div class="form-group-config">
                        <label for="businessEmail" class="form-label-config">Email</label>
                        <input type="email" id="businessEmail" name="email" class="form-control-config" 
                               value="${business.email}">
                    </div>
                    
                    <div class="form-group-config">
                        <label for="businessAddress" class="form-label-config">Dirección</label>
                        <textarea id="businessAddress" name="address" class="form-control-config" 
                                  rows="3">${business.address}</textarea>
                    </div>
                    
                    <div class="form-actions-config">
                        <button type="button" class="btn btn-secondary" onclick="resetBusinessConfig()">
                            <i class="fas fa-undo"></i>
                            Restaurar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i>
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    function renderDesignConfig() {
        const { design } = configData;
        
        return `
            <div class="config-section">
                <div class="section-header">
                    <div>
                        <h3 class="section-title">
                            <i class="fas fa-palette"></i>
                            Diseño y Colores
                        </h3>
                        <p class="section-description">Personaliza los colores y el logo de tu negocio</p>
                    </div>
                </div>
                
                <form class="config-form" id="designForm">
                    <div class="form-group-config">
                        <label class="form-label-config">Tipo de Logo</label>
                        <div style="display: flex; gap: 20px; margin-top: 10px;">
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="radio" name="logoType" value="text" ${design.logoType === 'text' ? 'checked' : ''}>
                                <span>Texto</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="radio" name="logoType" value="image" ${design.logoType === 'image' ? 'checked' : ''}>
                                <span>Imagen</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group-config" id="logoTextGroup" style="${design.logoType === 'image' ? 'display: none;' : ''}">
                        <label for="logoText" class="form-label-config">Texto del Logo</label>
                        <input type="text" id="logoText" name="logoText" class="form-control-config" 
                               value="${design.logoText}">
                    </div>
                    
                    <div class="form-group-config">
                        <label for="businessSlogan" class="form-label-config">Eslogan o Subtítulo</label>
                        <input type="text" id="businessSlogan" name="businessSlogan" class="form-control-config" 
                               value="${design.businessSlogan}">
                    </div>
                    
                    <div class="form-group-config" id="logoImageGroup" style="${design.logoType === 'text' ? 'display: none;' : ''}">
                        <label class="form-label-config">Imagen del Logo</label>
                        <div class="image-upload-config" id="logoUploadArea">
                            <div class="image-upload-icon-config">
                                <i class="fas fa-cloud-upload-alt"></i>
                            </div>
                            <div class="image-upload-text-config">Arrastra una imagen aquí o haz clic para seleccionar</div>
                            <div class="image-upload-hint-config">Formatos: JPG, PNG, SVG. Tamaño máximo: 2MB</div>
                            <input type="file" id="logoImage" name="logoImage" accept="image/*" style="display: none;">
                        </div>
                        <div class="image-preview-config" id="logoPreview" style="display: none;">
                            <img id="previewLogoImage" src="" alt="Vista previa del logo">
                        </div>
                    </div>
                    
                    <!-- PALETA DE COLORES COMPACTA -->
                    <div class="color-palette-compact">
                        <div class="palette-header">
                            <h4 class="palette-title">
                                <i class="fas fa-palette"></i>
                            Colores del Tema
                        </h4>
                            <button type="button" class="btn-advanced-colors" id="btnAdvancedColors" onclick="toggleAdvancedColors()">
                                <i class="fas fa-cog"></i>
                                Avanzado
                            </button>
                        </div>
                        
                        <!-- COLORES PRINCIPALES COMPACTOS -->
                        <div class="color-picker-compact">
                            <div class="color-item primary">
                                <label class="color-label">Primario</label>
                                <div class="color-swatch" style="background-color: ${design.primaryColor}"></div>
                                <span class="color-value">${design.primaryColor}</span>
                                <input type="color" id="primaryColor" name="primaryColor" class="color-input-hidden" 
                                   value="${design.primaryColor}">
                            </div>
                            
                            <div class="color-item secondary">
                                <label class="color-label">Secundario</label>
                                <div class="color-swatch" style="background-color: ${design.secondaryColor}"></div>
                                <span class="color-value">${design.secondaryColor}</span>
                                <input type="color" id="secondaryColor" name="secondaryColor" class="color-input-hidden" 
                                   value="${design.secondaryColor}">
                            </div>
                            
                            <div class="color-item accent">
                                <label class="color-label">Acento</label>
                                <div class="color-swatch" style="background-color: ${design.accentColor}"></div>
                                <span class="color-value">${design.accentColor}</span>
                                <input type="color" id="accentColor" name="accentColor" class="color-input-hidden" 
                                   value="${design.accentColor}">
                            </div>
                        </div>
                        
                        <!-- PREVIEW DE COLORES SELECCIONADOS -->
                        <div class="color-preview-compact">
                            <div class="preview-circle" style="background-color: ${design.primaryColor}"></div>
                            <div class="preview-circle" style="background-color: ${design.secondaryColor}"></div>
                            <div class="preview-circle" style="background-color: ${design.accentColor}"></div>
                        </div>
                        
                        <!-- COLORES AVANZADOS (OCULTOS POR DEFECTO) -->
                        <div class="advanced-colors" id="advancedColors" style="display: none;">
                            <div class="advanced-colors-grid">
                                <div class="advanced-color-item">
                                    <label class="advanced-label">Éxito</label>
                                    <input type="color" id="successColor" name="successColor" class="advanced-input" 
                                           value="${design.successColor || '#27ae60'}">
                                </div>
                                <div class="advanced-color-item">
                                    <label class="advanced-label">Alerta</label>
                                    <input type="color" id="warningColor" name="warningColor" class="advanced-input" 
                                           value="${design.warningColor || '#f39c12'}">
                                </div>
                                <div class="advanced-color-item">
                                    <label class="advanced-label">Texto</label>
                                    <input type="color" id="textPrimaryColor" name="textPrimaryColor" class="advanced-input" 
                                           value="${design.textPrimaryColor || '#2c3e50'}">
                                </div>
                                <div class="advanced-color-item">
                                    <label class="advanced-label">Fondo</label>
                                    <input type="color" id="backgroundColor" name="backgroundColor" class="advanced-input" 
                                           value="${design.backgroundColor || '#ffffff'}">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions-config">
                        <button type="button" class="btn btn-secondary" onclick="resetDesignConfig()">
                            <i class="fas fa-undo"></i>
                            Restaurar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i>
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    function renderHeaderConfig() {
        const { header } = configData;
        
        return `
            <div class="config-section">
                <div class="section-header">
                    <div>
                        <h3 class="section-title">
                            <i class="fas fa-header"></i>
                            mostrar y ocultar carrito y pedidos
                        </h3>
                    </div>
                </div>
                
                <form class="config-form" id="headerForm">
                    <div class="icons-config">
                        <div class="icons-grid">
                            <div class="icon-config-item">
                                <div class="icon-info">
                                    <div class="icon-preview">
                                        <i class="fas fa-shopping-cart"></i>
                                    </div>
                                    <div class="icon-details">
                                        <h4>Carrito de Compras</h4>
                                        <p>Icono del carrito en el header</p>
                                    </div>
                                </div>
                                <div class="icon-toggle ${header.showCart ? 'active' : ''}" 
                                     onclick="toggleHeaderIcon('cart')">
                                </div>
                            </div>
                            
                            
                            <div class="icon-config-item">
                                <div class="icon-info">
                                    <div class="icon-preview">
                                        <i class="fas fa-tag"></i>
                                    </div>
                                    <div class="icon-details">
                                        <h4>Pedidos</h4>
                                        <p>Gestión de pedidos</p>
                                    </div>
                                </div>
                                <div class="icon-toggle ${header.showPedidos ? 'active' : ''}" 
                                     onclick="toggleHeaderIcon('pedidos')">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions-config">
                        <button type="button" class="btn btn-secondary" onclick="resetHeaderConfig()">
                            <i class="fas fa-undo"></i>
                            Restaurar
                        </button>
                        <button type="button" class="btn btn-primary" onclick="saveHeaderConfig()">
                            <i class="fas fa-save"></i>
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    
    function renderAdminConfig() {
        const { admin } = configData;
        
        return `
            <div class="config-section">
                <div class="section-header">
                    <div>
                        <h3 class="section-title">
                            <i class="fas fa-shield-alt"></i>
                            Configuración de Administrador
                        </h3>
                        <p class="section-description">Gestiona la seguridad y acceso al dashboard</p>
                    </div>
                </div>
                
                <form class="config-form" id="adminForm">
                    <div class="form-group-config">
                        <label for="adminEmail" class="form-label-config">Email del Administrador</label>
                        <input type="email" id="adminEmail" name="email" class="form-control-config" 
                               value="${admin.email}">
                    </div>
                    
                    <div class="password-config">
                        <div class="form-group-config">
                            <label for="currentPassword" class="form-label-config">Contraseña Actual</label>
                            <input type="password" id="currentPassword" name="currentPassword" class="form-control-config">
                        </div>
                        
                        <div class="form-group-config">
                            <label for="newPassword" class="form-label-config">Nueva Contraseña</label>
                            <input type="password" id="newPassword" name="newPassword" class="form-control-config">
                        </div>
                        
                        <div class="form-group-config">
                            <label for="confirmPassword" class="form-label-config">Confirmar Nueva Contraseña</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" class="form-control-config">
                        </div>
                        
                        <div class="password-requirements">
                            <h5>Requisitos de la contraseña:</h5>
                            <ul id="passwordRequirements">
                                <li id="req-length" class="invalid">Mínimo 8 caracteres</li>
                                <li id="req-uppercase" class="invalid">Al menos una mayúscula</li>
                                <li id="req-lowercase" class="invalid">Al menos una minúscula</li>
                                <li id="req-number" class="invalid">Al menos un número</li>
                                <li id="req-special" class="invalid">Al menos un carácter especial</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="form-actions-config">
                        <button type="button" class="btn btn-secondary" onclick="resetAdminConfig()">
                            <i class="fas fa-undo"></i>
                            Restaurar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i>
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    
    // ===================================
    // EVENT LISTENERS
    // ===================================
    function setupConfigEventListeners() {
        // Formulario de negocio
        const businessForm = document.getElementById('businessForm');
        if (businessForm) {
            businessForm.addEventListener('submit', handleBusinessSubmit);
        }
        
        // Formulario de diseño
        const designForm = document.getElementById('designForm');
        if (designForm) {
            designForm.addEventListener('submit', handleDesignSubmit);
        }
        
        // Formulario de administrador
        const adminForm = document.getElementById('adminForm');
        if (adminForm) {
            adminForm.addEventListener('submit', handleAdminSubmit);
        }
        
        // Tipo de logo
        const logoTypeRadios = document.querySelectorAll('input[name="logoType"]');
        logoTypeRadios.forEach(radio => {
            radio.addEventListener('change', handleLogoTypeChange);
        });
        
        // Campos de texto para cambio en tiempo real (configurar después de render)
        setTimeout(() => {
            const logoTextInput = document.getElementById('logoText');
            const businessSloganInput = document.getElementById('businessSlogan');
            
            if (logoTextInput) {
                logoTextInput.addEventListener('input', handleLogoTextChange);
                console.log('Event listener agregado a logoText');
            }
            
            if (businessSloganInput) {
                businessSloganInput.addEventListener('input', handleBusinessSloganChange);
                console.log('Event listener agregado a businessSlogan');
            }
        }, 100);
        
        // Upload de logo
        const logoUploadArea = document.getElementById('logoUploadArea');
        const logoImage = document.getElementById('logoImage');
        if (logoUploadArea && logoImage) {
            logoUploadArea.addEventListener('click', () => logoImage.click());
            logoImage.addEventListener('change', handleLogoUpload);
        }
        
        // Selectores de color
        const colorInputs = document.querySelectorAll('.color-picker-input');
        colorInputs.forEach(input => {
            input.addEventListener('change', handleColorChange);
        });
        
        // Validación de contraseña
        const newPassword = document.getElementById('newPassword');
        if (newPassword) {
            newPassword.addEventListener('input', validatePassword);
        }
    }
    
    // ===================================
    // HANDLERS DE FORMULARIOS
    // ===================================
    function handleBusinessSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const businessData = {
            whatsapp: formData.get('whatsapp'),
            email: formData.get('email'),
            address: formData.get('address')
        };
        
        
        configData.business = { ...configData.business, ...businessData };
        saveConfigData();
        renderConfig();
        
        window.dashboard.showToast('Configuración del negocio guardada', 'success');
    }
    
    function handleDesignSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const designData = {
            businessSlogan: formData.get('businessSlogan'),
            logoType: formData.get('logoType'),
            logoText: formData.get('logoText'),
            // Colores principales
            primaryColor: formData.get('primaryColor'),
            secondaryColor: formData.get('secondaryColor'),
            // Colores de acento
            accentColor: formData.get('accentColor'),
            successColor: formData.get('successColor'),
            warningColor: formData.get('warningColor'),
            // Colores neutros
            textPrimaryColor: formData.get('textPrimaryColor'),
            textSecondaryColor: formData.get('textSecondaryColor'),
            backgroundColor: formData.get('backgroundColor'),
            borderColor: formData.get('borderColor')
        };
        
        configData.design = { ...configData.design, ...designData };
        saveConfigData();
        renderConfig();
        
        // Aplicar colores en tiempo real
        aplicarColoresEnTiempoReal(designData);
        
        window.dashboard.showToast('Configuración de diseño guardada', 'success');
    }
    
    function handleAdminSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');
        const email = formData.get('email');
        
        // Validar contraseña actual
        if (currentPassword && currentPassword !== configData.admin.password) {
            window.dashboard.showToast('La contraseña actual es incorrecta', 'error');
            return;
        }
        
        // Validar nueva contraseña
        if (newPassword && !isValidPassword(newPassword)) {
            window.dashboard.showToast('La nueva contraseña no cumple con los requisitos', 'error');
            return;
        }
        
        if (newPassword && newPassword !== confirmPassword) {
            window.dashboard.showToast('Las contraseñas no coinciden', 'error');
            return;
        }
        
        // Actualizar datos
        if (email) {
            configData.admin.email = email;
        }
        
        if (newPassword) {
            configData.admin.password = newPassword;
        }
        
        saveConfigData();
        renderConfig();
        
        window.dashboard.showToast('Configuración de administrador guardada', 'success');
    }
    
    // ===================================
    // HANDLERS DE EVENTOS
    // ===================================
    function handleLogoTypeChange(e) {
        const logoType = e.target.value;
        const logoTextGroup = document.getElementById('logoTextGroup');
        const logoImageGroup = document.getElementById('logoImageGroup');
        
        if (logoType === 'text') {
            logoTextGroup.style.display = 'block';
            logoImageGroup.style.display = 'none';
        } else {
            logoTextGroup.style.display = 'none';
            logoImageGroup.style.display = 'block';
        }
    }
    
    function handleLogoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
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
            const previewImage = document.getElementById('previewLogoImage');
            const logoPreview = document.getElementById('logoPreview');
            
            if (previewImage && logoPreview) {
                previewImage.src = e.target.result;
                logoPreview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
    
    function handleColorChange(e) {
        const color = e.target.value;
        const previewBox = e.target.nextElementSibling.querySelector('.color-preview-box');
        const previewText = e.target.nextElementSibling.querySelector('.color-preview-text');
        
        if (previewBox) {
            previewBox.style.backgroundColor = color;
        }
        if (previewText) {
            previewText.textContent = color;
        }
        
        // Actualizar preview de colores compacto
        updateColorPreview();
    }
    
    // Función para actualizar el preview de colores
    function updateColorPreview() {
        const primaryColor = document.getElementById('primaryColor')?.value || '#e74c3c';
        const secondaryColor = document.getElementById('secondaryColor')?.value || '#2c3e50';
        const accentColor = document.getElementById('accentColor')?.value || '#f39c12';
        
        // Actualizar swatches
        const swatches = document.querySelectorAll('.color-swatch');
        if (swatches[0]) swatches[0].style.backgroundColor = primaryColor;
        if (swatches[1]) swatches[1].style.backgroundColor = secondaryColor;
        if (swatches[2]) swatches[2].style.backgroundColor = accentColor;
        
        // Actualizar preview circles
        const circles = document.querySelectorAll('.preview-circle');
        if (circles[0]) circles[0].style.backgroundColor = primaryColor;
        if (circles[1]) circles[1].style.backgroundColor = secondaryColor;
        if (circles[2]) circles[2].style.backgroundColor = accentColor;
        
        // Actualizar valores de texto
        const colorValues = document.querySelectorAll('.color-value');
        if (colorValues[0]) colorValues[0].textContent = primaryColor;
        if (colorValues[1]) colorValues[1].textContent = secondaryColor;
        if (colorValues[2]) colorValues[2].textContent = accentColor;
    }
    
    // Event listeners para swatches de colores
    function setupColorSwatches() {
        document.querySelectorAll('.color-swatch').forEach((swatch, index) => {
            // Remover listeners anteriores si existen
            swatch.removeEventListener('click', swatch._clickHandler);
            
            // Crear nuevo handler
            swatch._clickHandler = function() {
                const colorInputs = ['primaryColor', 'secondaryColor', 'accentColor'];
                const colorInput = document.getElementById(colorInputs[index]);
                if (colorInput) {
                    colorInput.click();
                }
            };
            
            // Agregar el listener
            swatch.addEventListener('click', swatch._clickHandler);
        });
    }
    
    // Configurar swatches cuando se carga la página
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(setupColorSwatches, 100);
    });
    
    
    // ===================================
    // CONTROL DE VISIBILIDAD EN INDEX
    // ===================================
    function controlarVisibilidadIndex(icon, mostrar) {
        // Guardar en localStorage PRIMERO para persistencia inmediata
        const visibilityData = JSON.parse(localStorage.getItem('headerVisibility') || '{}');
        visibilityData[icon] = mostrar;
        localStorage.setItem('headerVisibility', JSON.stringify(visibilityData));
        
        // También sincronizar con configData
        if (icon === 'cart') {
            configData.header.showCart = mostrar;
        } else if (icon === 'pedidos') {
            configData.menu.showPedidos = mostrar;
        }
        saveConfigData();
        
        // Solo ejecutar si estamos en el dashboard
        if (window.location.pathname.includes('dashboard.html')) {
            // Enviar mensaje al index.html si está abierto (comunicación directa)
            if (window.opener && !window.opener.closed) {
                try {
                    window.opener.postMessage({
                        type: 'toggleVisibility',
                        icon: icon,
                        mostrar: mostrar,
                        timestamp: Date.now()
                    }, '*');
                } catch (error) {
                    console.log('No se pudo enviar mensaje al index:', error);
                }
            }
        }
        
        // Si se está ocultando el carrito, también ocultar los botones de agregar al carrito
        if (icon === 'cart') {
            console.log('Enviando mensaje de botones de carrito:', mostrar);
            
            // Intentar comunicación directa primero
            if (window.opener && !window.opener.closed) {
                try {
                    const message = {
                        type: 'toggleCartButtons',
                        mostrar: mostrar,
                        timestamp: Date.now()
                    };
                    console.log('Enviando mensaje toggleCartButtons:', message);
                    window.opener.postMessage(message, '*');
                } catch (error) {
                    console.log('No se pudo enviar mensaje de botones al index:', error);
                }
            } else {
                console.log('No hay ventana index abierta, usando localStorage');
            }
            
            // Usar localStorage como respaldo
            const cartButtonsData = {
                mostrar: mostrar,
                timestamp: Date.now(),
                type: 'toggleCartButtons'
            };
            localStorage.setItem('cartButtonsUpdate', JSON.stringify(cartButtonsData));
            console.log('Datos de botones de carrito guardados en localStorage:', cartButtonsData);
        }
        
        // Si se está ocultando/mostrando pedidos, controlar en el index
        if (icon === 'pedidos') {
            console.log('Enviando mensaje de pedidos:', mostrar);
            
            // Intentar comunicación directa primero
            if (window.opener && !window.opener.closed) {
                try {
                    const message = {
                        type: 'toggleVisibility',
                        icon: 'pedidos',
                        mostrar: mostrar,
                        timestamp: Date.now()
                    };
                    console.log('Enviando mensaje toggleVisibility para pedidos:', message);
                    window.opener.postMessage(message, '*');
                } catch (error) {
                    console.log('No se pudo enviar mensaje de pedidos al index:', error);
                }
            } else {
                console.log('No hay ventana index abierta, usando localStorage');
            }
            
            // Usar localStorage como respaldo
            const pedidosData = {
                mostrar: mostrar,
                timestamp: Date.now(),
                type: 'toggleVisibility',
                icon: 'pedidos'
            };
            localStorage.setItem('pedidosUpdate', JSON.stringify(pedidosData));
            console.log('Datos de pedidos guardados en localStorage:', pedidosData);
        }
    }
    
    // Función para inicializar configuración de visibilidad desde configData
    function inicializarVisibilidadDesdeConfig() {
        // Sincronizar configData con headerVisibility
        const visibilityData = {
            cart: configData.header.showCart,
            pedidos: configData.menu.showPedidos
        };
        localStorage.setItem('headerVisibility', JSON.stringify(visibilityData));
        
        console.log('Configuración de visibilidad inicializada:', visibilityData);
    }
    
    // Función para aplicar visibilidad desde localStorage (para cuando se carga el index)
    function aplicarVisibilidadDesdeConfig() {
        const visibilityData = JSON.parse(localStorage.getItem('headerVisibility') || '{}');
        
        // Controlar carrito
        const btnCarrito = document.getElementById('btnCarrito');
        if (btnCarrito) {
            btnCarrito.style.display = visibilityData.cart ? 'block' : 'none';
        }
        
        // Controlar pedidos en menú inferior
        const btnPedidos = document.querySelector('[data-module="pedidos"]');
        if (btnPedidos) {
            btnPedidos.style.display = visibilityData.pedidos ? 'flex' : 'none';
        }
        
        // Controlar botones de agregar al carrito
        if (typeof visibilityData.cart !== 'undefined') {
            const cartButtons = document.querySelectorAll('.btn-pedir, .modal-btn-pedir');
            cartButtons.forEach(btn => {
                btn.style.display = visibilityData.cart ? 'block' : 'none';
            });
        }
    }
    
    // ===================================
    // FUNCIONES DE CAMBIO EN TIEMPO REAL
    // ===================================
    function handleLogoTextChange() {
        const logoText = document.getElementById('logoText').value;
        configData.design.logoText = logoText;
        
        // Aplicar cambio en tiempo real al index
        aplicarCambioLogo('text', logoText, null);
        
        // Guardar datos
        saveConfigData();
    }
    
    function handleBusinessSloganChange() {
        const businessSlogan = document.getElementById('businessSlogan').value;
        configData.design.businessSlogan = businessSlogan;
        
        // Aplicar cambio en tiempo real al index
        aplicarCambioLogo('slogan', null, businessSlogan);
        
        // Guardar datos
        saveConfigData();
    }
    
    function aplicarCambioLogo(tipo, logoText, slogan) {
        console.log('Aplicando cambio de logo:', { tipo, logoText, slogan });
        
        // Guardar en localStorage para persistencia
        const logoData = JSON.parse(localStorage.getItem('logoConfig') || '{}');
        
        if (tipo === 'text' && logoText !== null) {
            logoData.logoText = logoText;
            console.log('Logo text guardado:', logoText);
        }
        if (tipo === 'slogan' && slogan !== null) {
            logoData.slogan = slogan;
            console.log('Slogan guardado:', slogan);
        }
        
        localStorage.setItem('logoConfig', JSON.stringify(logoData));
        console.log('Logo data guardado en localStorage:', logoData);
        
        // ACTUALIZAR DASHBOARD EN TIEMPO REAL
        actualizarDashboardLogo(logoData.logoText || configData.design.logoText, 
                               logoData.slogan || configData.design.businessSlogan);
        
        // Enviar mensaje al index si está abierto
        if (window.location.pathname.includes('dashboard.html')) {
            if (window.opener && !window.opener.closed) {
                try {
                    const message = {
                        type: 'updateLogo',
                        logoText: logoData.logoText || configData.design.logoText,
                        slogan: logoData.slogan || configData.design.businessSlogan,
                        logoType: configData.design.logoType,
                        logoImage: configData.design.logoImage,
                        timestamp: Date.now()
                    };
                    
                    console.log('Enviando mensaje al index:', message);
                    window.opener.postMessage(message, '*');
                } catch (error) {
                    console.log('No se pudo enviar mensaje al index:', error);
                }
            } else {
                console.log('Index no está abierto, usando localStorage como fallback');
            }
        }
        
        // Fallback: usar localStorage para sincronización
        const logoUpdateData = {
            type: 'updateLogo',
            logoText: logoData.logoText || configData.design.logoText,
            slogan: logoData.slogan || configData.design.businessSlogan,
            logoType: configData.design.logoType,
            logoImage: configData.design.logoImage,
            timestamp: Date.now()
        };
        
        localStorage.setItem('logoUpdate', JSON.stringify(logoUpdateData));
        console.log('Logo update guardado en localStorage:', logoUpdateData);
    }
    
    // NUEVA FUNCIÓN: Actualizar logo del dashboard en tiempo real
    function actualizarDashboardLogo(logoText, slogan) {
        const dashboardTitle = document.querySelector('.dashboard-title');
        const dashboardSubtitle = document.querySelector('.dashboard-subtitle');
        
        if (dashboardTitle && logoText) {
            dashboardTitle.textContent = logoText;
            console.log('Dashboard title actualizado:', logoText);
        }
        
        if (dashboardSubtitle && slogan) {
            dashboardSubtitle.textContent = slogan;
            console.log('Dashboard subtitle actualizado:', slogan);
        }
    }
    
    // ===================================
    // FUNCIONES DE TOGGLE
    // ===================================
    function toggleHeaderIcon(icon) {
        const toggle = event.target;
        const isActive = toggle.classList.contains('active');
        const nuevoEstado = !isActive;
        
        // Cambio visual inmediato
        if (isActive) {
            toggle.classList.remove('active');
        } else {
            toggle.classList.add('active');
        }
        
        // Actualizar datos
        configData.header[`show${icon.charAt(0).toUpperCase() + icon.slice(1)}`] = nuevoEstado;
        
        // Controlar visibilidad en index.html INMEDIATAMENTE
        controlarVisibilidadIndex(icon, nuevoEstado);
        
        // Guardar datos (sin re-render)
        saveConfigData();
    }
    
    function toggleMenuButton(button) {
        const toggle = event.target;
        const isActive = toggle.classList.contains('active');
        
        if (isActive) {
            toggle.classList.remove('active');
            configData.menu[`show${button.charAt(0).toUpperCase() + button.slice(1)}`] = false;
        } else {
            toggle.classList.add('active');
            configData.menu[`show${button.charAt(0).toUpperCase() + button.slice(1)}`] = true;
        }
        
        saveConfigData();
        renderConfig();
    }
    
    // ===================================
    // VALIDACIÓN DE CONTRASEÑA
    // ===================================
    function validatePassword(e) {
        const password = e.target.value;
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        Object.keys(requirements).forEach(req => {
            const element = document.getElementById(`req-${req}`);
            if (element) {
                if (requirements[req]) {
                    element.classList.remove('invalid');
                    element.classList.add('valid');
                } else {
                    element.classList.remove('valid');
                    element.classList.add('invalid');
                }
            }
        });
    }
    
    function isValidPassword(password) {
        return password.length >= 8 &&
               /[A-Z]/.test(password) &&
               /[a-z]/.test(password) &&
               /\d/.test(password) &&
               /[!@#$%^&*(),.?":{}|<>]/.test(password);
    }
    
    // ===================================
    // FUNCIONES DE RESET
    // ===================================
    function resetBusinessConfig() {
        configData.business = getDefaultConfig().business;
        saveConfigData();
        renderConfig();
        window.dashboard.showToast('Configuración de contacto restaurada', 'info');
    }
    
    function resetDesignConfig() {
        configData.design = getDefaultConfig().design;
        saveConfigData();
        renderConfig();
        window.dashboard.showToast('Configuración de diseño restaurada', 'info');
    }
    
    function resetHeaderConfig() {
        configData.header = getDefaultConfig().header;
        saveConfigData();
        renderConfig();
        window.dashboard.showToast('Configuración del header restaurada', 'info');
    }
    
    function resetMenuConfig() {
        configData.menu = getDefaultConfig().menu;
        saveConfigData();
        renderConfig();
        window.dashboard.showToast('Configuración del menú restaurada', 'info');
    }
    
    function resetAdminConfig() {
        configData.admin = getDefaultConfig().admin;
        saveConfigData();
        renderConfig();
        window.dashboard.showToast('Configuración de administrador restaurada', 'info');
    }
    
    // ===================================
    // FUNCIONES DE GUARDADO
    // ===================================
    function saveHeaderConfig() {
        saveConfigData();
        window.dashboard.showToast('Configuración del header guardada', 'success');
    }
    
    function saveMenuConfig() {
        saveConfigData();
        window.dashboard.showToast('Configuración del menú guardada', 'success');
    }
    
    // ===================================
    // FUNCIONES PÚBLICAS
    // ===================================
    window.loadConfiguracionModule = function() {
        console.log('Cargando módulo de configuración...');
        loadConfigData();
    };
    
    // ===================================
    // FUNCIÓN TOGGLE COLORES AVANZADOS
    // ===================================
    function toggleAdvancedColors() {
        const advancedColors = document.getElementById('advancedColors');
        const btnAdvanced = document.getElementById('btnAdvancedColors');
        
        if (advancedColors.style.display === 'none') {
            advancedColors.style.display = 'block';
            btnAdvanced.innerHTML = '<i class="fas fa-cog"></i> Ocultar';
            btnAdvanced.classList.add('active');
        } else {
            advancedColors.style.display = 'none';
            btnAdvanced.innerHTML = '<i class="fas fa-cog"></i> Avanzado';
            btnAdvanced.classList.remove('active');
        }
    }
    
    // Funciones globales
    window.toggleHeaderIcon = toggleHeaderIcon;
    window.toggleMenuButton = toggleMenuButton;
    window.toggleAdvancedColors = toggleAdvancedColors;
    window.resetBusinessConfig = resetBusinessConfig;
    window.resetDesignConfig = resetDesignConfig;
    window.resetHeaderConfig = resetHeaderConfig;
    window.resetMenuConfig = resetMenuConfig;
    window.resetAdminConfig = resetAdminConfig;
    window.saveHeaderConfig = saveHeaderConfig;
    window.aplicarVisibilidadDesdeConfig = aplicarVisibilidadDesdeConfig;
    window.saveMenuConfig = saveMenuConfig;
    
    // ===================================
    // FUNCIÓN CENTRALIZADA DE WHATSAPP
    // ===================================
    function getWhatsAppLink(message, productId = null) {
        const config = JSON.parse(localStorage.getItem('dashboardConfig') || '{}');
        const whatsapp = config.business?.whatsapp || '';
        
        if (!whatsapp) {
            console.warn('Número de WhatsApp no configurado');
            return '#';
        }
        
        // Limpiar el número (quitar espacios, guiones, etc.)
        const cleanNumber = whatsapp.replace(/\D/g, '');
        
        const baseUrl = `https://wa.me/${cleanNumber}`;
        const params = new URLSearchParams({
            text: message
        });
        
        if (productId) {
            params.append('product', productId);
        }
        
        return `${baseUrl}?${params}`;
    }
    
    // Exponer función globalmente
    window.getWhatsAppLink = getWhatsAppLink;

    // ===================================
    // INICIALIZACIÓN
    // ===================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
