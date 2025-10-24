/**
 * SISTEMA DE LOGIN PARA DASHBOARD
 * Sistema de Catálogo Multi-Negocio MVP
 */

(function() {
    'use strict';

    console.log('Sistema de Login cargado');

    // Variables del módulo
    let usuarioActual = null;
    const LOGIN_STORAGE_KEY = 'damasco_usuario';

    // Elementos del DOM
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');
    const headerRight = document.querySelector('.header-right');

    // ===================================
    // INICIALIZACIÓN
    // ===================================
    function init() {
        // Verificar si ya está logueado
        const usuarioGuardado = localStorage.getItem(LOGIN_STORAGE_KEY);
        if (usuarioGuardado) {
            try {
                usuarioActual = JSON.parse(usuarioGuardado);
                mostrarDashboard();
                return;
            } catch (e) {
                localStorage.removeItem(LOGIN_STORAGE_KEY);
            }
        }

        // Mostrar modal de login
        mostrarLogin();
    }

    // ===================================
    // FUNCIONES DE LOGIN
    // ===================================
    function mostrarLogin() {
        if (loginModal) {
            loginModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Focus en el primer input
            if (usernameInput) {
                setTimeout(() => usernameInput.focus(), 100);
            }
        }
    }

    function ocultarLogin() {
        if (loginModal) {
            loginModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    function mostrarDashboard() {
        // Ocultar modal de login
        ocultarLogin();
        
        // Mostrar header con usuario
        if (headerRight) {
            headerRight.innerHTML = `
                <div class="user-info">
                    <span class="user-name">${usuarioActual.nombre}</span>
                </div>
                <button class="header-btn" id="logoutBtn" title="Cerrar sesión">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            `;
            
            // Agregar event listeners
            const logoutBtn = document.getElementById('logoutBtn');
            
            if (logoutBtn) {
                logoutBtn.addEventListener('click', logout);
            }
        }
        
        // Cargar el dashboard
        if (window.loadDashboard) {
            window.loadDashboard();
        }
    }

    function login(username, password) {
        // Usuarios hardcodeados
        const usuarios = [
            { username: 'admin', password: 'admin', nombre: 'Administrador' }
        ];
        
        const usuario = usuarios.find(u => u.username === username && u.password === password);
        
        if (usuario) {
            usuarioActual = usuario;
            localStorage.setItem(LOGIN_STORAGE_KEY, JSON.stringify(usuario));
            mostrarDashboard();
            return true;
        } else {
            mostrarError('Usuario o contraseña incorrectos');
            return false;
        }
    }

    function logout() {
        usuarioActual = null;
        localStorage.removeItem(LOGIN_STORAGE_KEY);
        
        // Limpiar header
        if (headerRight) {
            headerRight.innerHTML = '';
        }
        
        // Mostrar login nuevamente
        mostrarLogin();
    }

    function mostrarError(mensaje) {
        if (loginError) {
            loginError.textContent = mensaje;
            loginError.style.display = 'block';
            
            // Ocultar error después de 3 segundos
            setTimeout(() => {
                loginError.style.display = 'none';
            }, 3000);
        }
    }

    // ===================================
    // FUNCIONES DE TEMA
    // ===================================
    function toggleTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        
        if (body.classList.contains('light-theme')) {
            // Cambiar a dark
            body.classList.remove('light-theme');
            icon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'dark');
        } else {
            // Cambiar a light
            body.classList.add('light-theme');
            icon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'light');
        }
    }

    function cargarTema() {
        const temaGuardado = localStorage.getItem('theme');
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            
            if (temaGuardado === 'light') {
                body.classList.add('light-theme');
                icon.className = 'fas fa-sun';
            } else {
                body.classList.remove('light-theme');
                icon.className = 'fas fa-moon';
            }
        }
    }

    // ===================================
    // EVENT LISTENERS
    // ===================================
    function setupEventListeners() {
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const username = usernameInput ? usernameInput.value.trim() : '';
                const password = passwordInput ? passwordInput.value.trim() : '';
                
                if (!username || !password) {
                    mostrarError('Por favor completa todos los campos');
                    return;
                }
                
                login(username, password);
            });
        }

        // Enter en password también envía el formulario
        if (passwordInput) {
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    loginForm.dispatchEvent(new Event('submit'));
                }
            });
        }
    }

    // ===================================
    // FUNCIONES PÚBLICAS
    // ===================================
    window.loginSystem = {
        init: init,
        login: login,
        logout: logout,
        getUsuarioActual: () => usuarioActual,
        cargarTema: cargarTema
    };

    // ===================================
    // INICIALIZACIÓN
    // ===================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setupEventListeners();
            init();
        });
    } else {
        setupEventListeners();
        init();
    }

})();
