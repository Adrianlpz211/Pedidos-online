/**
 * SISTEMA DE AUTENTICACIÓN INTEGRADO CON API
 * Sistema de Catálogo Multi-Negocio MVP
 */

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    /**
     * INICIALIZAR SISTEMA
     */
    init() {
        this.cargarUsuario();
        this.setupEventListeners();
        this.actualizarUI();
    }

    /**
     * CARGAR USUARIO DESDE LOCALSTORAGE
     */
    cargarUsuario() {
        const savedUser = localStorage.getItem('current_user');
        const savedToken = localStorage.getItem('auth_token');
        
        if (savedUser && savedToken) {
            this.currentUser = JSON.parse(savedUser);
            this.isAuthenticated = true;
            api.setToken(savedToken);
        }
    }

    /**
     * CONFIGURAR EVENT LISTENERS
     */
    setupEventListeners() {
        // Botón de usuario
        const btnUser = document.getElementById('userBtn');
        if (btnUser) {
            btnUser.addEventListener('click', () => {
                if (this.isAuthenticated) {
                    this.mostrarPerfil();
                } else {
                    this.abrirModalAuth();
                }
            });
        }

        // Modal de autenticación
        const authModal = document.getElementById('authModal');
        const authClose = document.getElementById('authClose');
        
        if (authClose) {
            authClose.addEventListener('click', () => this.cerrarModalAuth());
        }

        if (authModal) {
            authModal.addEventListener('click', (e) => {
                if (e.target === authModal) {
                    this.cerrarModalAuth();
                }
            });
        }

        // Formularios
        this.setupFormListeners();
    }

    /**
     * CONFIGURAR LISTENERS DE FORMULARIOS
     */
    setupFormListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Forgot form
        const forgotForm = document.getElementById('forgotForm');
        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => this.handleForgot(e));
        }

        // Enlaces de cambio de formulario
        const showRegister = document.getElementById('showRegister');
        const showLogin = document.getElementById('showLogin');
        const showForgot = document.getElementById('showForgot');
        const showLoginFromForgot = document.getElementById('showLoginFromForgot');

        if (showRegister) showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegister();
        });

        if (showLogin) showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogin();
        });

        if (showForgot) showForgot.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForgot();
        });

        if (showLoginFromForgot) showLoginFromForgot.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogin();
        });
    }

    /**
     * MANEJAR LOGIN
     */
    async handleLogin(e) {
        e.preventDefault();
        
        const phone = document.getElementById('loginPhone').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!phone || !password) {
            mostrarNotificacion('Por favor completa todos los campos', 'warning');
            return;
        }

        try {
            const response = await api.login(phone, password);
            
            if (response.success) {
                // Guardar token y usuario
                api.setToken(response.token);
                api.setCurrentUser(response.user);
                
                this.currentUser = response.user;
                this.isAuthenticated = true;
                
                // Actualizar UI
                this.actualizarUI();
                this.cerrarModalAuth();
                
                mostrarNotificacion('¡Bienvenido!', 'success');
                
                // Limpiar formulario
                document.getElementById('loginForm').reset();
                
            } else {
                mostrarNotificacion(response.message || 'Error al iniciar sesión', 'error');
            }
            
        } catch (error) {
            console.error('Error en login:', error);
            mostrarNotificacion('Error al iniciar sesión. Inténtalo de nuevo.', 'error');
        }
    }

    /**
     * MANEJAR REGISTRO
     */
    async handleRegister(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('registerNombre').value.trim();
        const apellido = document.getElementById('registerApellido').value.trim();
        const phone = document.getElementById('registerPhone').value.trim();
        const ciudad = document.getElementById('registerCiudad').value.trim();
        const direccion = document.getElementById('registerDireccion').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        // Validaciones
        if (!nombre || !apellido || !phone || !ciudad || !direccion || !password || !confirmPassword) {
            mostrarNotificacion('Por favor completa todos los campos', 'warning');
            return;
        }

        if (nombre.length < 2 || apellido.length < 2) {
            mostrarNotificacion('Nombre y apellido deben tener al menos 2 caracteres', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            mostrarNotificacion('Las contraseñas no coinciden', 'warning');
            return;
        }

        if (password.length < 6) {
            mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'warning');
            return;
        }

        try {
            const response = await api.register({
                nombre: nombre,
                apellido: apellido,
                phone: phone,
                ciudad: ciudad,
                direccion: direccion,
                password: password
            });

            if (response.success) {
                mostrarNotificacion('¡Cuenta creada exitosamente!', 'success');
                this.showLogin();
                document.getElementById('registerForm').reset();
            } else {
                mostrarNotificacion(response.message || 'Error al crear cuenta', 'error');
            }

        } catch (error) {
            console.error('Error en registro:', error);
            mostrarNotificacion('Error al crear cuenta. Inténtalo de nuevo.', 'error');
        }
    }

    /**
     * MANEJAR RECUPERACIÓN DE CONTRASEÑA
     */
    async handleForgot(e) {
        e.preventDefault();
        
        const phone = document.getElementById('forgotPhone').value.trim();

        if (!phone) {
            mostrarNotificacion('Por favor ingresa tu teléfono', 'warning');
            return;
        }

        // Por ahora solo mostrar mensaje
        mostrarNotificacion('Función de recuperación de contraseña próximamente', 'info');
        this.showLogin();
    }

    /**
     * CERRAR SESIÓN
     */
    async logout() {
        try {
            await api.logout();
            
            this.currentUser = null;
            this.isAuthenticated = false;
            
            this.actualizarUI();
            mostrarNotificacion('Sesión cerrada', 'info');
            
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }

    /**
     * MOSTRAR PERFIL
     */
    mostrarPerfil() {
        if (!this.isAuthenticated) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Mi Perfil</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="profile-info">
                        <div class="profile-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="profile-details">
                            <h4>${this.currentUser.nombre} ${this.currentUser.apellido}</h4>
                            <p><i class="fas fa-phone"></i> ${this.currentUser.phone}</p>
                            <p><i class="fas fa-map-marker-alt"></i> ${this.currentUser.ciudad}</p>
                            <p><i class="fas fa-home"></i> ${this.currentUser.direccion}</p>
                        </div>
                    </div>
                    <div class="profile-actions">
                        <button class="btn btn-primary" onclick="authSystem.editarPerfil()">
                            <i class="fas fa-edit"></i>
                            Editar Perfil
                        </button>
                        <button class="btn btn-secondary" onclick="authSystem.logout()">
                            <i class="fas fa-sign-out-alt"></i>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listener para cerrar modal
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    /**
     * EDITAR PERFIL
     */
    editarPerfil() {
        if (!this.isAuthenticated) return;

        const editModal = document.createElement('div');
        editModal.className = 'modal-overlay';
        editModal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Editar Perfil</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="editProfileForm">
                        <div class="auth-form-row">
                            <div class="auth-form-group">
                                <label class="auth-form-label">Nombre</label>
                                <input type="text" class="auth-form-input" id="editNombre" value="${this.currentUser.nombre}" required>
                            </div>
                            <div class="auth-form-group">
                                <label class="auth-form-label">Apellido</label>
                                <input type="text" class="auth-form-input" id="editApellido" value="${this.currentUser.apellido}" required>
                            </div>
                        </div>
                        
                        <div class="auth-form-group">
                            <label class="auth-form-label">Teléfono</label>
                            <input type="tel" class="auth-form-input" id="editPhone" value="${this.currentUser.phone}" required>
                        </div>
                        
                        <div class="auth-form-group">
                            <label class="auth-form-label">Ciudad</label>
                            <input type="text" class="auth-form-input" id="editCiudad" value="${this.currentUser.ciudad}" required>
                        </div>
                        
                        <div class="auth-form-group">
                            <label class="auth-form-label">Dirección</label>
                            <input type="text" class="auth-form-input" id="editDireccion" value="${this.currentUser.direccion}" required>
                        </div>
                        
                        <div class="auth-form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary">
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(editModal);

        // Manejar envío del formulario
        document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const nombre = document.getElementById('editNombre').value.trim();
            const apellido = document.getElementById('editApellido').value.trim();
            const phone = document.getElementById('editPhone').value.trim();
            const ciudad = document.getElementById('editCiudad').value.trim();
            const direccion = document.getElementById('editDireccion').value.trim();

            // Validaciones
            if (!nombre || !apellido || !phone || !ciudad || !direccion) {
                mostrarNotificacion('Por favor completa todos los campos', 'warning');
                return;
            }

            if (nombre.length < 2 || apellido.length < 2) {
                mostrarNotificacion('Nombre y apellido deben tener al menos 2 caracteres', 'warning');
                return;
            }

            try {
                // Actualizar usuario en la API
                const response = await api.request(`api/users/${this.currentUser.id}`, {
                    method: 'PUT',
                    body: {
                        nombre: nombre,
                        apellido: apellido,
                        phone: phone,
                        ciudad: ciudad,
                        direccion: direccion
                    }
                });

                if (response.success) {
                    // Actualizar usuario local
                    this.currentUser = { ...this.currentUser, nombre, apellido, phone, ciudad, direccion };
                    api.setCurrentUser(this.currentUser);

                    // Cerrar modal y actualizar vista
                    editModal.remove();
                    this.mostrarPerfil();
                    mostrarNotificacion('Perfil actualizado exitosamente', 'success');
                } else {
                    mostrarNotificacion(response.message || 'Error al actualizar perfil', 'error');
                }

            } catch (error) {
                console.error('Error al actualizar perfil:', error);
                mostrarNotificacion('Error al actualizar perfil. Inténtalo de nuevo.', 'error');
            }
        });

        // Event listener para cerrar modal
        editModal.querySelector('.modal-close').addEventListener('click', () => editModal.remove());
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) editModal.remove();
        });
    }

    /**
     * ABRIR MODAL DE AUTENTICACIÓN
     */
    abrirModalAuth() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'block';
            this.showLogin();
        }
    }

    /**
     * CERRAR MODAL DE AUTENTICACIÓN
     */
    cerrarModalAuth() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * MOSTRAR FORMULARIO DE LOGIN
     */
    showLogin() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const forgotForm = document.getElementById('forgotForm');
        const authTitle = document.getElementById('authTitle');

        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
        if (forgotForm) forgotForm.style.display = 'none';
        if (authTitle) authTitle.textContent = 'Iniciar Sesión';
    }

    /**
     * MOSTRAR FORMULARIO DE REGISTRO
     */
    showRegister() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const forgotForm = document.getElementById('forgotForm');
        const authTitle = document.getElementById('authTitle');

        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
        if (forgotForm) forgotForm.style.display = 'none';
        if (authTitle) authTitle.textContent = 'Crear Cuenta';
    }

    /**
     * MOSTRAR FORMULARIO DE RECUPERACIÓN
     */
    showForgot() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const forgotForm = document.getElementById('forgotForm');
        const authTitle = document.getElementById('authTitle');

        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
        if (forgotForm) forgotForm.style.display = 'block';
        if (authTitle) authTitle.textContent = 'Recuperar Contraseña';
    }

    /**
     * ACTUALIZAR UI
     */
    actualizarUI() {
        const btnUser = document.getElementById('userBtn');
        const btnCart = document.getElementById('cartBtn');
        const btnSearch = document.getElementById('searchBtn');

        if (this.isAuthenticated) {
            // Usuario autenticado
            if (btnUser) {
                btnUser.style.display = 'block';
                btnUser.innerHTML = '<i class="fas fa-user"></i>';
            }
            if (btnCart) btnCart.style.display = 'block';
            if (btnSearch) btnSearch.style.display = 'block';
        } else {
            // Usuario no autenticado
            if (btnUser) {
                btnUser.style.display = 'block';
                btnUser.innerHTML = '<i class="fas fa-user"></i>';
            }
            if (btnCart) btnCart.style.display = 'none';
            if (btnSearch) btnSearch.style.display = 'block';
        }
    }

    /**
     * VERIFICAR AUTENTICACIÓN
     */
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    /**
     * OBTENER USUARIO ACTUAL
     */
    getCurrentUser() {
        return this.currentUser;
    }
}

// Instancia global
window.authSystem = new AuthSystem();
