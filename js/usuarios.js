/* ===================================
   MÓDULO USUARIOS - JAVASCRIPT
   =================================== */

(function() {
    'use strict';
    
    console.log('Módulo Usuarios cargado');
    
    // Variables del módulo
    let users = [];
    let filteredUsers = [];
    let currentUser = null;
    let isEditing = false;
    let currentPage = 1;
    let itemsPerPage = 10;
    let sortColumn = 'name';
    let sortDirection = 'asc';
    let searchTerm = '';
    let selectedUsers = new Set();
    let filters = {
        role: '',
        status: '',
        lastLogin: ''
    };
    
    // Elementos del DOM
    const usersGrid = document.getElementById('usersGrid');
    const btnNuevoUsuario = document.getElementById('btnNuevoUsuario');
    
    // ===================================
    // ROLES Y PERMISOS
    // ===================================
    const ROLES = {
        'super_admin': {
            name: 'Super Administrador',
            color: '#e74c3c',
            icon: 'fas fa-crown',
            permissions: ['all']
        },
        'admin': {
            name: 'Administrador',
            color: '#f39c12',
            icon: 'fas fa-user-shield',
            permissions: ['products', 'clients', 'orders', 'inventory', 'metrics', 'config_basic']
        },
        'vendedor': {
            name: 'Vendedor',
            color: '#3498db',
            icon: 'fas fa-handshake',
            permissions: ['products_read', 'clients_read', 'orders_create', 'metrics_basic']
        },
        'inventarista': {
            name: 'Inventarista',
            color: '#27ae60',
            icon: 'fas fa-boxes',
            permissions: ['products', 'inventory', 'orders_read']
        },
        'cajero': {
            name: 'Cajero',
            color: '#9b59b6',
            icon: 'fas fa-cash-register',
            permissions: ['products_read', 'clients_read', 'orders_process', 'metrics_basic']
        }
    };
    
    // ===================================
    // INICIALIZACIÓN
    // ===================================
    function init() {
        setupEventListeners();
        loadUsers();
        
        // Listener para redimensionar ventana
        window.addEventListener('resize', () => {
            if (usersGrid && usersGrid.innerHTML) {
                renderUsers();
            }
        });
        
        console.log('Módulo Usuarios inicializado');
    }
    
    // ===================================
    // EVENT LISTENERS
    // ===================================
    function setupEventListeners() {
        if (btnNuevoUsuario) {
            btnNuevoUsuario.addEventListener('click', showNewUserForm);
        }
    }
    
    // ===================================
    // CARGA DE USUARIOS
    // ===================================
    function loadUsers() {
        console.log('Cargando usuarios...');
        
        // Mostrar loading
        showLoadingState();
        
        // Simular carga de datos
        setTimeout(() => {
            const savedUsers = localStorage.getItem('dashboardUsers');
            if (savedUsers) {
                try {
                    users = JSON.parse(savedUsers);
                } catch (error) {
                    console.error('Error al cargar usuarios:', error);
                    users = [];
                }
            } else {
                // Datos de ejemplo
                users = getSampleUsers();
                saveUsers();
            }
            
            renderUsers();
        }, 500);
    }
    
    function getSampleUsers() {
        return [
            {
                id: 1,
                name: 'Carlos Mendoza',
                email: 'carlos@empresa.com',
                username: 'carlos.mendoza',
                role: 'super_admin',
                status: 'active',
                lastLogin: '2024-03-15T10:30:00Z',
                createdAt: '2024-01-01T00:00:00Z',
                avatar: 'img/avatars/user1.jpg',
                phone: '+584121234567',
                department: 'Dirección General'
            },
            {
                id: 2,
                name: 'María González',
                email: 'maria@empresa.com',
                username: 'maria.gonzalez',
                role: 'admin',
                status: 'active',
                lastLogin: '2024-03-14T16:45:00Z',
                createdAt: '2024-01-15T00:00:00Z',
                avatar: 'img/avatars/user2.jpg',
                phone: '+584129876543',
                department: 'Administración'
            },
            {
                id: 3,
                name: 'José Rodríguez',
                email: 'jose@empresa.com',
                username: 'jose.rodriguez',
                role: 'vendedor',
                status: 'active',
                lastLogin: '2024-03-15T09:15:00Z',
                createdAt: '2024-02-01T00:00:00Z',
                avatar: 'img/avatars/user3.jpg',
                phone: '+584145678901',
                department: 'Ventas'
            },
            {
                id: 4,
                name: 'Ana Martínez',
                email: 'ana@empresa.com',
                username: 'ana.martinez',
                role: 'inventarista',
                status: 'inactive',
                lastLogin: '2024-03-10T14:20:00Z',
                createdAt: '2024-02-15T00:00:00Z',
                avatar: 'img/avatars/user4.jpg',
                phone: '+584156789012',
                department: 'Almacén'
            }
        ];
    }
    
    function saveUsers() {
        try {
            localStorage.setItem('dashboardUsers', JSON.stringify(users));
            console.log('Usuarios guardados');
        } catch (error) {
            console.error('Error al guardar usuarios:', error);
        }
    }
    
    // ===================================
    // RENDERIZADO
    // ===================================
    function renderUsers() {
        if (!usersGrid) return;
        
        // Aplicar filtros y búsqueda
        applyFiltersAndSearch();
        
        if (filteredUsers.length === 0) {
            showEmptyState();
            return;
        }
        
        // Renderizar controles superiores
        renderControls();
        
        // Renderizar contenido según el tamaño de pantalla
        if (window.innerWidth <= 768) {
            console.log('Renderizando vista móvil - tarjetas compactas');
            renderMobileCardsView();
        } else {
            console.log('Renderizando vista escritorio - tabla');
            renderTableView();
        }
        
        // Renderizar paginación
        renderPagination();
        
        // Agregar event listeners
        addUserCardListeners();
    }
    
    function renderControls() {
        const controlsHTML = `
            <div class="users-controls">
                <div class="controls-row">
                    <div class="controls-left">
                        <div class="search-box">
                            <input type="text" class="search-input" id="userSearch" 
                                   placeholder="Buscar usuarios..." value="${searchTerm}">
                            <i class="fas fa-search search-icon"></i>
                        </div>
                        <select class="filter-select" id="roleFilter">
                            <option value="">Todos los roles</option>
                            <option value="super_admin" ${filters.role === 'super_admin' ? 'selected' : ''}>Super Admin</option>
                            <option value="admin" ${filters.role === 'admin' ? 'selected' : ''}>Administrador</option>
                            <option value="vendedor" ${filters.role === 'vendedor' ? 'selected' : ''}>Vendedor</option>
                            <option value="inventarista" ${filters.role === 'inventarista' ? 'selected' : ''}>Inventarista</option>
                            <option value="cajero" ${filters.role === 'cajero' ? 'selected' : ''}>Cajero</option>
                        </select>
                        <select class="filter-select" id="statusFilter">
                            <option value="">Todos los estados</option>
                            <option value="active" ${filters.status === 'active' ? 'selected' : ''}>Activos</option>
                            <option value="inactive" ${filters.status === 'inactive' ? 'selected' : ''}>Inactivos</option>
                        </select>
                    </div>
                    <div class="controls-right">
                        <button class="btn btn-primary" onclick="showNewUserForm()">
                            <i class="fas fa-plus"></i>
                            <span class="btn-text">Nuevo Usuario</span>
                        </button>
                    </div>
                </div>
                
                <div class="advanced-filters" id="advancedFilters">
                    <h4 class="filters-title" onclick="toggleAdvancedFilters()">
                        <i class="fas fa-chevron-right"></i>
                        Filtros Avanzados
                    </h4>
                    <div class="filters-grid">
                        <div class="filter-group">
                            <label class="filter-label">Último Acceso</label>
                            <input type="date" class="filter-input" id="lastLoginFilter" 
                                   value="${filters.lastLogin}">
                        </div>
                        <div class="filter-group">
                            <label class="filter-label">Ordenar por</label>
                            <select class="filter-input" id="sortSelect">
                                <option value="name" ${sortColumn === 'name' ? 'selected' : ''}>Nombre</option>
                                <option value="role" ${sortColumn === 'role' ? 'selected' : ''}>Rol</option>
                                <option value="lastLogin" ${sortColumn === 'lastLogin' ? 'selected' : ''}>Último Acceso</option>
                                <option value="createdAt" ${sortColumn === 'createdAt' ? 'selected' : ''}>Fecha Creación</option>
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
        if (usersGrid && usersGrid.parentNode) {
            const existingControls = usersGrid.parentNode.querySelector('.users-controls');
            if (existingControls) {
                existingControls.remove();
            }
            usersGrid.parentNode.insertAdjacentHTML('afterbegin', controlsHTML);
            
            // Configurar event listeners de controles
            setupControlsListeners();
        }
    }
    
    function renderTableView() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageUsers = filteredUsers.slice(startIndex, endIndex);
        
        const tableHTML = `
            <div class="users-table-container">
                <table class="users-table">
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" id="selectAll" onchange="toggleSelectAll(this)">
                            </th>
                            <th class="sortable" onclick="sortUsers('name')">Usuario</th>
                            <th class="sortable" onclick="sortUsers('role')">Rol</th>
                            <th class="sortable" onclick="sortUsers('department')">Departamento</th>
                            <th class="sortable" onclick="sortUsers('lastLogin')">Último Acceso</th>
                            <th class="sortable" onclick="sortUsers('status')">Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pageUsers.map(user => createTableRow(user)).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        usersGrid.innerHTML = tableHTML;
        usersGrid.style.width = '100%';
        usersGrid.className = 'users-grid table-view';
    }
    
    function renderMobileCardsView() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageUsers = filteredUsers.slice(startIndex, endIndex);
        
        const cardsHTML = `
            <div class="mobile-users-grid">
                ${pageUsers.map(user => createMobileCard(user)).join('')}
            </div>
        `;
        
        usersGrid.innerHTML = cardsHTML;
        usersGrid.className = 'users-grid mobile-cards-view';
    }
    
    function createTableRow(user) {
        const roleInfo = ROLES[user.role];
        const statusClass = user.status === 'active' ? 'active' : 'inactive';
        const statusText = user.status === 'active' ? 'Activo' : 'Inactivo';
        const isSelected = selectedUsers.has(user.id);
        const lastLoginDate = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-ES') : 'Nunca';
        
        return `
            <tr class="${isSelected ? 'selected' : ''}" data-user-id="${user.id}">
                <td>
                    <input type="checkbox" class="user-checkbox" 
                           ${isSelected ? 'checked' : ''} 
                           onchange="toggleUserSelection(${user.id}, this)">
                </td>
                <td>
                    <div class="user-info">
                        <div class="user-name">${user.name}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                </td>
                <td>
                    <span class="user-role" style="background-color: ${roleInfo.color}20; color: ${roleInfo.color};">
                        <i class="${roleInfo.icon}"></i>
                        ${roleInfo.name}
                    </span>
                </td>
                <td>${user.department}</td>
                <td>
                    <div class="user-last-login">${lastLoginDate}</div>
                </td>
                <td>
                    <span class="user-status-small ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="user-actions-small">
                        <button class="btn btn-primary btn-sm" onclick="viewUser(${user.id})" title="Ver perfil">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="editUser(${user.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
    
    function createMobileCard(user) {
        const roleInfo = ROLES[user.role];
        const statusClass = user.status === 'active' ? 'active' : 'inactive';
        const statusText = user.status === 'active' ? 'Activo' : 'Inactivo';
        const isSelected = selectedUsers.has(user.id);
        const lastLoginDate = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-ES') : 'Nunca';
        
        return `
            <div class="mobile-user-card ${isSelected ? 'selected' : ''}" data-user-id="${user.id}">
                <div class="mobile-user-header">
                    <input type="checkbox" class="mobile-user-checkbox" 
                           ${isSelected ? 'checked' : ''} 
                           onchange="toggleUserSelection(${user.id}, this)">
                    <div class="mobile-user-info">
                        <h3 class="mobile-user-name">${user.name}</h3>
                        <p class="mobile-user-email">${user.email}</p>
                        <span class="mobile-user-role" style="background-color: ${roleInfo.color}20; color: ${roleInfo.color};">
                            <i class="${roleInfo.icon}"></i>
                            ${roleInfo.name}
                        </span>
                        <span class="mobile-user-status ${statusClass}">${statusText}</span>
                    </div>
                    <button class="mobile-details-toggle" onclick="toggleMobileDetails(${user.id})">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                
                <div class="mobile-user-details" id="details-${user.id}" style="display: none;">
                    <div class="mobile-detail-row">
                        <i class="fas fa-building"></i>
                        <span>${user.department}</span>
                    </div>
                    <div class="mobile-detail-row">
                        <i class="fas fa-clock"></i>
                        <span>Último acceso: ${lastLoginDate}</span>
                    </div>
                    <div class="mobile-detail-row">
                        <i class="fas fa-user-tag"></i>
                        <span>@${user.username}</span>
                    </div>
                    <div class="mobile-detail-row">
                        <i class="fas fa-phone"></i>
                        <span>${user.phone}</span>
                    </div>
                </div>
                
                <div class="mobile-user-actions">
                    <button class="mobile-btn-view" onclick="viewUser(${user.id})">
                        <i class="fas fa-eye"></i>
                        Ver
                    </button>
                    <button class="mobile-btn-edit" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button class="mobile-btn-delete" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }
    
    function showLoadingState() {
        if (!usersGrid) return;
        
        const skeletonHTML = `
            <div class="users-loading">
                ${Array(6).fill(0).map(() => `
                    <div class="user-skeleton">
                        <div class="skeleton-avatar"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-line"></div>
                            <div class="skeleton-line short"></div>
                            <div class="skeleton-line medium"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        usersGrid.innerHTML = skeletonHTML;
    }
    
    function showEmptyState() {
        if (!usersGrid) return;
        
        const emptyHTML = `
            <div class="users-empty">
                <i class="fas fa-users"></i>
                <h3>No hay usuarios</h3>
                <p>Los usuarios del sistema aparecerán aquí una vez que sean creados.</p>
                <button class="btn btn-primary" onclick="showNewUserForm()">
                    <i class="fas fa-plus"></i>
                    Agregar Usuario
                </button>
            </div>
        `;
        
        usersGrid.innerHTML = emptyHTML;
    }
    
    // ===================================
    // FORMULARIOS
    // ===================================
    function showNewUserForm() {
        console.log('showNewUserForm llamado');
        isEditing = false;
        currentUser = null;
        showUserForm();
    }
    
    function showUserForm() {
        console.log('showUserForm iniciado');
        const formHTML = createUserForm();
        
        createModal(
            isEditing ? 'Editar Usuario' : 'Nuevo Usuario',
            formHTML,
            'large'
        );
        
        setupUserFormListeners();
    }
    
    function createModal(title, content, size = 'medium') {
        // Eliminar modal existente si existe
        const existingModal = document.getElementById('userModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.id = 'userModal';
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
            max-width: 800px !important;
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
                <button onclick="closeUserModal()" style="background: none; border: none; font-size: 18px; color: #7f8c8d; cursor: pointer; padding: 5px; border-radius: 8px; transition: all 0.3s ease;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="padding: 20px; background: rgb(40, 40, 41);">
                ${content}
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Cerrar al hacer clic en overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeUserModal();
            }
        });
    }
    
    function closeUserModal() {
        const modal = document.getElementById('userModal');
        if (modal) {
            modal.remove();
        }
    }
    
    function createUserForm() {
        const user = currentUser || {
            name: '',
            email: '',
            username: '',
            role: 'vendedor',
            phone: '',
            department: '',
            status: 'active'
        };
        
        return `
            <form id="userForm" class="user-form">
                <div class="form-section">
                    <h4 class="form-section-title">Información Personal</h4>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="userName" class="form-label">Nombre Completo *</label>
                            <input type="text" id="userName" name="name" class="form-control" 
                                   value="${user.name}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="userEmail" class="form-label">Email *</label>
                            <input type="email" id="userEmail" name="email" class="form-control" 
                                   value="${user.email}" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="userUsername" class="form-label">Nombre de Usuario *</label>
                            <input type="text" id="userUsername" name="username" class="form-control" 
                                   value="${user.username}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="userPhone" class="form-label">Teléfono</label>
                            <input type="tel" id="userPhone" name="phone" class="form-control" 
                                   value="${user.phone}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="userDepartment" class="form-label">Departamento</label>
                            <input type="text" id="userDepartment" name="department" class="form-control" 
                                   value="${user.department}">
                        </div>
                        
                        <div class="form-group">
                            <label for="userRole" class="form-label">Rol *</label>
                            <select id="userRole" name="role" class="form-control" required>
                                <option value="vendedor" ${user.role === 'vendedor' ? 'selected' : ''}>Vendedor</option>
                                <option value="inventarista" ${user.role === 'inventarista' ? 'selected' : ''}>Inventarista</option>
                                <option value="cajero" ${user.role === 'cajero' ? 'selected' : ''}>Cajero</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrador</option>
                                <option value="super_admin" ${user.role === 'super_admin' ? 'selected' : ''}>Super Administrador</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4 class="form-section-title">Configuración de Acceso</h4>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="userPassword" class="form-label">Contraseña ${isEditing ? '(dejar vacío para mantener actual)' : '*'}</label>
                            <input type="password" id="userPassword" name="password" class="form-control" 
                                   ${isEditing ? '' : 'required'}>
                        </div>
                        
                        <div class="form-group">
                            <label for="userConfirmPassword" class="form-label">Confirmar Contraseña ${isEditing ? '(dejar vacío para mantener actual)' : '*'}</label>
                            <input type="password" id="userConfirmPassword" name="confirmPassword" class="form-control" 
                                   ${isEditing ? '' : 'required'}>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="userStatus" class="form-label">Estado</label>
                        <select id="userStatus" name="status" class="form-control">
                            <option value="active" ${user.status === 'active' ? 'selected' : ''}>Activo</option>
                            <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactivo</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4 class="form-section-title">Permisos del Rol</h4>
                    <div class="permissions-preview" id="permissionsPreview">
                        ${generatePermissionsPreview(user.role)}
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeUserModal()">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${isEditing ? 'Actualizar' : 'Crear'} Usuario
                    </button>
                </div>
            </form>
        `;
    }
    
    function generatePermissionsPreview(role) {
        const roleInfo = ROLES[role];
        const permissions = roleInfo.permissions;
        
        let permissionsHTML = '<div class="permissions-list">';
        
        if (permissions.includes('all')) {
            permissionsHTML += '<div class="permission-item full-access"><i class="fas fa-crown"></i> Acceso Total</div>';
        } else {
            const permissionLabels = {
                'products': 'Gestión de Productos',
                'products_read': 'Ver Productos',
                'clients': 'Gestión de Clientes',
                'clients_read': 'Ver Clientes',
                'orders': 'Gestión de Pedidos',
                'orders_create': 'Crear Pedidos',
                'orders_process': 'Procesar Pedidos',
                'orders_read': 'Ver Pedidos',
                'inventory': 'Gestión de Inventario',
                'metrics': 'Métricas Completas',
                'metrics_basic': 'Métricas Básicas',
                'config_basic': 'Configuración Básica'
            };
            
            permissions.forEach(permission => {
                if (permissionLabels[permission]) {
                    permissionsHTML += `<div class="permission-item"><i class="fas fa-check"></i> ${permissionLabels[permission]}</div>`;
                }
            });
        }
        
        permissionsHTML += '</div>';
        return permissionsHTML;
    }
    
    function setupUserFormListeners() {
        const userForm = document.getElementById('userForm');
        const roleSelect = document.getElementById('userRole');
        const passwordInput = document.getElementById('userPassword');
        const confirmPasswordInput = document.getElementById('userConfirmPassword');
        
        if (userForm) {
            userForm.addEventListener('submit', handleUserSubmit);
        }
        
        if (roleSelect) {
            roleSelect.addEventListener('change', function() {
                const permissionsPreview = document.getElementById('permissionsPreview');
                if (permissionsPreview) {
                    permissionsPreview.innerHTML = generatePermissionsPreview(this.value);
                }
            });
        }
        
        if (passwordInput && confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', function() {
                if (this.value !== passwordInput.value) {
                    this.setCustomValidity('Las contraseñas no coinciden');
                } else {
                    this.setCustomValidity('');
                }
            });
        }
    }
    
    function handleUserSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            username: formData.get('username'),
            role: formData.get('role'),
            phone: formData.get('phone'),
            department: formData.get('department'),
            status: formData.get('status'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };
        
        // Validaciones
        if (!userData.name || !userData.email || !userData.username || !userData.role) {
            window.dashboard.showToast('Por favor completa todos los campos obligatorios', 'error');
            return;
        }
        
        if (!isEditing && (!userData.password || !userData.confirmPassword)) {
            window.dashboard.showToast('La contraseña es obligatoria para nuevos usuarios', 'error');
            return;
        }
        
        if (userData.password && userData.password !== userData.confirmPassword) {
            window.dashboard.showToast('Las contraseñas no coinciden', 'error');
            return;
        }
        
        if (isEditing) {
            updateUser(currentUser.id, userData);
        } else {
            createUser(userData);
        }
    }
    
    // ===================================
    // CRUD OPERATIONS
    // ===================================
    function createUser(userData) {
        const newUser = {
            ...userData,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            lastLogin: null,
            avatar: 'img/avatars/default.jpg'
        };
        
        // Remover campos de contraseña del objeto final
        delete newUser.password;
        delete newUser.confirmPassword;
        
        users.push(newUser);
        saveUsers();
        renderUsers();
        
        closeUserModal();
        window.dashboard.showToast('Usuario creado exitosamente', 'success');
    }
    
    function updateUser(userId, userData) {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            const updatedUser = {
                ...users[userIndex],
                ...userData,
                id: userId
            };
            
            // Remover campos de contraseña del objeto final
            delete updatedUser.password;
            delete updatedUser.confirmPassword;
            
            users[userIndex] = updatedUser;
            
            saveUsers();
            renderUsers();
            
            closeUserModal();
            window.dashboard.showToast('Usuario actualizado exitosamente', 'success');
        }
    }
    
    function deleteUser(userId) {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        const confirmationHTML = `
            <div class="confirmation-modal">
                <div class="confirmation-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="confirmation-message">
                    ¿Estás seguro de que quieres eliminar el usuario <strong>"${user.name}"</strong>?<br>
                    Esta acción no se puede deshacer.
                </div>
                <div class="confirmation-actions">
                    <button class="btn btn-secondary" onclick="closeUserModal()">
                        Cancelar
                    </button>
                    <button class="btn btn-danger" onclick="confirmDeleteUser(${userId})">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        `;
        
        createModal('Confirmar Eliminación', confirmationHTML);
    }
    
    function confirmDeleteUser(userId) {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            const userName = users[userIndex].name;
            users.splice(userIndex, 1);
            
            saveUsers();
            renderUsers();
            
            closeUserModal();
            window.dashboard.showToast(`Usuario "${userName}" eliminado exitosamente`, 'success');
        }
    }
    
    function editUser(userId) {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        isEditing = true;
        currentUser = user;
        showUserForm();
    }
    
    function viewUser(userId) {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        const profileHTML = createUserProfile(user);
        createModal(`Perfil de ${user.name}`, profileHTML, 'large');
    }
    
    function createUserProfile(user) {
        const roleInfo = ROLES[user.role];
        const createdAt = new Date(user.createdAt).toLocaleDateString('es-ES');
        const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-ES') : 'Nunca';
        const statusClass = user.status === 'active' ? 'active' : 'inactive';
        const statusText = user.status === 'active' ? 'Activo' : 'Inactivo';
        
        return `
            <div class="user-profile">
                <div class="profile-header">
                    <div class="profile-info">
                        <h3 class="profile-name">${user.name}</h3>
                        <p class="profile-email">${user.email}</p>
                        <span class="profile-role" style="background-color: ${roleInfo.color}20; color: ${roleInfo.color};">
                            <i class="${roleInfo.icon}"></i>
                            ${roleInfo.name}
                        </span>
                        <span class="profile-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="profile-stats">
                        <div class="stat-item">
                            <div class="stat-value">@${user.username}</div>
                            <div class="stat-label">Usuario</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${user.department}</div>
                            <div class="stat-label">Departamento</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${lastLogin}</div>
                            <div class="stat-label">Último Acceso</div>
                        </div>
                    </div>
                </div>
                
                <div class="profile-tabs">
                    <button class="profile-tab active" onclick="switchProfileTab('personal')">
                        <i class="fas fa-user"></i>
                        Personal
                    </button>
                    <button class="profile-tab" onclick="switchProfileTab('permissions')">
                        <i class="fas fa-shield-alt"></i>
                        Permisos
                    </button>
                    <button class="profile-tab" onclick="switchProfileTab('activity')">
                        <i class="fas fa-history"></i>
                        Actividad
                    </button>
                </div>
                
                <div class="profile-content">
                    <div class="profile-tab-content active" id="personal-tab">
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Teléfono</label>
                                <span>${user.phone || 'No especificado'}</span>
                            </div>
                            <div class="info-item">
                                <label>Departamento</label>
                                <span>${user.department || 'No especificado'}</span>
                            </div>
                            <div class="info-item">
                                <label>Fecha de Creación</label>
                                <span>${createdAt}</span>
                            </div>
                            <div class="info-item">
                                <label>Último Acceso</label>
                                <span>${lastLogin}</span>
                            </div>
                            <div class="info-item">
                                <label>Estado</label>
                                <span>${statusText}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-tab-content" id="permissions-tab">
                        <div class="permissions-section">
                            <h4>Permisos del Rol: ${roleInfo.name}</h4>
                            <div class="permissions-list">
                                ${generatePermissionsPreview(user.role)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-tab-content" id="activity-tab">
                        <div class="empty-state">
                            <i class="fas fa-history"></i>
                            <h4>Historial de Actividad</h4>
                            <p>El historial de actividad del usuario se mostrará aquí.</p>
                        </div>
                    </div>
                </div>
                
                <div class="profile-actions">
                    <button class="btn btn-secondary" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                        Editar Usuario
                    </button>
                    <button class="btn btn-primary" onclick="resetUserPassword(${user.id})">
                        <i class="fas fa-key"></i>
                        Resetear Contraseña
                    </button>
                </div>
            </div>
        `;
    }
    
    // ===================================
    // UTILIDADES
    // ===================================
    function addUserCardListeners() {
        // Los event listeners se agregan mediante onclick en el HTML generado
    }
    
    function setupControlsListeners() {
        // Búsqueda
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchTerm = e.target.value;
                currentPage = 1;
                renderUsers();
            });
        }
        
        // Filtros básicos
        const roleFilter = document.getElementById('roleFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (roleFilter) {
            roleFilter.addEventListener('change', (e) => {
                filters.role = e.target.value;
                currentPage = 1;
                renderUsers();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                filters.status = e.target.value;
                currentPage = 1;
                renderUsers();
            });
        }
        
        // Filtros avanzados
        const lastLoginFilter = document.getElementById('lastLoginFilter');
        const sortSelect = document.getElementById('sortSelect');
        const sortDirection = document.getElementById('sortDirection');
        
        if (lastLoginFilter) {
            lastLoginFilter.addEventListener('change', (e) => {
                filters.lastLogin = e.target.value;
            });
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                sortColumn = e.target.value;
                renderUsers();
            });
        }
        
        if (sortDirection) {
            sortDirection.addEventListener('change', (e) => {
                sortDirection = e.target.value;
                renderUsers();
            });
        }
    }
    
    function applyFiltersAndSearch() {
        filteredUsers = users.filter(user => {
            // Búsqueda por texto
            if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !user.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !user.username.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            
            // Filtro por rol
            if (filters.role && user.role !== filters.role) {
                return false;
            }
            
            // Filtro por estado
            if (filters.status && user.status !== filters.status) {
                return false;
            }
            
            // Filtro por último acceso
            if (filters.lastLogin && user.lastLogin) {
                const userLastLogin = new Date(user.lastLogin).toISOString().split('T')[0];
                if (userLastLogin !== filters.lastLogin) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Ordenar usuarios
        filteredUsers.sort((a, b) => {
            let aValue = a[sortColumn];
            let bValue = b[sortColumn];
            
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
    
    function renderPagination() {
        const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage + 1;
        const endIndex = Math.min(currentPage * itemsPerPage, filteredUsers.length);
        
        if (totalPages <= 1) return;
        
        const paginationHTML = `
            <div class="pagination-container">
                <div class="pagination-info">
                    Mostrando ${startIndex}-${endIndex} de ${filteredUsers.length} usuarios
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
        if (usersGrid && usersGrid.parentNode) {
            const existingPagination = usersGrid.parentNode.querySelector('.pagination-container');
            if (existingPagination) {
                existingPagination.remove();
            }
            usersGrid.parentNode.insertAdjacentHTML('beforeend', paginationHTML);
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
            role: '',
            status: '',
            lastLogin: ''
        };
        currentPage = 1;
        renderUsers();
    }
    
    function applyFilters() {
        currentPage = 1;
        renderUsers();
    }
    
    function sortUsers(column) {
        if (sortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = column;
            sortDirection = 'asc';
        }
        renderUsers();
    }
    
    function goToPage(page) {
        currentPage = page;
        renderUsers();
    }
    
    function changeItemsPerPage(newSize) {
        itemsPerPage = parseInt(newSize);
        currentPage = 1;
        renderUsers();
    }
    
    function toggleSelectAll(checkbox) {
        const isChecked = checkbox.checked;
        const userCheckboxes = document.querySelectorAll('.user-checkbox, .mobile-user-checkbox');
        
        userCheckboxes.forEach(cb => {
            if (cb !== checkbox) {
                cb.checked = isChecked;
                const userId = parseInt(cb.closest('[data-user-id]').dataset.userId);
                if (isChecked) {
                    selectedUsers.add(userId);
                } else {
                    selectedUsers.delete(userId);
                }
            }
        });
        
        renderUsers();
    }
    
    function toggleUserSelection(userId, checkbox) {
        if (checkbox.checked) {
            selectedUsers.add(userId);
        } else {
            selectedUsers.delete(userId);
        }
        renderUsers();
    }
    
    function toggleMobileDetails(userId) {
        const detailsElement = document.getElementById(`details-${userId}`);
        const toggleButton = document.querySelector(`[onclick="toggleMobileDetails(${userId})"]`);
        const icon = toggleButton.querySelector('i');
        
        if (detailsElement.style.display === 'none') {
            detailsElement.style.display = 'block';
            icon.className = 'fas fa-chevron-up';
        } else {
            detailsElement.style.display = 'none';
            icon.className = 'fas fa-chevron-down';
        }
    }
    
    function switchProfileTab(tabName) {
        // Ocultar todas las pestañas
        document.querySelectorAll('.profile-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Desactivar todos los botones
        document.querySelectorAll('.profile-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Mostrar la pestaña seleccionada
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Activar el botón correspondiente
        document.querySelector(`[onclick="switchProfileTab('${tabName}')"]`).classList.add('active');
    }
    
    function resetUserPassword(userId) {
        window.dashboard.showToast('Función de reseteo de contraseña - En desarrollo', 'info');
    }
    
    // showToast ahora se usa directamente desde window.dashboard.showToast
    
    // ===================================
    // FUNCIONES PÚBLICAS
    // ===================================
    window.loadUsuariosModule = function() {
        console.log('Cargando módulo de usuarios...');
        loadUsers();
    };
    
    // Funciones globales para los botones
    window.editUser = editUser;
    window.deleteUser = deleteUser;
    window.confirmDeleteUser = confirmDeleteUser;
    window.viewUser = viewUser;
    window.showNewUserForm = showNewUserForm;
    window.toggleAdvancedFilters = toggleAdvancedFilters;
    window.clearFilters = clearFilters;
    window.applyFilters = applyFilters;
    window.sortUsers = sortUsers;
    window.goToPage = goToPage;
    window.changeItemsPerPage = changeItemsPerPage;
    window.toggleSelectAll = toggleSelectAll;
    window.toggleUserSelection = toggleUserSelection;
    window.closeUserModal = closeUserModal;
    window.toggleMobileDetails = toggleMobileDetails;
    window.switchProfileTab = switchProfileTab;
    window.resetUserPassword = resetUserPassword;
    
    // ===================================
    // INICIALIZACIÓN
    // ===================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
