/* ===================================
   JAVASCRIPT SISTEMA DE AUTENTICACIÓN
   =================================== */

(function() {
    'use strict';
    
    console.log('Módulo Auth cargado');
    
    let currentUser = null;
    
    // Inicialización
    function init() {
        cargarUsuario();
        setupEventListeners();
        actualizarUI();
    }
    
    // Cargar usuario desde localStorage
    function cargarUsuario() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
        }
    }
    
    // Event Listeners
    function setupEventListeners() {
        const btnUser = document.getElementById('btnUser');
        const btnUsuario = document.querySelector('[data-module="usuario"]');
        const authModalOverlay = document.getElementById('authModalOverlay');
        const authModalClose = document.getElementById('authModalClose');
        
        // Abrir modal de auth
        if (btnUser) {
            btnUser.addEventListener('click', function() {
                if (currentUser) {
                    mostrarPerfil();
                } else {
                    abrirModalAuth();
                }
            });
        }
        
        // Abrir modal de auth desde menú inferior
        if (btnUsuario) {
            btnUsuario.addEventListener('click', function() {
                if (currentUser) {
                    mostrarPerfil();
                } else {
                    abrirModalAuth();
                }
            });
        }
        
        // Cerrar modal
        if (authModalClose) {
            authModalClose.addEventListener('click', cerrarModalAuth);
        }
        
        if (authModalOverlay) {
            authModalOverlay.addEventListener('click', function(e) {
                if (e.target === authModalOverlay) {
                    cerrarModalAuth();
                }
            });
        }
        
        // Tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                cambiarTab(this.getAttribute('data-tab'));
            });
        });
        
        // Formularios
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const forgotForm = document.getElementById('forgotForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
        
        if (forgotForm) {
            forgotForm.addEventListener('submit', handleForgotPassword);
        }
        
        // Botón de Google (cuando se implemente)
        const btnGoogle = document.getElementById('btnGoogleSignIn');
        if (btnGoogle) {
            btnGoogle.addEventListener('click', handleGoogleSignIn);
        }
        
        // Links de "olvidé contraseña"
        document.querySelectorAll('.auth-forgot-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const tab = this.getAttribute('data-tab');
                cambiarTab(tab);
            });
        });
    }
    
    // Abrir modal de autenticación
    function abrirModalAuth() {
        const modal = document.getElementById('authModalOverlay');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Cerrar modal de autenticación
    function cerrarModalAuth() {
        const modal = document.getElementById('authModalOverlay');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Cambiar tab
    function cambiarTab(tabName) {
        // Actualizar tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Actualizar formularios
        document.querySelectorAll('.auth-form').forEach(form => {
            if (form.id === tabName + 'Form') {
                form.classList.add('active');
            } else {
                form.classList.remove('active');
            }
        });
    }
    
    // Handle Login
    function handleLogin(e) {
        e.preventDefault();
        
        const phone = document.getElementById('loginPhone').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!phone || !password) {
            mostrarNotificacion('Por favor completa todos los campos', 'warning');
            return;
        }
        
        // Buscar usuario en localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.phone === phone && u.password === password);
        
        if (user) {
            // Login exitoso
            currentUser = {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                phone: user.phone,
                ciudad: user.ciudad,
                direccion: user.direccion
            };
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            mostrarNotificacion('¡Bienvenido!', 'success');
            cerrarModalAuth();
            actualizarUI();
        } else {
            mostrarNotificacion('Teléfono o contraseña incorrectos', 'error');
        }
    }
    
    // Handle Register
    function handleRegister(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('registerNombre').value;
        const apellido = document.getElementById('registerApellido').value;
        const phone = document.getElementById('registerPhone').value;
        const ciudad = document.getElementById('registerCiudad').value;
        const direccion = document.getElementById('registerDireccion').value;
        const anoNacimiento = document.getElementById('registerAnoNacimiento').value;
        const genero = document.getElementById('registerGenero').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        // Validaciones
        if (!nombre || !apellido || !phone || !ciudad || !direccion || !anoNacimiento || !genero || !password || !confirmPassword) {
            mostrarNotificacion('Por favor completa todos los campos', 'warning');
            return;
        }
        
        if (password !== confirmPassword) {
            mostrarNotificacion('Las contraseñas no coinciden', 'error');
            return;
        }
        
        if (password.length < 6) {
            mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'warning');
            return;
        }
        
        // Validar año de nacimiento
        const currentYear = new Date().getFullYear();
        const age = currentYear - parseInt(anoNacimiento);
        if (age < 18 || age > 100) {
            mostrarNotificacion('Debes tener entre 18 y 100 años para registrarte', 'warning');
            return;
        }
        
        // Verificar si el teléfono ya existe
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find(u => u.phone === phone);
        
        if (existingUser) {
            mostrarNotificacion('Este teléfono ya está registrado', 'error');
            return;
        }
        
        // Crear nuevo usuario
        const newUser = {
            id: Date.now().toString(),
            nombre,
            apellido,
            phone,
            ciudad,
            direccion,
            anoNacimiento: parseInt(anoNacimiento),
            genero,
            password,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto-login
        currentUser = {
            id: newUser.id,
            nombre: newUser.nombre,
            apellido: newUser.apellido,
            phone: newUser.phone,
            ciudad: newUser.ciudad,
            direccion: newUser.direccion
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        mostrarNotificacion('¡Cuenta creada exitosamente!', 'success');
        cerrarModalAuth();
        actualizarUI();
        
        // Limpiar formulario
        e.target.reset();
    }
    
    // Handle Forgot Password
    function handleForgotPassword(e) {
        e.preventDefault();
        
        const phone = document.getElementById('forgotPhone').value;
        
        if (!phone) {
            mostrarNotificacion('Por favor ingresa tu teléfono', 'warning');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.phone === phone);
        
        if (user) {
            // En producción, aquí enviarías un SMS/Email
            mostrarNotificacion('Se ha enviado un código a tu teléfono (funcionalidad próximamente)', 'info');
        } else {
            mostrarNotificacion('No existe una cuenta con ese teléfono', 'error');
        }
    }
    
    // Handle Google Sign In
    function handleGoogleSignIn() {
        mostrarNotificacion('Inicio de sesión con Google próximamente', 'info');
        // Aquí se implementará Google Sign-In API
    }
    
    // Mostrar perfil del usuario
    function mostrarPerfil() {
        if (!currentUser) return;
        
        // Ocultar grid de productos
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.style.display = 'none';
        }
        
        // Ocultar sección de deseos si está visible
        const deseosSection = document.getElementById('deseosContainer');
        if (deseosSection) {
            deseosSection.style.display = 'none';
        }
        
        // Crear vista de perfil
        const mainContent = document.querySelector('.main-content');
        let profileContainer = document.getElementById('profileContainer');
        
        if (!profileContainer) {
            profileContainer = document.createElement('div');
            profileContainer.id = 'profileContainer';
            mainContent.appendChild(profileContainer);
        }
        
        const initials = (currentUser.nombre[0] + currentUser.apellido[0]).toUpperCase();
        
        profileContainer.innerHTML = `
            <div class="profile-section">
                <div class="profile-header">
                    <div class="profile-avatar">${initials}</div>
                    <div class="profile-name">${currentUser.nombre} ${currentUser.apellido}</div>
                    <div class="profile-phone">${currentUser.phone}</div>
                </div>
                
                <div class="profile-info">
                    <div class="profile-info-title">Información Personal</div>
                    <div class="profile-info-item">
                        <span class="profile-info-label">Nombre</span>
                        <span class="profile-info-value">${currentUser.nombre}</span>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-info-label">Apellido</span>
                        <span class="profile-info-value">${currentUser.apellido}</span>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-info-label">Teléfono</span>
                        <span class="profile-info-value">${currentUser.phone}</span>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-info-label">Ciudad</span>
                        <span class="profile-info-value">${currentUser.ciudad}</span>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-info-label">Dirección</span>
                        <span class="profile-info-value">${currentUser.direccion}</span>
                    </div>
                </div>
                
                <button class="profile-btn-edit" onclick="authModule.editarPerfil()">
                    <i class="fas fa-edit"></i> Editar Información
                </button>
                
                <button class="profile-btn-logout" onclick="authModule.logout()">
                    <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                </button>
            </div>
        `;
        
        profileContainer.style.display = 'block';
    }
    
    // Editar perfil
    function editarPerfil() {
        mostrarNotificacion('Funcionalidad de edición próximamente', 'info');
        // Aquí se abrirá un modal para editar los datos
    }
    
    // Logout
    function logout() {
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            currentUser = null;
            localStorage.removeItem('currentUser');
            
            // Ocultar perfil
            const profileContainer = document.getElementById('profileContainer');
            if (profileContainer) {
                profileContainer.style.display = 'none';
            }
            
            // Mostrar catálogo
            const productsGrid = document.getElementById('productsGrid');
            if (productsGrid) {
                productsGrid.style.display = 'grid';
            }
            
            mostrarNotificacion('Sesión cerrada', 'info');
            actualizarUI();
        }
    }
    
    // Actualizar UI según estado de autenticación
    function actualizarUI() {
        const btnUser = document.getElementById('btnUser');
        
        if (currentUser) {
            // Usuario logueado
            if (btnUser) {
                btnUser.innerHTML = '<i class="fas fa-user-circle"></i>';
                btnUser.style.color = 'var(--primary-color)';
            }
        } else {
            // Usuario no logueado
            if (btnUser) {
                btnUser.innerHTML = '<i class="fas fa-user"></i>';
                btnUser.style.color = '';
            }
        }
    }
    
    // Verificar si el usuario está logueado
    function isLoggedIn() {
        return currentUser !== null;
    }
    
    // Obtener usuario actual
    function getCurrentUser() {
        return currentUser;
    }
    
    // Mostrar notificación
    function mostrarNotificacion(mensaje, tipo = 'info') {
        const colores = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        
        const iconos = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 90px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: ${colores[tipo]};
            color: white;
            padding: 14px 24px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 500;
            z-index: 10001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 200px;
            max-width: 90%;
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;
        
        toast.innerHTML = `
            <span style="font-size: 18px;">${iconos[tipo]}</span>
            <span>${mensaje}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Exportar funciones
    window.authModule = {
        isLoggedIn,
        getCurrentUser,
        logout,
        editarPerfil,
        abrirModalAuth
    };
    
})();

