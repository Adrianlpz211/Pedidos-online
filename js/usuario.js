/* ===================================
   MÓDULO USUARIO - INDEX
   =================================== */

(function() {
    'use strict';
    
    console.log('Módulo Usuario cargado');
    
    // Variables del módulo
    let usuarioActual = null;
    
    // Elementos del DOM
    const usuarioModule = document.getElementById('usuarioModule');
    
    // ===================================
    // INICIALIZACIÓN
    // ===================================
    function init() {
        // El módulo de usuario ahora usa el sistema de auth existente
        // Solo se ejecuta cuando se selecciona desde el menú
        console.log('Módulo Usuario inicializado');
    }
    
    // ===================================
    // CARGA DE DATOS
    // ===================================
    function loadUsuarioData() {
        console.log('Cargando datos del usuario...');
        
        // Verificar si hay usuario logueado usando el sistema de auth existente
        const usuarioGuardado = localStorage.getItem('currentUser');
        if (usuarioGuardado) {
            try {
                usuarioActual = JSON.parse(usuarioGuardado);
                renderUsuario();
            } catch (error) {
                console.error('Error al cargar usuario:', error);
                renderLogin();
            }
        } else {
            renderLogin();
        }
    }
    
    // ===================================
    // RENDERIZADO
    // ===================================
    function renderUsuario() {
        if (!usuarioModule) return;
        
        usuarioModule.innerHTML = `
            <div class="usuario-content">
                <div class="usuario-header">
                    <div class="usuario-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="usuario-info">
                        <h2 class="usuario-nombre">${usuarioActual.nombre || 'Usuario'}</h2>
                        <p class="usuario-email">${usuarioActual.email || 'usuario@ejemplo.com'}</p>
                    </div>
                </div>
                
                <div class="usuario-menu">
                    <button class="usuario-menu-item" id="btnPerfil">
                        <i class="fas fa-user-edit"></i>
                        <span>Editar Perfil</span>
                    </button>
                    <button class="usuario-menu-item" id="btnPedidos">
                        <i class="fas fa-shopping-bag"></i>
                        <span>Mis Pedidos</span>
                    </button>
                    <button class="usuario-menu-item" id="btnDeseos">
                        <i class="fas fa-heart"></i>
                        <span>Lista de Deseos</span>
                    </button>
                    <button class="usuario-menu-item" id="btnConfiguracion">
                        <i class="fas fa-cog"></i>
                        <span>Configuración</span>
                    </button>
                    <button class="usuario-menu-item" id="btnCerrarSesion">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        `;
        
        setupUsuarioEventListeners();
    }
    
    function renderLogin() {
        if (!usuarioModule) return;
        
        usuarioModule.innerHTML = `
            <div class="usuario-login">
                <div class="login-header">
                    <i class="fas fa-user-circle login-icon"></i>
                    <h2>Iniciar Sesión</h2>
                    <p>Accede a tu cuenta para una mejor experiencia</p>
                </div>
                
                <form class="login-form" id="usuarioLoginForm">
                    <div class="form-group">
                        <input type="text" id="usuarioUsername" placeholder="Usuario o email" required>
                    </div>
                    <div class="form-group">
                        <input type="password" id="usuarioPassword" placeholder="Contraseña" required>
                    </div>
                    <button type="submit" class="btn-login">
                        <i class="fas fa-sign-in-alt"></i>
                        Iniciar Sesión
                    </button>
                </form>
                
                <div class="login-footer">
                    <p>¿No tienes cuenta? <a href="#" id="btnRegistro">Regístrate aquí</a></p>
                </div>
            </div>
        `;
        
        setupLoginEventListeners();
    }
    
    // ===================================
    // EVENT LISTENERS
    // ===================================
    function setupUsuarioEventListeners() {
        const btnPerfil = document.getElementById('btnPerfil');
        const btnPedidos = document.getElementById('btnPedidos');
        const btnDeseos = document.getElementById('btnDeseos');
        const btnConfiguracion = document.getElementById('btnConfiguracion');
        const btnCerrarSesion = document.getElementById('btnCerrarSesion');
        
        if (btnPerfil) btnPerfil.addEventListener('click', editarPerfil);
        if (btnPedidos) btnPedidos.addEventListener('click', verPedidos);
        if (btnDeseos) btnDeseos.addEventListener('click', verDeseos);
        if (btnConfiguracion) btnConfiguracion.addEventListener('click', abrirConfiguracion);
        if (btnCerrarSesion) btnCerrarSesion.addEventListener('click', cerrarSesion);
    }
    
    function setupLoginEventListeners() {
        const loginForm = document.getElementById('usuarioLoginForm');
        const btnRegistro = document.getElementById('btnRegistro');
        
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        if (btnRegistro) {
            btnRegistro.addEventListener('click', mostrarRegistro);
        }
    }
    
    // ===================================
    // FUNCIONES DE USUARIO
    // ===================================
    function editarPerfil() {
        console.log('Editando perfil...');
        // Implementar edición de perfil
    }
    
    function verPedidos() {
        console.log('Viendo pedidos...');
        // Cambiar a módulo de pedidos
        if (window.menuFuncional) {
            window.menuFuncional.switchModule('ofertas');
        }
    }
    
    function verDeseos() {
        console.log('Viendo deseos...');
        // Cambiar a módulo de deseos
        if (window.menuFuncional) {
            window.menuFuncional.switchModule('lonuevo');
        }
    }
    
    function abrirConfiguracion() {
        console.log('Abriendo configuración...');
        // Implementar configuración
    }
    
    function cerrarSesion() {
        console.log('Cerrando sesión...');
        localStorage.removeItem('damasco_usuario');
        usuarioActual = null;
        renderLogin();
    }
    
    function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('usuarioUsername').value;
        const password = document.getElementById('usuarioPassword').value;
        
        // Simular login (en producción vendría de una API)
        if (username === 'admin' && password === 'admin') {
            usuarioActual = {
                nombre: 'Administrador',
                email: 'admin@damasco.com',
                username: 'admin'
            };
            
            localStorage.setItem('damasco_usuario', JSON.stringify(usuarioActual));
            renderUsuario();
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    }
    
    function mostrarRegistro() {
        console.log('Mostrando registro...');
        // Implementar registro
    }
    
    // ===================================
    // FUNCIONES PÚBLICAS
    // ===================================
    window.loadUsuarioModule = function() {
        console.log('Cargando módulo de usuario...');
        loadUsuarioData();
    };
    
    // ===================================
    // INICIALIZACIÓN AUTOMÁTICA
    // ===================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
