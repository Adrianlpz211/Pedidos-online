/* ===================================
   MÓDULO DE PEDIDOS DEL USUARIO
   Gestión de pedidos desde la perspectiva del cliente final
   =================================== */

console.log('📦 PEDIDOS-USUARIO.JS CARGADO');

// Variables globales
let userOrders = [];
let currentOrderTab = 'por-pagar';

// ===================================
// FUNCIONES PRINCIPALES
// ===================================

function loadPedidosModule() {
    console.log('📦 Cargando módulo de pedidos del usuario...');
    
    // Cargar pedidos del localStorage
    loadUserOrders();
    
    // Renderizar contenido
    const content = renderPedidosContent();
    console.log('📝 Contenido generado:', content);
    
    // Obtener o crear contenedor de pedidos
    let pedidosContainer = document.getElementById('pedidosContainer');
    if (!pedidosContainer) {
        console.log('🔧 Creando contenedor de pedidos...');
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            pedidosContainer = document.createElement('div');
            pedidosContainer.id = 'pedidosContainer';
            pedidosContainer.className = 'module-content';
            mainContent.appendChild(pedidosContainer);
        }
    }
    
    // Cargar contenido en el contenedor
    if (pedidosContainer) {
        pedidosContainer.innerHTML = content;
        console.log('✅ Contenido de pedidos cargado en contenedor');
    }
    
    // Actualizar contadores después de renderizar
    updateTabCounts();
    
    // Configurar event listeners
    setupPedidosEventListeners();
    
    console.log('✅ Módulo de pedidos cargado correctamente');
}

// Función para restaurar el contenido principal
function restaurarContenidoPrincipal() {
    console.log('🔄 Restaurando contenido principal...');
    
    // Ocultar contenedor de pedidos
    const pedidosContainer = document.getElementById('pedidosContainer');
    if (pedidosContainer) {
        pedidosContainer.style.display = 'none';
    }
    
    // Mostrar grid de productos original
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.style.display = 'grid';
    } else {
        // Si no existe, restaurarlo usando la función del menu-funcional
        if (window.restoreOriginalProductsGrid) {
            window.restoreOriginalProductsGrid();
        } else {
            // Fallback: recargar página
            console.warn('⚠️ No se pudo restaurar contenido, recargando página...');
            window.location.reload();
        }
    }
    
    console.log('✅ Contenido principal restaurado');
}

// Función para limpiar el historial de pedidos del usuario (solo pagados y cancelados)
function limpiarHistorialPedidos() {
    // Obtener pedidos actuales
    const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    
    // Contar pedidos a limpiar
    const pedidosPagados = userOrders.filter(order => order.status === 'pagado');
    const pedidosCancelados = userOrders.filter(order => order.status === 'cancelados');
    const totalALimpiar = pedidosPagados.length + pedidosCancelados.length;
    
    if (totalALimpiar === 0) {
        alert('No hay pedidos pagados o cancelados para limpiar');
        return;
    }
    
    // Mostrar confirmación
    const confirmacion = confirm(
        `¿Limpiar historial de pedidos?\n\n` +
        `Se eliminarán:\n` +
        `• ${pedidosPagados.length} pedido(s) pagado(s)\n` +
        `• ${pedidosCancelados.length} pedido(s) cancelado(s)\n\n` +
        `Los pedidos pendientes se mantendrán.`
    );
    
    if (confirmacion) {
        // Filtrar solo pedidos pendientes (por-pagar)
        const pedidosMantenidos = userOrders.filter(order => order.status === 'por-pagar');
        
        // Guardar solo los pedidos pendientes
        localStorage.setItem('userOrders', JSON.stringify(pedidosMantenidos));
        
        // Actualizar la vista
        refreshPedidosView();
        
        // Mostrar confirmación
        alert(`Historial limpiado exitosamente.\nSe eliminaron ${totalALimpiar} pedido(s) del historial.`);
    }
}

function renderPedidosContent() {
    return `
        <div class="pedidos-header">
            <h2 class="module-title">
                <i class="fas fa-shopping-bag"></i>
                Mis Pedidos
            </h2>
            <button class="btn-limpiar-historial" onclick="limpiarHistorialPedidos()">
                <i class="fas fa-trash"></i>
                Limpiar
            </button>
        </div>
        
        <div class="pedidos-tabs">
            <button class="tab-btn ${currentOrderTab === 'por-pagar' ? 'active' : ''}" data-tab="por-pagar">
                <i class="fas fa-clock"></i>
                Por Pagar
                <span class="tab-count" id="porPagarCount">0</span>
            </button>
            <button class="tab-btn ${currentOrderTab === 'pagado' ? 'active' : ''}" data-tab="pagado">
                <i class="fas fa-check-circle"></i>
                Pagado
                <span class="tab-count" id="pagadoCount">0</span>
            </button>
            <button class="tab-btn ${currentOrderTab === 'cancelados' ? 'active' : ''}" data-tab="cancelados">
                <i class="fas fa-times-circle"></i>
                Cancelados
                <span class="tab-count" id="canceladosCount">0</span>
            </button>
        </div>
        
        <div class="pedidos-content">
            <div class="tab-content active" id="porPagarContent">
                ${renderOrdersList('por-pagar')}
            </div>
            <div class="tab-content" id="pagadoContent">
                ${renderOrdersList('pagado')}
            </div>
            <div class="tab-content" id="canceladosContent">
                ${renderOrdersList('cancelados')}
            </div>
        </div>
    `;
}

function renderOrdersList(status) {
    console.log(`📋 Renderizando lista de pedidos: ${status}`);
    
    // Mapear los status para compatibilidad
    const statusMap = {
        'por-pagar': ['por-pagar', 'por_pagar'],
        'pagado': ['pagado'],
        'cancelados': ['cancelados']
    };
    
    const validStatuses = statusMap[status] || [status];
    const orders = userOrders.filter(order => validStatuses.includes(order.status));
    
    console.log(`📊 Pedidos encontrados para ${status}:`, orders.length);
    console.log(`🔍 Status válidos buscados:`, validStatuses);
    console.log(`📦 Status de pedidos existentes:`, userOrders.map(o => o.status));
    
    if (orders.length === 0) {
        console.log(`📭 No hay pedidos ${getStatusText(status)}`);
        return `
            <div class="empty-state">
                <i class="fas fa-shopping-bag"></i>
                <h3>No hay pedidos ${getStatusText(status)}</h3>
                <p>${getEmptyStateMessage(status)}</p>
            </div>
        `;
    }
    
    console.log(`✅ Renderizando ${orders.length} pedidos`);
    return `
        <div class="orders-list">
            ${orders.map(order => renderOrderCard(order)).join('')}
        </div>
    `;
}

function renderOrderCard(order) {
    const total = calculateOrderTotal(order);
    const canReturn = order.status === 'pagado' || order.status === 'procesado';
    const isCredito = order.credito && order.credito.habilitado;
    
    return `
        <div class="order-card" data-order-id="${order.id}">
            <div class="pedido-info">
                <div class="pedido-numero">Pedido #${order.id}</div>
                <div class="pedido-fecha">${formatDate(order.date)}</div>
                <div class="pedido-cliente">Cliente: Usuario</div>
                <div class="pedido-total">Total: $${formatPrice(total)}</div>
                ${order.status === 'devuelto' ? '<div class="pedido-estado devuelto">Devuelto</div>' : ''}
                
                ${isCredito ? createCuotasInfoHTML(order) : ''}
            </div>
            
            <div class="pedido-acciones">
                <button class="btn btn-primary btn-sm" onclick="viewOrderDetails(${order.id})">
                    <i class="fas fa-eye"></i>
                    Ver
                </button>
                ${false && canReturn ? `
                    <button class="btn btn-outline-danger btn-sm" onclick="solicitarDevolucion('${order.id}', '${order.items[0]?.id || '1'}')">
                        <i class="fas fa-undo"></i>
                        Devolver
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// ===================================
// FUNCIONES DE CUOTAS
// ===================================

function createCuotasInfoHTML(order) {
    if (!order.credito || !order.credito.habilitado) return '';
    
    const cuotasPagadas = order.credito.cuotasPagadas;
    const totalCuotas = order.credito.cuotas;
    const cuotasPendientes = totalCuotas - cuotasPagadas;
    const porcentaje = (cuotasPagadas / totalCuotas) * 100;
    
    return `
        <div class="cuotas-info-card">
            <div class="cuotas-header">
                <i class="fas fa-credit-card"></i>
                <span class="cuotas-title">Pago a Crédito</span>
            </div>
            
            <div class="cuotas-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${porcentaje}%"></div>
                </div>
                <div class="progress-text">
                    ${cuotasPagadas} de ${totalCuotas} cuotas pagadas
                </div>
            </div>
            
            <div class="cuotas-details">
                <div class="cuota-item">
                    <span class="cuota-label">Monto por cuota:</span>
                    <span class="cuota-value">$${order.credito.montoPorCuota.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;
}

// ===================================
// FUNCIONES DE UTILIDAD
// ===================================

function getStatusText(status) {
    const statusTexts = {
        'por-pagar': 'por pagar',
        'pagado': 'pagados',
        'cancelados': 'cancelados'
    };
    return statusTexts[status] || status;
}

function getStatusClass(status) {
    const statusClasses = {
        'por-pagar': 'status-pending',
        'pagado': 'status-paid',
        'cancelados': 'status-cancelled'
    };
    return statusClasses[status] || '';
}

function getEmptyStateMessage(status) {
    const messages = {
        'por-pagar': 'Cuando realices un pedido, aparecerá aquí hasta que lo pagues.',
        'pagado': 'Los pedidos que hayas pagado aparecerán aquí.',
        'cancelados': 'Los pedidos cancelados aparecerán aquí.'
    };
    return messages[status] || '';
}

function calculateOrderTotal(order) {
    const itemsTotal = order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryCost = order.delivery ? (order.deliveryCost || 0) : 0;
    return itemsTotal + deliveryCost;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-CO').format(price);
}

// ===================================
// FUNCIONES DE GESTIÓN DE PEDIDOS
// ===================================

function loadUserOrders() {
    console.log('💾 Cargando pedidos del localStorage...');
    const savedOrders = localStorage.getItem('userOrders');
    console.log('📦 Datos guardados:', savedOrders);
    
    if (savedOrders) {
        userOrders = JSON.parse(savedOrders);
        console.log('✅ Pedidos parseados:', userOrders);
    } else {
        userOrders = [];
        console.log('📭 No hay pedidos guardados, inicializando array vacío');
    }
    
    console.log(`📦 Pedidos cargados: ${userOrders.length}`);
}

function saveUserOrders() {
    localStorage.setItem('userOrders', JSON.stringify(userOrders));
    console.log('💾 Pedidos guardados en localStorage');
}

function addUserOrder(orderData) {
    const newOrder = {
        id: Date.now(),
        date: new Date().toISOString(),
        status: 'por-pagar',
        ...orderData
    };
    
    userOrders.unshift(newOrder);
    saveUserOrders();
    updateTabCounts();
    
    console.log('✅ Nuevo pedido agregado:', newOrder);
    return newOrder;
}

function updateOrderStatus(orderId, newStatus) {
    const orderIndex = userOrders.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
        userOrders[orderIndex].status = newStatus;
        saveUserOrders();
        updateTabCounts();
        
        // Si estamos viendo el módulo de pedidos, actualizar la vista
        if (document.getElementById('pedidosModule').style.display !== 'none') {
            refreshPedidosView();
        }
        
        console.log(`✅ Estado del pedido ${orderId} actualizado a: ${newStatus}`);
        return true;
    }
    return false;
}

function cancelOrder(orderId) {
    if (confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
        updateOrderStatus(orderId, 'cancelados');
        
        // Mostrar toast de confirmación
        if (typeof showToast === 'function') {
            showToast('Pedido cancelado correctamente', 'success', '✅ Cancelado');
        }
    }
}

function viewOrderDetails(orderId) {
    const order = userOrders.find(o => o.id == orderId || o.id === orderId);
    if (!order) return;
    
    const modalContent = `
        <div class="order-details">
            <div class="order-details-header">
                <h3>Pedido #${order.id}</h3>
                <span class="order-date">${formatDate(order.date)}</span>
            </div>
            
            <div class="order-details-items">
                <h4>Productos:</h4>
                ${order.items.map(item => `
                    <div class="detail-item">
                        <span class="item-name">${item.name}</span>
                        <span class="item-quantity">Cantidad: ${item.quantity}</span>
                        <span class="item-price">$${formatPrice(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Crear modal personalizado para el frontend
    createOrderModal('Productos del Pedido', modalContent);
}

// ===================================
// FUNCIONES DE INTERFAZ
// ===================================

function createOrderModal(title, content) {
    // Cerrar modal existente si hay uno
    const existingModal = document.querySelector('.order-modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'order-modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'order-modal';
    modal.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 0;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        transform: scale(0.9);
        transition: transform 0.3s ease;
    `;
    
    // Crear header
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 20px;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8f9fa;
        border-radius: 12px 12px 0 0;
    `;
    
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.style.cssText = `
        margin: 0;
        color: #495057;
        font-size: 18px;
        font-weight: 600;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
        background: none;
        border: none;
        font-size: 24px;
        color: #6c757d;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease;
    `;
    
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.backgroundColor = '#e9ecef';
    });
    
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.backgroundColor = 'transparent';
    });
    
    closeButton.addEventListener('click', () => {
        overlay.remove();
    });
    
    header.appendChild(titleElement);
    header.appendChild(closeButton);
    
    // Crear body
    const body = document.createElement('div');
    body.style.cssText = `
        padding: 20px;
    `;
    body.innerHTML = content;
    
    // Ensamblar modal
    modal.appendChild(header);
    modal.appendChild(body);
    overlay.appendChild(modal);
    
    // Agregar al DOM
    console.log('📝 Agregando modal al DOM');
    document.body.appendChild(overlay);
    console.log('✅ Modal agregado al DOM');
    
    // Animar entrada
    setTimeout(() => {
        console.log('🎬 Iniciando animación de entrada');
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }, 10);
    
    // Cerrar al hacer clic en overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    // Cerrar con ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

function setupPedidosEventListeners() {
    // Event listeners para tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tab) {
    currentOrderTab = tab;
    
    // Recargar pedidos del localStorage antes de renderizar
    loadUserOrders();
    
    // Actualizar botones de tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Actualizar contenido de las tabs
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Mapear los nombres de tabs a los IDs correctos
    const tabIdMap = {
        'por-pagar': 'porPagarContent',
        'pagado': 'pagadoContent',
        'cancelados': 'canceladosContent'
    };
    
    const tabId = tabIdMap[tab] || `${tab}Content`;
    const activeTabContent = document.getElementById(tabId);
    
    if (activeTabContent) {
        activeTabContent.classList.add('active');
        // Re-renderizar el contenido de la tab activa
        const newContent = renderOrdersList(tab);
        console.log(`🎨 Contenido generado para ${tab}:`, newContent);
        activeTabContent.innerHTML = newContent;
        console.log(`✅ Contenido insertado en ${tabId}`);
    } else {
        console.error(`❌ No se encontró el elemento ${tabId}`);
        console.log('🔍 Elementos disponibles:', document.querySelectorAll('[id*="Content"]'));
    }
    
    // Actualizar contadores
    updateTabCounts();
    
    console.log(`📦 Cambiado a tab: ${tab}`);
}

function updateTabCounts() {
    const statusMap = {
        'por-pagar': ['por-pagar', 'por_pagar'],
        'pagado': ['pagado'],
        'cancelados': ['cancelados']
    };
    
    const counts = {
        'por-pagar': userOrders.filter(o => statusMap['por-pagar'].includes(o.status)).length,
        'pagado': userOrders.filter(o => statusMap['pagado'].includes(o.status)).length,
        'cancelados': userOrders.filter(o => statusMap['cancelados'].includes(o.status)).length
    };
    
    console.log('📊 Conteos actualizados:', counts);
    
    Object.keys(counts).forEach(status => {
        const countElement = document.getElementById(`${status}Count`);
        if (countElement) {
            countElement.textContent = counts[status];
        }
    });
}

function refreshPedidosView() {
    console.log('🔄 Refrescando vista de pedidos...');
    
    // Recargar pedidos del localStorage
    loadUserOrders();
    
    // Solo actualizar la tab activa sin regenerar todo el contenido
    const activeTab = currentOrderTab || 'por-pagar';
    
    // Mapear los nombres de tabs a los IDs correctos
    const tabIdMap = {
        'por-pagar': 'porPagarContent',
        'pagado': 'pagadoContent',
        'cancelados': 'canceladosContent'
    };
    
    const tabId = tabIdMap[activeTab] || `${activeTab}Content`;
    const activeTabContent = document.getElementById(tabId);
    
    if (activeTabContent) {
        // Solo actualizar el contenido de la tab activa
        const newContent = renderOrdersList(activeTab);
        activeTabContent.innerHTML = newContent;
        console.log(`✅ Contenido actualizado para tab ${activeTab}`);
    }
    
    // Actualizar contadores
    updateTabCounts();
    
    console.log('✅ Vista de pedidos actualizada');
}

// Hacer la función disponible globalmente
window.refreshPedidosView = refreshPedidosView;

// ===================================
// FUNCIONES PÚBLICAS
// ===================================

// Función para ser llamada desde index.js cuando se confirma un pedido
window.addUserOrder = addUserOrder;

// Función para ser llamada desde el dashboard cuando se actualiza el estado de un pedido
window.updateUserOrderStatus = updateOrderStatus;

// Función para cargar el módulo
window.loadPedidosModule = loadPedidosModule;

// Función para restaurar contenido
window.restaurarContenidoPrincipal = restaurarContenidoPrincipal;

// Función para limpiar historial de pedidos
window.limpiarHistorialPedidos = limpiarHistorialPedidos;

console.log('✅ Pedidos-usuario.js inicializado correctamente');
