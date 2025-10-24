/* ===================================
   DASHBOARD - JAVASCRIPT GENERAL
   =================================== */

(function() {
    'use strict';
    
    console.log('Dashboard cargado');
    
    // Variables globales
    let currentModule = 'productos';
    let sidebarOpen = false;
    let currentTheme = 'light'; // Tema por defecto
    let notificationsInterval = null; // Control del intervalo de notificaciones
    
    // Elementos del DOM
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('dashboardSidebar');
    const main = document.querySelector('.dashboard-main');
    const navLinks = document.querySelectorAll('.nav-link');
    const moduleSections = document.querySelectorAll('.module-section');
    const modalOverlay = document.getElementById('modalOverlay');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');
    const toastContainer = document.getElementById('toastContainer');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    // Debug: Verificar que los elementos se encuentran
    console.log('Theme toggle element:', themeToggle);
    console.log('Theme icon element:', themeIcon);
    
    // ===================================
    // INICIALIZACIÓN
    // ===================================
    function init() {
        console.log('🚀 Iniciando dashboard...');
        
        try {
            setupEventListeners();
            initTheme();
            
            // Cargar módulo guardado o usar productos por defecto
            const savedModule = localStorage.getItem('dashboardCurrentModule');
            if (savedModule) {
                currentModule = savedModule;
                console.log('Módulo guardado encontrado:', savedModule);
            }
            
            loadModule(currentModule);
            loadDashboardData();
            
            // CORRECCIÓN: Inicializar notificaciones con múltiples intentos
            console.log('🔔 Inicializando notificaciones en init()...');
            initNotificationsWithRetry();
            
            // Mostrar módulo inicial
            switchModule(currentModule);
            
            // CORRECCIÓN: Inicializar módulos específicos con verificación
            console.log('📦 Inicializando módulos específicos...');
            initializeModules();
            
            console.log('✅ Dashboard inicializado correctamente con módulo:', currentModule);
        } catch (error) {
            console.error('❌ Error al inicializar dashboard:', error);
            // Intentar recuperación básica
            setTimeout(() => {
                console.log('🔄 Intentando recuperación...');
                init();
            }, 1000);
        }
    }
    
    // CORRECCIÓN: Función para inicializar módulos de manera segura
    function initializeModules() {
        const modules = [
            { name: 'Productos', fn: window.loadProductosModule },
            { name: 'Categorías', fn: window.loadCategoriasModule },
            { name: 'Métricas', fn: window.loadMetricasModule },
            { name: 'Configuración', fn: window.loadConfiguracionModule },
            { name: 'Clientes', fn: window.loadClientesModule },
            { name: 'Usuarios', fn: window.loadUsuariosModule },
            { name: 'Pedidos', fn: window.loadPedidosModule }
        ];
        
        modules.forEach(module => {
            try {
                if (module.fn && typeof module.fn === 'function') {
                    module.fn();
                    console.log(`✅ Módulo ${module.name} inicializado`);
                } else {
                    console.log(`⚠️ Módulo ${module.name} no disponible`);
                }
            } catch (error) {
                console.error(`❌ Error al inicializar módulo ${module.name}:`, error);
            }
        });
    }
    
    // ===================================
    // EVENT LISTENERS
    // ===================================
    function setupEventListeners() {
        // Toggle sidebar
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', toggleSidebar);
        }
        
        // Botón de tema deshabilitado - solo modo oscuro
        if (themeToggle) {
            console.log('Theme toggle button found but disabled - dark mode only');
        } else {
            console.error('Theme toggle button not found!');
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        console.log('🔍 Buscando botón de logout...');
        console.log('🔍 Elemento encontrado:', !!logoutBtn);
        if (logoutBtn) {
            console.log('🔍 Clases del botón:', logoutBtn.className);
            console.log('🔍 Estilos del botón:', {
                cursor: getComputedStyle(logoutBtn).cursor,
                pointerEvents: getComputedStyle(logoutBtn).pointerEvents,
                opacity: getComputedStyle(logoutBtn).opacity
            });
            logoutBtn.addEventListener('click', handleLogout);
            console.log('✅ Logout button event listener added');
        } else {
            console.error('❌ Logout button not found!');
        }
        
        // Navegación entre módulos
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const module = this.getAttribute('data-module');
                switchModule(module);
            });
        });
        
        // Cerrar modal
        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }
        
        if (modalOverlay) {
            modalOverlay.addEventListener('click', function(e) {
                if (e.target === modalOverlay) {
                    closeModal();
                }
            });
        }
        
        // Cerrar modal con Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                closeModal();
            }
        });
        
        // Cerrar sidebar al hacer clic fuera en móvil
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && sidebarOpen) {
                if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    closeSidebar();
                }
            }
        });
        
        // Redimensionar ventana
        window.addEventListener('resize', handleResize);
    }
    
    // ===================================
    // NAVEGACIÓN ENTRE MÓDULOS
    // ===================================
    function switchModule(moduleName) {
        console.log(`Cambiando a módulo: ${moduleName}`);
        
        // Actualizar navegación
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-module') === moduleName) {
                link.classList.add('active');
            }
        });
        
        // Ocultar todos los módulos
        moduleSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar módulo seleccionado
        const targetModule = document.getElementById(`${moduleName}Module`);
        if (targetModule) {
            targetModule.classList.add('active');
            currentModule = moduleName;
            
            // Guardar módulo actual en localStorage
            localStorage.setItem('dashboardCurrentModule', moduleName);
            console.log('Módulo guardado en localStorage:', moduleName);
            
            // Cargar datos del módulo
            loadModuleData(moduleName);
        }
        
        // Cerrar sidebar en móvil
        if (window.innerWidth <= 768) {
            closeSidebar();
        }
    }
    
    // ===================================
    // CARGA DE MÓDULOS
    // ===================================
    function loadModule(moduleName) {
        console.log(`Cargando módulo: ${moduleName}`);
        
        // Llamar a la función específica del módulo si existe
        const moduleFunction = `load${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Module`;
        console.log(`🔍 Buscando función: ${moduleFunction}`);
        console.log(`🔍 Función existe:`, !!window[moduleFunction]);
        console.log(`🔍 Es función:`, typeof window[moduleFunction] === 'function');
        
        if (window[moduleFunction] && typeof window[moduleFunction] === 'function') {
            console.log(`✅ Ejecutando función: ${moduleFunction}`);
            window[moduleFunction]();
        } else {
            console.log(`❌ Función no encontrada: ${moduleFunction}`);
        }
    }
    
    function loadModuleData(moduleName) {
        // Esta función se puede sobrescribir por cada módulo
        console.log(`Cargando datos del módulo: ${moduleName}`);
        
        // Re-inicializar notificaciones en cada cambio de módulo
        console.log('🔔 Re-inicializando sistema de notificaciones...');
        initNotifications();
        
        // Cargar datos específicos según el módulo
        switch(moduleName) {
            case 'pedidos':
                if (typeof window.loadPedidosModule === 'function') {
                    console.log('Cargando módulo de pedidos...');
                    window.loadPedidosModule();
                }
                break;
            case 'productos':
                if (typeof window.loadProductosModule === 'function') {
                    console.log('Cargando módulo de productos...');
                    window.loadProductosModule();
                }
                break;
            case 'metricas':
                if (typeof window.loadMetricasModule === 'function') {
                    console.log('Cargando módulo de métricas...');
                    window.loadMetricasModule();
                }
                break;
        }
    }
    
    // ===================================
    // SIDEBAR
    // ===================================
    function toggleSidebar() {
        if (window.innerWidth <= 768) {
            sidebarOpen = !sidebarOpen;
            if (sidebarOpen) {
                openSidebar();
            } else {
                closeSidebar();
            }
        }
    }
    
    function openSidebar() {
        sidebar.classList.add('open');
        sidebarOpen = true;
    }
    
    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOpen = false;
    }
    
    // ===================================
    // MODALES
    // ===================================
    function openModal(title, content, size = 'medium') {
        console.log(`🔧 Abriendo modal: ${title}`);
        console.log(`🔧 Tamaño: ${size}`);
        console.log(`🔧 Modal overlay encontrado:`, !!modalOverlay);
        console.log(`🔧 Modal encontrado:`, !!modal);
        
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        
        // Aplicar tamaño
        modal.className = 'modal';
        if (size === 'large') {
            modal.classList.add('modal-large');
        } else if (size === 'small') {
            modal.classList.add('modal-small');
        }
        
        console.log(`🔧 Clases del modal:`, modal.className);
        
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        console.log(`🔧 Clases del overlay:`, modalOverlay.className);
        console.log(`🔧 Estilos del overlay:`, {
            display: getComputedStyle(modalOverlay).display,
            visibility: getComputedStyle(modalOverlay).visibility,
            opacity: getComputedStyle(modalOverlay).opacity,
            zIndex: getComputedStyle(modalOverlay).zIndex
        });
        
        // Enfocar el primer input del modal
        setTimeout(() => {
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
    
    function closeModal() {
        console.log('Cerrando modal');
        
        // Remover clase active
        modalOverlay.classList.remove('active');
        
        // Forzar ocultación inmediata
        modalOverlay.style.display = 'none';
        modalOverlay.style.visibility = 'hidden';
        modalOverlay.style.opacity = '0';
        
        // Restaurar scroll del body
        document.body.style.overflow = '';
        
        // Limpiar contenido del modal
        setTimeout(() => {
            modalTitle.textContent = '';
            modalBody.innerHTML = '';
            
            // Limpiar clases de tamaño
            modal.className = 'modal';
            
            console.log('✅ Modal completamente cerrado y limpiado');
        }, 100);
    }
    
    // ===================================
    // TOAST NOTIFICATIONS
    // ===================================
    function showToast(message, type = 'info', title = '') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        const icon = iconMap[type] || iconMap.info;
        
        toast.innerHTML = `
            <i class="toast-icon ${icon}"></i>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="closeToast(this)">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            closeToast(toast.querySelector('.toast-close'));
        }, 3000);
    }
    
    function closeToast(closeBtn) {
        const toast = closeBtn.closest('.toast');
        if (toast) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }
    
    // ===================================
    // UTILIDADES
    // ===================================
    function handleResize() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('open');
            sidebarOpen = false;
        }
    }
    
    function loadDashboardData() {
        // Cargar datos iniciales del dashboard
        console.log('Cargando datos del dashboard...');
        
        // Verificar si hay datos guardados
        const savedData = localStorage.getItem('dashboardData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                console.log('Datos del dashboard cargados:', data);
            } catch (error) {
                console.error('Error al cargar datos del dashboard:', error);
            }
        }
    }
    
    function saveDashboardData(data) {
        try {
            localStorage.setItem('dashboardData', JSON.stringify(data));
            console.log('Datos del dashboard guardados');
        } catch (error) {
            console.error('Error al guardar datos del dashboard:', error);
        }
    }
    
    // ===================================
    // FUNCIONES DE TEMA
    // ===================================
    function initTheme() {
        console.log('Initializing theme...');
        // Solo modo oscuro, sin toggle
        currentTheme = 'dark';
        console.log('Using dark theme only');
        
        applyTheme(currentTheme);
        updateThemeIcon();
        console.log('Theme initialized:', currentTheme);
    }
    
    function toggleTheme() {
        console.log('Toggle theme clicked, current theme:', currentTheme);
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        console.log('New theme:', currentTheme);
        applyTheme(currentTheme);
        updateThemeIcon();
        localStorage.setItem('dashboardTheme', currentTheme);
        
        // Mostrar notificación
        showToast(`Modo ${currentTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 'success');
    }
    
    function applyTheme(theme) {
        console.log('Applying theme:', theme);
        document.documentElement.setAttribute('data-theme', theme);
        console.log('Document element data-theme:', document.documentElement.getAttribute('data-theme'));
        currentTheme = theme;
    }
    
    function updateThemeIcon() {
        console.log('Updating theme icon - dark mode only');
        
        // Buscar el icono dentro del botón si no se encuentra directamente
        let iconElement = themeIcon;
        if (!iconElement && themeToggle) {
            iconElement = themeToggle.querySelector('i');
            console.log('Found icon inside button:', iconElement);
        }
        
        if (iconElement) {
            // Siempre mostrar luna (modo oscuro)
            iconElement.className = 'fas fa-moon';
            if (themeToggle) themeToggle.title = 'Modo oscuro activo';
            console.log('Icon set to moon (dark mode only)');
        } else {
            console.error('Theme icon element not found!');
        }
    }
    
    // ===================================
    // FUNCIONES DE LOGOUT
    // ===================================
    function handleLogout() {
        console.log('🚪 Iniciando proceso de logout...');
        console.log('🚪 Función handleLogout ejecutada correctamente');
        
        // Mostrar confirmación
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            console.log('✅ Usuario confirmó logout');
            
            // Limpiar datos de sesión
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('dashboardCurrentModule');
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('dashboardConfig');
            localStorage.removeItem('headerVisibility');
            localStorage.removeItem('logoConfig');
            
            // Mostrar mensaje de despedida
            if (window.dashboard && window.dashboard.showToast) {
                window.dashboard.showToast('Sesión cerrada exitosamente', 'success');
            }
            
            // Mostrar modal de login en lugar de redirigir
            setTimeout(() => {
                console.log('🔄 Mostrando modal de login...');
                showLoginModal();
            }, 1500);
        } else {
            console.log('❌ Usuario canceló logout');
        }
    }
    
    function showLoginModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'flex';
            console.log('✅ Modal de login mostrado');
        } else {
            console.error('❌ Modal de login no encontrado');
        }
    }
    
    // ===================================
    // FUNCIONES PÚBLICAS
    // ===================================
    window.dashboard = {
        // Navegación
        switchModule,
        loadModule,
        
        // Modales
        openModal,
        closeModal,
        
        // Notificaciones
        showToast,
        
        // Tema
        toggleTheme,
        getCurrentTheme: () => currentTheme,
        testThemeToggle: () => {
            console.log('Manual test: toggling theme...');
            toggleTheme();
        },
        
        // Utilidades
        saveDashboardData,
        loadDashboardData,
        
        // Estado
        getCurrentModule: () => currentModule,
        isSidebarOpen: () => sidebarOpen,
        
        // Notificaciones
        updateNotifications,
        toggleNotificationsDropdown
    };
    
    // ===================================
    // SISTEMA DE NOTIFICACIONES
    // ===================================
    
    function setupNotificationEventListeners(notificationsBtn, notificationsDropdown) {
        if (!notificationsBtn || !notificationsDropdown) return;
        
        // Click en el botón de notificaciones
        notificationsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNotificationsDropdown();
        });
        
        // Click fuera del dropdown para cerrarlo
        document.addEventListener('click', (e) => {
            if (!notificationsBtn.contains(e.target) && !notificationsDropdown.contains(e.target)) {
                notificationsDropdown.classList.remove('active');
            }
        });
    }
    
    // CORRECCIÓN: Función para crear el botón de notificaciones si no existe
    function createNotificationsButton() {
        console.log('🔧 Creando botón de notificaciones...');
        
        // Buscar el header donde debe ir el botón
        const header = document.querySelector('.dashboard-header');
        if (!header) {
            console.error('❌ No se encontró el header del dashboard');
            return;
        }
        
        // Crear el botón de notificaciones
        const notificationsBtn = document.createElement('button');
        notificationsBtn.id = 'notificationsBtn';
        notificationsBtn.className = 'notifications-btn';
        notificationsBtn.innerHTML = `
            <i class="fas fa-bell"></i>
            <span class="notification-count">0</span>
        `;
        
        // Crear el dropdown de notificaciones
        const notificationsDropdown = document.createElement('div');
        notificationsDropdown.id = 'notificationsDropdown';
        notificationsDropdown.className = 'notifications-dropdown';
        notificationsDropdown.innerHTML = `
            <div class="notifications-header">
                <h4>Notificaciones</h4>
                <button class="btn-clear-all" onclick="clearAllNotifications()">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="notifications-list" id="notificationsList">
                <div class="notification-item">
                    <i class="fas fa-info-circle"></i>
                    <div class="notification-content">
                        <p>Sistema de notificaciones activo</p>
                        <span class="notification-time">Ahora</span>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar al header
        header.appendChild(notificationsBtn);
        header.appendChild(notificationsDropdown);
        
        console.log('✅ Botón de notificaciones creado');
    }
    
    // CORRECCIÓN: Función para inicializar notificaciones con reintentos
    function initNotificationsWithRetry() {
        let attempts = 0;
        const maxAttempts = 5;
        const retryDelay = 200;
        
        function tryInit() {
            attempts++;
            console.log(`🔔 Intento ${attempts}/${maxAttempts} de inicializar notificaciones...`);
            
            initNotifications();
            
            // Verificar si se inicializó correctamente
            const notificationsBtn = document.getElementById('notificationsBtn');
            if (notificationsBtn) {
                console.log('✅ Notificaciones inicializadas correctamente');
                return;
            }
            
            // Si no se pudo inicializar y no hemos alcanzado el máximo de intentos
            if (attempts < maxAttempts) {
                console.log(`⏳ Reintentando en ${retryDelay}ms...`);
                setTimeout(tryInit, retryDelay);
            } else {
                console.error('❌ No se pudo inicializar el sistema de notificaciones después de', maxAttempts, 'intentos');
            }
        }
        
        tryInit();
    }
    
    function initNotifications() {
        console.log('🔔 Iniciando initNotifications()...');
        
        // CORRECCIÓN: Intentar múltiples veces si no se encuentra el botón
        let notificationsBtn = document.getElementById('notificationsBtn');
        const notificationsDropdown = document.getElementById('notificationsDropdown');
        
        console.log('🔍 Elementos encontrados:');
        console.log('- notificationsBtn:', !!notificationsBtn);
        console.log('- notificationsDropdown:', !!notificationsDropdown);
        
        // Si no se encuentra el botón, intentar crearlo
        if (!notificationsBtn) {
            console.log('🔧 Botón de notificaciones no encontrado, creando...');
            createNotificationsButton();
            notificationsBtn = document.getElementById('notificationsBtn');
        }
        
        // Si el botón ya existe, solo configurar event listeners
        if (notificationsBtn) {
            console.log('🔔 Botón de notificaciones ya existe, configurando event listeners...');
            
            // Verificar si el botón es visible
            const rect = notificationsBtn.getBoundingClientRect();
            const styles = getComputedStyle(notificationsBtn);
            console.log('📍 Botón encontrado - Posición:', {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                visible: rect.width > 0 && rect.height > 0,
                display: styles.display,
                visibility: styles.visibility,
                opacity: styles.opacity
            });
            
            // FORZAR VISIBILIDAD con estilos inline
            console.log('🔧 Forzando visibilidad del botón...');
            notificationsBtn.style.cssText = `
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                position: relative !important;
                z-index: 1000 !important;
                background: #e74c3c !important;
                color: white !important;
                border: 2px solid #c0392b !important;
                border-radius: 50% !important;
                width: 40px !important;
                height: 40px !important;
                align-items: center !important;
                justify-content: center !important;
                cursor: pointer !important;
            `;
            
            // Aplicar estilos específicos al contador
            const notificationCount = notificationsBtn.querySelector('.notification-count');
            if (notificationCount) {
                notificationCount.style.cssText = `
                    background: white !important;
                    color: #e74c3c !important;
                    border-radius: 50% !important;
                    width: 18px !important;
                    height: 18px !important;
                    font-size: 10px !important;
                    font-weight: bold !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    position: absolute !important;
                    top: -5px !important;
                    right: -5px !important;
                `;
            }
            
            console.log('✅ Estilos forzados aplicados al botón');
            
            // FORZAR RE-RENDERIZADO del contenedor padre
            const userInfo = document.querySelector('.user-info');
            if (userInfo) {
                console.log('🔄 Forzando re-renderizado del contenedor padre...');
                userInfo.style.display = 'none';
                userInfo.offsetHeight; // Forzar reflow
                userInfo.style.display = '';
                console.log('✨ Re-renderizado del contenedor padre completado');
            }
            
            // Test visual después de aplicar estilos
            setTimeout(() => {
                const newRect = notificationsBtn.getBoundingClientRect();
                console.log('🔍 TEST VISUAL - Posición después de estilos:', {
                    top: newRect.top,
                    left: newRect.left,
                    width: newRect.width,
                    height: newRect.height,
                    visible: newRect.width > 0 && newRect.height > 0
                });
            }, 100);
            
            setupNotificationEventListeners(notificationsBtn, notificationsDropdown);
            updateNotifications();
            return;
        }
        
        // Si el botón no existe, crearlo dinámicamente
        if (!notificationsBtn) {
            console.log('🔧 El botón no existe en el DOM, creándolo dinámicamente...');
            const userInfo = document.querySelector('.user-info');
            console.log('📋 user-info encontrado:', !!userInfo);
            if (userInfo) {
                console.log('👥 Hijos de user-info:', Array.from(userInfo.children).map(child => child.tagName + (child.id ? '#' + child.id : '')));
                
                // Verificar estilos del contenedor user-info
                const userInfoStyles = getComputedStyle(userInfo);
                console.log('🎨 Estilos de user-info:', {
                    display: userInfoStyles.display,
                    visibility: userInfoStyles.visibility,
                    opacity: userInfoStyles.opacity,
                    width: userInfoStyles.width,
                    height: userInfoStyles.height,
                    position: userInfoStyles.position
                });
                notificationsBtn = document.createElement('button');
                notificationsBtn.className = 'notifications-btn';
                notificationsBtn.id = 'notificationsBtn';
                notificationsBtn.title = 'Notificaciones';
                notificationsBtn.innerHTML = `
                    <i class="fas fa-bell"></i>
                    <span class="notification-count" id="notificationCount">0</span>
                `;
                
                // Insertar antes del botón de logout
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn && logoutBtn.parentNode === userInfo) {
                    userInfo.insertBefore(notificationsBtn, logoutBtn);
                    console.log('✅ Botón creado e insertado antes del logout');
                } else {
                    // Si logoutBtn no es hijo directo, agregar al final
                    userInfo.appendChild(notificationsBtn);
                    console.log('✅ Botón creado y agregado al final');
                }
                
                // Verificar posición del botón después de crearlo
                const rect = notificationsBtn.getBoundingClientRect();
                console.log('📍 Posición del botón:', {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    visible: rect.width > 0 && rect.height > 0
                });
            } else {
                console.log('❌ No se pudo encontrar .user-info');
            }
        }
        
        // Debug adicional: buscar todos los botones
        const allButtons = document.querySelectorAll('button');
        console.log('🔍 Total de botones encontrados:', allButtons.length);
        console.log('🔍 Botones con ID:', Array.from(allButtons).map(btn => btn.id).filter(id => id));
        
        // Buscar el botón de diferentes maneras
        const btnById = document.getElementById('notificationsBtn');
        const btnByClass = document.querySelector('.notifications-btn');
        const btnByQuery = document.querySelector('button[id="notificationsBtn"]');
        
        console.log('🔍 Buscar por ID:', !!btnById);
        console.log('🔍 Buscar por clase:', !!btnByClass);
        console.log('🔍 Buscar por query:', !!btnByQuery);
        
        // Verificar si está en el DOM pero oculto
        if (btnByClass) {
            const styles = getComputedStyle(btnByClass);
            console.log('🎨 Estilos del botón:', {
                display: styles.display,
                visibility: styles.visibility,
                opacity: styles.opacity,
                width: styles.width,
                height: styles.height
            });
        }
        
        if (notificationsBtn && notificationsDropdown) {
            setupNotificationEventListeners(notificationsBtn, notificationsDropdown);
            
            // Actualizar notificaciones inicialmente
            updateNotifications();
            
            // Iniciar intervalo solo si no existe
            if (!notificationsInterval) {
                notificationsInterval = setInterval(updateNotifications, 3000);
                console.log('🔄 Intervalo de notificaciones iniciado');
            }
            
            console.log('✅ Sistema de notificaciones inicializado correctamente');
        } else {
            console.log('❌ No se pudieron encontrar los elementos del sistema de notificaciones');
        }
    }
    
    function toggleNotificationsDropdown() {
        const dropdown = document.getElementById('notificationsDropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
            if (dropdown.classList.contains('active')) {
                updateNotifications();
            }
        }
    }
    
    function updateNotifications() {
        // Verificar si el módulo de métricas está disponible
        if (typeof generateRealAlerts === 'function') {
            try {
                const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
                const productos = JSON.parse(localStorage.getItem('productos') || '[]');
                
                const alerts = generateRealAlerts(pedidos, productos);
                const viewedAlerts = JSON.parse(localStorage.getItem('viewedAlerts') || '[]');
                
                // Filtrar solo alertas no vistas
                const unseenCritical = alerts.critical.filter(alert => 
                    !viewedAlerts.includes(alert.id || alert.message)
                );
                const unseenWarnings = alerts.warnings.filter(alert => 
                    !viewedAlerts.includes(alert.id || alert.message)
                );
                
                const totalUnseenAlerts = unseenCritical.length + unseenWarnings.length;
                
                // Actualizar contador
                const countElement = document.getElementById('notificationCount');
                if (countElement) {
                    if (totalUnseenAlerts > 0) {
                        countElement.textContent = totalUnseenAlerts;
                        countElement.classList.remove('hidden');
                    } else {
                        countElement.classList.add('hidden');
                    }
                }
                
                // Actualizar contenido del dropdown
                const contentElement = document.getElementById('notificationsContent');
                if (contentElement) {
                    if (totalUnseenAlerts > 0) {
                        let notificationsHTML = '';
                        
                        // Agregar alertas críticas no vistas
                        unseenCritical.forEach(alert => {
                            notificationsHTML += `
                                <div class="notification-item critical" data-alert-id="${alert.id || alert.message}">
                                    <div class="notification-message">${alert.message}</div>
                                    <div class="notification-action">${alert.action}</div>
                                    <div class="notification-timestamp">${formatDate(alert.timestamp)}</div>
                                </div>
                            `;
                        });
                        
                        // Agregar advertencias no vistas
                        unseenWarnings.forEach(alert => {
                            notificationsHTML += `
                                <div class="notification-item warning" data-alert-id="${alert.id || alert.message}">
                                    <div class="notification-message">${alert.message}</div>
                                    <div class="notification-action">${alert.action}</div>
                                    <div class="notification-timestamp">${formatDate(alert.timestamp)}</div>
                                </div>
                            `;
                        });
                        
                        // Agregar botón "Marcar todas como vistas"
                        notificationsHTML += `
                            <div class="notifications-footer">
                                <button class="mark-all-viewed-btn" onclick="markAllAlertsAsViewed()">
                                    <i class="fas fa-check"></i> Marcar todas como vistas
                                </button>
                            </div>
                        `;
                        
                        contentElement.innerHTML = notificationsHTML;
                    } else {
                        contentElement.innerHTML = `
                            <div class="no-notifications">
                                <i class="fas fa-check-circle"></i>
                                <p>No hay alertas activas</p>
                            </div>
                        `;
                    }
                }
            } catch (error) {
                console.error('Error actualizando notificaciones:', error);
            }
        }
    }
    
    function formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Fecha inválida';
        }
    }
    
    // Función global para marcar todas las alertas como vistas
    window.markAllAlertsAsViewed = function() {
        const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
        const productos = JSON.parse(localStorage.getItem('productos') || '[]');
        
        if (typeof generateRealAlerts === 'function') {
            const alerts = generateRealAlerts(pedidos, productos);
            const allAlertIds = [
                ...alerts.critical.map(alert => alert.id || alert.message),
                ...alerts.warnings.map(alert => alert.id || alert.message)
            ];
            
            localStorage.setItem('viewedAlerts', JSON.stringify(allAlertIds));
            updateNotifications();
            
            // Cerrar el dropdown
            const dropdown = document.getElementById('notificationsDropdown');
            if (dropdown) {
                dropdown.classList.remove('active');
            }
        }
    };
    
    // Función para marcar una alerta específica como vista
    function markAlertAsViewed(alertId) {
        const viewedAlerts = JSON.parse(localStorage.getItem('viewedAlerts') || '[]');
        if (!viewedAlerts.includes(alertId)) {
            viewedAlerts.push(alertId);
            localStorage.setItem('viewedAlerts', JSON.stringify(viewedAlerts));
            updateNotifications();
        }
    }
    
    // ===================================
    // INICIALIZACIÓN AUTOMÁTICA
    // ===================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Inicializar notificaciones después de que todo esté cargado
    function initNotificationsDelayed() {
        if (document.readyState === 'complete') {
            initNotifications();
        } else {
            setTimeout(initNotificationsDelayed, 500);
        }
    }
    
    setTimeout(initNotificationsDelayed, 1000);
    
    // Test adicional para verificar el botón después de más tiempo
    setTimeout(() => {
        console.log('🧪 TEST: Verificando botón de notificaciones después de 3 segundos...');
        const testBtn = document.getElementById('notificationsBtn');
        console.log('🧪 TEST - Botón encontrado:', !!testBtn);
        if (testBtn) {
            const rect = testBtn.getBoundingClientRect();
            console.log('🧪 TEST - Posición del botón:', {
                visible: rect.width > 0 && rect.height > 0,
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            });
            
            // Si el botón existe pero no es visible, forzar visibilidad
            if (rect.width === 0 || rect.height === 0) {
                console.log('🚨 BOTÓN NO VISIBLE - Aplicando solución de emergencia...');
                testBtn.style.cssText = `
                    display: flex !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    position: fixed !important;
                    top: 20px !important;
                    right: 20px !important;
                    z-index: 999999 !important;
                    background: #e74c3c !important;
                    color: white !important;
                    border: 2px solid #c0392b !important;
                    border-radius: 50% !important;
                    width: 40px !important;
                    height: 40px !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: pointer !important;
                `;
                console.log('🚨 SOLUCIÓN DE EMERGENCIA APLICADA - Botón en posición fija');
            }
        }
    }, 3000);
    
})();
