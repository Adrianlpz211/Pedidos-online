/* ===================================
   MÓDULO CLIENTES - JAVASCRIPT
   =================================== */

(function() {
    'use strict';
    
    console.log('Módulo Clientes cargado');
    
    // Variables del módulo
    let clients = [];
    let filteredClients = [];
    let currentClient = null;
    let isEditing = false;
    let currentPage = 1;
    let itemsPerPage = 10;
    let sortColumn = 'name';
    let sortDirection = 'asc';
    let searchTerm = '';
    let selectedClients = new Set();
    let filters = {
        city: '',
        status: '',
        registrationDate: ''
    };
    
    // Elementos del DOM
    const clientsGrid = document.getElementById('clientsGrid');
    const btnNuevoCliente = document.getElementById('btnNuevoCliente');
    
    // ===================================
    // INICIALIZACIÓN
    // ===================================
    function init() {
        setupEventListeners();
        loadClients();
        
        // Listener para redimensionar ventana
        window.addEventListener('resize', () => {
            if (clientsGrid && clientsGrid.innerHTML) {
                renderClients();
            }
        });
        
        console.log('Módulo Clientes inicializado');
    }
    
    // ===================================
    // EVENT LISTENERS
    // ===================================
    function setupEventListeners() {
        if (btnNuevoCliente) {
            btnNuevoCliente.addEventListener('click', showNewClientForm);
        }
    }
    
    // ===================================
    // CARGA DE CLIENTES
    // ===================================
    function loadClients() {
        console.log('Cargando clientes...');
        
        // Mostrar loading
        showLoadingState();
        
        // Simular carga de datos
        setTimeout(() => {
            const savedClients = localStorage.getItem('dashboardClients');
            if (savedClients) {
                try {
                    clients = JSON.parse(savedClients);
                } catch (error) {
                    console.error('Error al cargar clientes:', error);
                    clients = [];
                }
            } else {
                // Datos de ejemplo
                clients = getSampleClients();
                saveClients();
            }
            
            renderClients();
        }, 500);
    }
    
    function getSampleClients() {
        return [
            {
                id: 1,
                name: 'María González',
                phone: '+584121234567',
                city: 'Caracas',
                address: 'Av. Francisco de Miranda, Torre A, Piso 5, Apt 501',
                email: 'maria.gonzalez@email.com',
                status: 'active',
                registrationDate: '2024-01-15',
                lastPurchase: '2024-03-10',
                totalPurchases: 5,
                totalSpent: 1250000,
                favoriteProducts: 12,
                avatar: 'img/avatars/user1.jpg'
            },
            {
                id: 2,
                name: 'Carlos Rodríguez',
                phone: '+584129876543',
                city: 'Valencia',
                address: 'Calle 85, Edificio Los Pinos, Apt 302',
                email: 'carlos.rodriguez@email.com',
                status: 'active',
                registrationDate: '2024-02-20',
                lastPurchase: '2024-03-08',
                totalPurchases: 3,
                totalSpent: 850000,
                favoriteProducts: 8,
                avatar: 'img/avatars/user2.jpg'
            },
            {
                id: 3,
                name: 'Ana Martínez',
                phone: '+584145678901',
                city: 'Maracaibo',
                address: 'Zona Norte, Calle 78, Casa #45',
                email: 'ana.martinez@email.com',
                status: 'inactive',
                registrationDate: '2024-01-05',
                lastPurchase: '2024-02-15',
                totalPurchases: 2,
                totalSpent: 450000,
                favoriteProducts: 5,
                avatar: 'img/avatars/user3.jpg'
            }
        ];
    }
    
    function saveClients() {
        try {
            localStorage.setItem('dashboardClients', JSON.stringify(clients));
            console.log('Clientes guardados');
        } catch (error) {
            console.error('Error al guardar clientes:', error);
        }
    }
    
    // ===================================
    // RENDERIZADO
    // ===================================
    function renderClients() {
        if (!clientsGrid) return;
        
        // Aplicar filtros y búsqueda
        applyFiltersAndSearch();
        
        if (filteredClients.length === 0) {
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
        addClientCardListeners();
    }
    
    function renderControls() {
        const controlsHTML = `
            <div class="clients-controls">
                <div class="controls-row">
                    <div class="controls-left">
                        <div class="search-box">
                            <input type="text" class="search-input" id="clientSearch" 
                                   placeholder="Buscar clientes..." value="${searchTerm}">
                            <i class="fas fa-search search-icon"></i>
                        </div>
                        <select class="filter-select" id="cityFilter">
                            <option value="">Todas las ciudades</option>
                            <option value="Caracas" ${filters.city === 'Caracas' ? 'selected' : ''}>Caracas</option>
                            <option value="Valencia" ${filters.city === 'Valencia' ? 'selected' : ''}>Valencia</option>
                            <option value="Maracaibo" ${filters.city === 'Maracaibo' ? 'selected' : ''}>Maracaibo</option>
                            <option value="Barquisimeto" ${filters.city === 'Barquisimeto' ? 'selected' : ''}>Barquisimeto</option>
                        </select>
                        <select class="filter-select" id="statusFilter">
                            <option value="">Todos los estados</option>
                            <option value="active" ${filters.status === 'active' ? 'selected' : ''}>Activos</option>
                            <option value="inactive" ${filters.status === 'inactive' ? 'selected' : ''}>Inactivos</option>
                        </select>
                    </div>
                    <div class="controls-right">
                        <button class="btn btn-primary" onclick="showNewClientForm()">
                            <i class="fas fa-plus"></i>
                            <span class="btn-text">Nuevo Cliente</span>
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
                            <label class="filter-label">Fecha de Registro</label>
                            <input type="date" class="filter-input" id="registrationDateFilter" 
                                   value="${filters.registrationDate}">
                        </div>
                        <div class="filter-group">
                            <label class="filter-label">Ordenar por</label>
                            <select class="filter-input" id="sortSelect">
                                <option value="name" ${sortColumn === 'name' ? 'selected' : ''}>Nombre</option>
                                <option value="city" ${sortColumn === 'city' ? 'selected' : ''}>Ciudad</option>
                                <option value="registrationDate" ${sortColumn === 'registrationDate' ? 'selected' : ''}>Fecha Registro</option>
                                <option value="totalSpent" ${sortColumn === 'totalSpent' ? 'selected' : ''}>Total Gastado</option>
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
        if (clientsGrid && clientsGrid.parentNode) {
            const existingControls = clientsGrid.parentNode.querySelector('.clients-controls');
            if (existingControls) {
                existingControls.remove();
            }
            clientsGrid.parentNode.insertAdjacentHTML('afterbegin', controlsHTML);
            
            // Configurar event listeners de controles
            setupControlsListeners();
        }
    }
    
    function renderTableView() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageClients = filteredClients.slice(startIndex, endIndex);
        
        const tableHTML = `
            <div class="clients-table-container">
                <table class="clients-table">
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" id="selectAll" onchange="toggleSelectAll(this)">
                            </th>
                            <th class="sortable" onclick="sortClients('name')">Cliente</th>
                            <th class="sortable" onclick="sortClients('city')">Ciudad</th>
                            <th class="sortable" onclick="sortClients('phone')">Teléfono</th>
                            <th class="sortable" onclick="sortClients('totalSpent')">Total Gastado</th>
                            <th class="sortable" onclick="sortClients('status')">Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pageClients.map(client => createTableRow(client)).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        clientsGrid.innerHTML = tableHTML;
        clientsGrid.style.width = '100%';
        clientsGrid.className = 'clients-grid table-view';
    }
    
    function renderMobileCardsView() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageClients = filteredClients.slice(startIndex, endIndex);
        
        const cardsHTML = `
            <div class="mobile-clients-grid">
                ${pageClients.map(client => createMobileCard(client)).join('')}
            </div>
        `;
        
        clientsGrid.innerHTML = cardsHTML;
        clientsGrid.className = 'clients-grid mobile-cards-view';
    }
    
    function createTableRow(client) {
        const statusClass = client.status === 'active' ? 'active' : 'inactive';
        const statusText = client.status === 'active' ? 'Activo' : 'Inactivo';
        const isSelected = selectedClients.has(client.id);
        
        return `
            <tr class="${isSelected ? 'selected' : ''}" data-client-id="${client.id}">
                <td>
                    <input type="checkbox" class="client-checkbox" 
                           ${isSelected ? 'checked' : ''} 
                           onchange="toggleClientSelection(${client.id}, this)">
                </td>
                <td>
                    <div class="client-name">${client.name}</div>
                    <div class="client-email">${client.email}</div>
                </td>
                <td>${client.city}</td>
                <td>
                    <div class="client-phone">${client.phone}</div>
                </td>
                <td>
                    <div class="client-total">$${client.totalSpent.toLocaleString()}</div>
                    <div class="client-purchases">${client.totalPurchases} compras</div>
                </td>
                <td>
                    <span class="client-status-small ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="client-actions-small">
                        <button class="btn btn-primary btn-sm" onclick="viewClient(${client.id})" title="Ver perfil">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="editClient(${client.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteClient(${client.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
    
    function createMobileCard(client) {
        const statusClass = client.status === 'active' ? 'active' : 'inactive';
        const statusText = client.status === 'active' ? 'Activo' : 'Inactivo';
        const isSelected = selectedClients.has(client.id);
        
        return `
            <div class="mobile-client-card ${isSelected ? 'selected' : ''}" data-client-id="${client.id}">
                <div class="mobile-client-header">
                    <input type="checkbox" class="mobile-client-checkbox" 
                           ${isSelected ? 'checked' : ''} 
                           onchange="toggleClientSelection(${client.id}, this)">
                    <div class="mobile-client-info">
                        <h3 class="mobile-client-name">${client.name}</h3>
                        <p class="mobile-client-email">${client.email}</p>
                        <span class="mobile-client-status ${statusClass}">${statusText}</span>
                    </div>
                    <button class="mobile-details-toggle" onclick="toggleMobileDetails(${client.id})">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                
                <div class="mobile-client-details" id="details-${client.id}" style="display: none;">
                    <div class="mobile-detail-row">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${client.city}</span>
                    </div>
                    <div class="mobile-detail-row">
                        <i class="fas fa-phone"></i>
                        <span>${client.phone}</span>
                    </div>
                    <div class="mobile-detail-row">
                        <i class="fas fa-shopping-cart"></i>
                        <span>$${client.totalSpent.toLocaleString()} (${client.totalPurchases} compras)</span>
                    </div>
                    <div class="mobile-detail-row">
                        <i class="fas fa-heart"></i>
                        <span>${client.favoriteProducts} favoritos</span>
                    </div>
                </div>
                
                <div class="mobile-client-actions">
                    <button class="mobile-btn-view" onclick="viewClient(${client.id})">
                        <i class="fas fa-eye"></i>
                        Ver
                    </button>
                    <button class="mobile-btn-edit" onclick="editClient(${client.id})">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button class="mobile-btn-delete" onclick="deleteClient(${client.id})">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }
    
    function showLoadingState() {
        if (!clientsGrid) return;
        
        const skeletonHTML = `
            <div class="clients-loading">
                ${Array(6).fill(0).map(() => `
                    <div class="client-skeleton">
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
        
        clientsGrid.innerHTML = skeletonHTML;
    }
    
    function showEmptyState() {
        if (!clientsGrid) return;
        
        const emptyHTML = `
            <div class="clients-empty">
                <i class="fas fa-users"></i>
                <h3>No hay clientes</h3>
                <p>Los clientes registrados aparecerán aquí una vez que se registren en tu tienda.</p>
                <button class="btn btn-primary" onclick="showNewClientForm()">
                    <i class="fas fa-plus"></i>
                    Agregar Cliente
                </button>
            </div>
        `;
        
        clientsGrid.innerHTML = emptyHTML;
    }
    
    // ===================================
    // FORMULARIOS
    // ===================================
    function showNewClientForm() {
        console.log('showNewClientForm llamado');
        isEditing = false;
        currentClient = null;
        showClientForm();
    }
    
    function showClientForm() {
        console.log('showClientForm iniciado');
        const formHTML = createClientForm();
        
        createModal(
            isEditing ? 'Editar Cliente' : 'Nuevo Cliente',
            formHTML,
            'large'
        );
        
        setupClientFormListeners();
    }
    
    function createModal(title, content, size = 'medium') {
        // Eliminar modal existente si existe
        const existingModal = document.getElementById('clientModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.id = 'clientModal';
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
                <button onclick="closeClientModal()" style="background: none; border: none; font-size: 18px; color: #7f8c8d; cursor: pointer; padding: 5px; border-radius: 8px; transition: all 0.3s ease;">
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
                closeClientModal();
            }
        });
    }
    
    function closeClientModal() {
        const modal = document.getElementById('clientModal');
        if (modal) {
            modal.remove();
        }
    }
    
    function createClientForm() {
        const client = currentClient || {
            name: '',
            phone: '',
            city: '',
            address: '',
            email: '',
            status: 'active'
        };
        
        return `
            <form id="clientForm" class="client-form">
                <div class="form-section">
                    <h4 class="form-section-title">Información Personal</h4>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="clientName" class="form-label">Nombre y Apellido *</label>
                            <input type="text" id="clientName" name="name" class="form-control" 
                                   value="${client.name}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="clientEmail" class="form-label">Email</label>
                            <input type="email" id="clientEmail" name="email" class="form-control" 
                                   value="${client.email}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="clientPhone" class="form-label">Teléfono *</label>
                            <input type="tel" id="clientPhone" name="phone" class="form-control" 
                                   value="${client.phone}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="clientCity" class="form-label">Ciudad *</label>
                            <input type="text" id="clientCity" name="city" class="form-control" 
                                   value="${client.city}" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="clientAddress" class="form-label">Dirección *</label>
                        <textarea id="clientAddress" name="address" class="form-control" 
                                  rows="2" required>${client.address}</textarea>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4 class="form-section-title">Configuración</h4>
                    
                    <div class="form-group">
                        <label for="clientStatus" class="form-label">Estado</label>
                        <select id="clientStatus" name="status" class="form-control">
                            <option value="active" ${client.status === 'active' ? 'selected' : ''}>Activo</option>
                            <option value="inactive" ${client.status === 'inactive' ? 'selected' : ''}>Inactivo</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeClientModal()">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${isEditing ? 'Actualizar' : 'Crear'} Cliente
                    </button>
                </div>
            </form>
        `;
    }
    
    function setupClientFormListeners() {
        const clientForm = document.getElementById('clientForm');
        if (clientForm) {
            clientForm.addEventListener('submit', handleClientSubmit);
        }
    }
    
    function handleClientSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const clientData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            city: formData.get('city'),
            address: formData.get('address'),
            email: formData.get('email'),
            status: formData.get('status')
        };
        
        // Validaciones
        if (!clientData.name || !clientData.phone || !clientData.city || !clientData.address) {
            window.dashboard.showToast('Por favor completa todos los campos obligatorios', 'error');
            return;
        }
        
        if (isEditing) {
            updateClient(currentClient.id, clientData);
        } else {
            createClient(clientData);
        }
    }
    
    // ===================================
    // CRUD OPERATIONS
    // ===================================
    function createClient(clientData) {
        const newClient = {
            ...clientData,
            id: Date.now(),
            registrationDate: new Date().toISOString().split('T')[0],
            lastPurchase: null,
            totalPurchases: 0,
            totalSpent: 0,
            favoriteProducts: 0,
            avatar: 'img/avatars/default.jpg'
        };
        
        clients.push(newClient);
        saveClients();
        renderClients();
        
        closeClientModal();
        window.dashboard.showToast('Cliente creado exitosamente', 'success');
    }
    
    function updateClient(clientId, clientData) {
        const clientIndex = clients.findIndex(c => c.id === clientId);
        if (clientIndex !== -1) {
            clients[clientIndex] = {
                ...clients[clientIndex],
                ...clientData,
                id: clientId
            };
            
            saveClients();
            renderClients();
            
            closeClientModal();
            window.dashboard.showToast('Cliente actualizado exitosamente', 'success');
        }
    }
    
    function deleteClient(clientId) {
        const client = clients.find(c => c.id === clientId);
        if (!client) return;
        
        const confirmationHTML = `
            <div class="confirmation-modal">
                <div class="confirmation-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="confirmation-message">
                    ¿Estás seguro de que quieres eliminar el cliente <strong>"${client.name}"</strong>?<br>
                    Esta acción no se puede deshacer.
                </div>
                <div class="confirmation-actions">
                    <button class="btn btn-secondary" onclick="closeClientModal()">
                        Cancelar
                    </button>
                    <button class="btn btn-danger" onclick="confirmDeleteClient(${clientId})">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        `;
        
        createModal('Confirmar Eliminación', confirmationHTML);
    }
    
    function confirmDeleteClient(clientId) {
        const clientIndex = clients.findIndex(c => c.id === clientId);
        if (clientIndex !== -1) {
            const clientName = clients[clientIndex].name;
            clients.splice(clientIndex, 1);
            
            saveClients();
            renderClients();
            
            closeClientModal();
            window.dashboard.showToast(`Cliente "${clientName}" eliminado exitosamente`, 'success');
        }
    }
    
    function editClient(clientId) {
        const client = clients.find(c => c.id === clientId);
        if (!client) return;
        
        isEditing = true;
        currentClient = client;
        showClientForm();
    }
    
    function viewClient(clientId) {
        const client = clients.find(c => c.id === clientId);
        if (!client) return;
        
        const profileHTML = createClientProfile(client);
        createModal(`Perfil de ${client.name}`, profileHTML, 'large');
    }
    
    function createClientProfile(client) {
        const registrationDate = new Date(client.registrationDate).toLocaleDateString('es-ES');
        const lastPurchase = client.lastPurchase ? new Date(client.lastPurchase).toLocaleDateString('es-ES') : 'Nunca';
        const statusClass = client.status === 'active' ? 'active' : 'inactive';
        const statusText = client.status === 'active' ? 'Activo' : 'Inactivo';
        
        return `
            <div class="client-profile">
                <div class="profile-header">
                    <div class="profile-info">
                        <h3 class="profile-name">${client.name}</h3>
                        <p class="profile-email">${client.email}</p>
                        <span class="profile-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="profile-stats">
                        <div class="stat-item">
                            <div class="stat-value">$${client.totalSpent.toLocaleString()}</div>
                            <div class="stat-label">Total Gastado</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${client.totalPurchases}</div>
                            <div class="stat-label">Compras</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${client.favoriteProducts}</div>
                            <div class="stat-label">Favoritos</div>
                        </div>
                    </div>
                </div>
                
                <div class="profile-tabs">
                    <button class="profile-tab active" onclick="switchProfileTab('personal')">
                        <i class="fas fa-user"></i>
                        Personal
                    </button>
                    <button class="profile-tab" onclick="switchProfileTab('compras')">
                        <i class="fas fa-shopping-cart"></i>
                        Compras
                    </button>
                    <button class="profile-tab" onclick="switchProfileTab('favoritos')">
                        <i class="fas fa-heart"></i>
                        Favoritos
                    </button>
                </div>
                
                <div class="profile-content">
                    <div class="profile-tab-content active" id="personal-tab">
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Teléfono</label>
                                <span>${client.phone}</span>
                            </div>
                            <div class="info-item">
                                <label>Ciudad</label>
                                <span>${client.city}</span>
                            </div>
                            <div class="info-item">
                                <label>Dirección</label>
                                <span>${client.address}</span>
                            </div>
                            <div class="info-item">
                                <label>Fecha de Registro</label>
                                <span>${registrationDate}</span>
                            </div>
                            <div class="info-item">
                                <label>Última Compra</label>
                                <span>${lastPurchase}</span>
                            </div>
                            <div class="info-item">
                                <label>Promedio por Compra</label>
                                <span>$${client.totalPurchases > 0 ? Math.round(client.totalSpent / client.totalPurchases).toLocaleString() : '0'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-tab-content" id="compras-tab">
                        <div class="empty-state">
                            <i class="fas fa-shopping-cart"></i>
                            <h4>Historial de Compras</h4>
                            <p>El historial de compras se mostrará aquí cuando el cliente realice pedidos.</p>
                        </div>
                    </div>
                    
                    <div class="profile-tab-content" id="favoritos-tab">
                        <div class="empty-state">
                            <i class="fas fa-heart"></i>
                            <h4>Productos Favoritos</h4>
                            <p>Los productos favoritos se mostrarán aquí cuando el cliente los marque.</p>
                        </div>
                    </div>
                </div>
                
                <div class="profile-actions">
                    <button class="btn btn-secondary" onclick="editClient(${client.id})">
                        <i class="fas fa-edit"></i>
                        Editar Cliente
                    </button>
                    <button class="btn btn-primary" onclick="contactClient(${client.id})">
                        <i class="fas fa-envelope"></i>
                        Contactar
                    </button>
                </div>
            </div>
        `;
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
    
    function contactClient(clientId) {
        const client = clients.find(c => c.id === clientId);
        if (!client) return;
        
        const message = `Hola ${client.name}, te contactamos desde nuestra tienda. ¿En qué podemos ayudarte?`;
        const whatsappUrl = `https://wa.me/${client.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        window.dashboard.showToast(`Abriendo WhatsApp para contactar a ${client.name}`, 'success');
    }
    
    // ===================================
    // UTILIDADES
    // ===================================
    function addClientCardListeners() {
        // Los event listeners se agregan mediante onclick en el HTML generado
    }
    
    function setupControlsListeners() {
        // Búsqueda
        const searchInput = document.getElementById('clientSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchTerm = e.target.value;
                currentPage = 1;
                renderClients();
            });
        }
        
        // Filtros básicos
        const cityFilter = document.getElementById('cityFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (cityFilter) {
            cityFilter.addEventListener('change', (e) => {
                filters.city = e.target.value;
                currentPage = 1;
                renderClients();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                filters.status = e.target.value;
                currentPage = 1;
                renderClients();
            });
        }
        
        // Filtros avanzados
        const registrationDateFilter = document.getElementById('registrationDateFilter');
        const sortSelect = document.getElementById('sortSelect');
        const sortDirection = document.getElementById('sortDirection');
        
        if (registrationDateFilter) {
            registrationDateFilter.addEventListener('change', (e) => {
                filters.registrationDate = e.target.value;
            });
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                sortColumn = e.target.value;
                renderClients();
            });
        }
        
        if (sortDirection) {
            sortDirection.addEventListener('change', (e) => {
                sortDirection = e.target.value;
                renderClients();
            });
        }
    }
    
    function applyFiltersAndSearch() {
        filteredClients = clients.filter(client => {
            // Búsqueda por texto
            if (searchTerm && !client.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !client.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !client.phone.includes(searchTerm)) {
                return false;
            }
            
            // Filtro por ciudad
            if (filters.city && client.city !== filters.city) {
                return false;
            }
            
            // Filtro por estado
            if (filters.status && client.status !== filters.status) {
                return false;
            }
            
            // Filtro por fecha de registro
            if (filters.registrationDate && client.registrationDate !== filters.registrationDate) {
                return false;
            }
            
            return true;
        });
        
        // Ordenar clientes
        filteredClients.sort((a, b) => {
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
        const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage + 1;
        const endIndex = Math.min(currentPage * itemsPerPage, filteredClients.length);
        
        if (totalPages <= 1) return;
        
        const paginationHTML = `
            <div class="pagination-container">
                <div class="pagination-info">
                    Mostrando ${startIndex}-${endIndex} de ${filteredClients.length} clientes
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
        if (clientsGrid && clientsGrid.parentNode) {
            const existingPagination = clientsGrid.parentNode.querySelector('.pagination-container');
            if (existingPagination) {
                existingPagination.remove();
            }
            clientsGrid.parentNode.insertAdjacentHTML('beforeend', paginationHTML);
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
            city: '',
            status: '',
            registrationDate: ''
        };
        currentPage = 1;
        renderClients();
    }
    
    function applyFilters() {
        currentPage = 1;
        renderClients();
    }
    
    function sortClients(column) {
        if (sortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = column;
            sortDirection = 'asc';
        }
        renderClients();
    }
    
    function goToPage(page) {
        currentPage = page;
        renderClients();
    }
    
    function changeItemsPerPage(newSize) {
        itemsPerPage = parseInt(newSize);
        currentPage = 1;
        renderClients();
    }
    
    function toggleSelectAll(checkbox) {
        const isChecked = checkbox.checked;
        const clientCheckboxes = document.querySelectorAll('.client-checkbox, .mobile-client-checkbox');
        
        clientCheckboxes.forEach(cb => {
            if (cb !== checkbox) {
                cb.checked = isChecked;
                const clientId = parseInt(cb.closest('[data-client-id]').dataset.clientId);
                if (isChecked) {
                    selectedClients.add(clientId);
                } else {
                    selectedClients.delete(clientId);
                }
            }
        });
        
        renderClients();
    }
    
    function toggleClientSelection(clientId, checkbox) {
        if (checkbox.checked) {
            selectedClients.add(clientId);
        } else {
            selectedClients.delete(clientId);
        }
        renderClients();
    }
    
    // showToast ahora se usa directamente desde window.dashboard.showToast
    
    // ===================================
    // FUNCIONES PÚBLICAS
    // ===================================
    window.loadClientesModule = function() {
        console.log('Cargando módulo de clientes...');
        loadClients();
    };
    
    // ===================================
    // FUNCIONES DEL ACORDEÓN MÓVIL
    // ===================================
    function toggleMobileDetails(clientId) {
        const detailsElement = document.getElementById(`details-${clientId}`);
        const toggleButton = document.querySelector(`[onclick="toggleMobileDetails(${clientId})"]`);
        const icon = toggleButton.querySelector('i');
        
        if (detailsElement.style.display === 'none') {
            detailsElement.style.display = 'block';
            icon.className = 'fas fa-chevron-up';
        } else {
            detailsElement.style.display = 'none';
            icon.className = 'fas fa-chevron-down';
        }
    }
    
    // Funciones globales para los botones
    window.editClient = editClient;
    window.deleteClient = deleteClient;
    window.confirmDeleteClient = confirmDeleteClient;
    window.viewClient = viewClient;
    window.showNewClientForm = showNewClientForm;
    window.toggleAdvancedFilters = toggleAdvancedFilters;
    window.clearFilters = clearFilters;
    window.applyFilters = applyFilters;
    window.sortClients = sortClients;
    window.goToPage = goToPage;
    window.changeItemsPerPage = changeItemsPerPage;
    window.toggleSelectAll = toggleSelectAll;
    window.toggleClientSelection = toggleClientSelection;
    window.closeClientModal = closeClientModal;
    window.toggleMobileDetails = toggleMobileDetails;
    window.switchProfileTab = switchProfileTab;
    window.contactClient = contactClient;
    
    // ===================================
    // INICIALIZACIÓN
    // ===================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
