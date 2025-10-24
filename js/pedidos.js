/* ===================================
   MÓDULO PEDIDOS - JAVASCRIPT
   =================================== */

(function() {
    'use strict';
    
    console.log('Módulo Pedidos cargado');
    
    // Variables del módulo
    let pedidos = [];
    let filteredPedidos = [];
    let currentPedido = null;
    let currentPage = 1;
    let itemsPerPage = 10;
    let searchTerm = '';
    let estadoFilter = '';
    let fechaFilter = '';
    
    // Elementos del DOM
    let pedidosGrid = document.getElementById('pedidosGrid');
    let btnNuevoPedido = document.getElementById('btnNuevoPedido');
    let btnDeliveryConfig = document.getElementById('btnDeliveryConfig');
    let btnProcesarVentas = document.getElementById('btnProcesarVentas');
    let pedidosSearch = document.getElementById('pedidosSearch');
    let estadoFilterSelect = document.getElementById('estadoFilter');
    let fechaFilterInput = document.getElementById('fechaFilter');
    
    // ===================================
    // INICIALIZACIÓN
    // ===================================
    function init() {
        console.log('🚀 Inicializando módulo de pedidos...');
        console.log('🔍 Elementos del DOM:');
        console.log('- pedidosGrid:', !!pedidosGrid);
        console.log('- btnNuevoPedido:', !!btnNuevoPedido);
        console.log('- btnDeliveryConfig:', !!btnDeliveryConfig);
        console.log('- btnProcesarVentas:', !!btnProcesarVentas);
        console.log('- pedidosSearch:', !!pedidosSearch);
        
        setupEventListeners();
        loadPedidos();
        updateProcesarVentasButton();
        
        // Listener para redimensionar ventana
        window.addEventListener('resize', () => {
            if (pedidosGrid && pedidosGrid.innerHTML) {
                renderPedidos();
            }
        });
        
        console.log('✅ Módulo Pedidos inicializado correctamente');
    }
    
    // ===================================
    // EVENT LISTENERS
    // ===================================
    function setupEventListeners() {
        if (btnNuevoPedido) {
            btnNuevoPedido.addEventListener('click', showCajaModal);
        }
        
        if (btnDeliveryConfig) {
            console.log('✅ Botón de delivery config encontrado');
            btnDeliveryConfig.addEventListener('click', function() {
                console.log('🚚 Botón de delivery clickeado');
                openDeliveryConfig();
            });
        } else {
            console.error('❌ Botón btnDeliveryConfig no encontrado');
            console.log('🔍 Elementos disponibles:', document.querySelectorAll('button[id*="delivery"]'));
        }
        
        if (btnProcesarVentas) {
            console.log('✅ Botón de procesar ventas encontrado');
            btnProcesarVentas.addEventListener('click', function() {
                console.log('💰 Botón de procesar ventas clickeado');
                procesarVentas();
            });
        } else {
            console.error('❌ Botón btnProcesarVentas no encontrado');
        }
        
        if (pedidosSearch) {
            pedidosSearch.addEventListener('input', handleSearch);
        }
        
        if (estadoFilterSelect) {
            estadoFilterSelect.addEventListener('change', handleFilter);
        }
        
        if (fechaFilterInput) {
            fechaFilterInput.addEventListener('change', handleFilter);
        }
    }
    
    // ===================================
    // CARGA DE DATOS
    // ===================================
    function loadPedidos() {
        console.log('Cargando pedidos...');
        
        // Cargar pedidos desde localStorage
        const savedPedidos = localStorage.getItem('pedidos');
        pedidos = savedPedidos ? JSON.parse(savedPedidos) : [];
        
        // Solo crear pedidos de ejemplo si no hay pedidos
        if (pedidos.length === 0) {
            createSamplePedidos();
        }
        
        // Sincronizar con pedidos del usuario (userOrders) - solo si hay cambios
        const userOrders = localStorage.getItem('userOrders');
        if (userOrders) {
            const userOrdersData = JSON.parse(userOrders);
            console.log('📦 Sincronizando con pedidos del usuario:', userOrdersData.length);
            
            // Obtener IDs de pedidos en historial para no sincronizarlos
            const historial = JSON.parse(localStorage.getItem('pedidosHistorial') || '[]');
            const idsEnHistorial = Array.isArray(historial) ? historial.map(pedido => pedido.id) : [];
            
            // Filtrar solo pedidos que no existen en el dashboard
            const pedidosParaSincronizar = userOrdersData.filter(userOrder => {
                const existingPedido = pedidos.find(p => p.id == userOrder.id || p.id === userOrder.id);
                const estaEnHistorial = idsEnHistorial.includes(userOrder.id);
                return !existingPedido && !estaEnHistorial;
            });
            
            // Convertir solo los pedidos nuevos al formato del dashboard
            pedidosParaSincronizar.forEach(userOrder => {
                const dashboardPedido = {
                    id: userOrder.id,
                    numero: `PED-${userOrder.id.toString().slice(-3)}`,
                    cliente: {
                        nombre: 'Cliente Online',
                        telefono: 'N/A',
                        email: 'cliente@online.com'
                    },
                    productos: userOrder.items.map(item => ({
                        id: item.id || item.productId || Date.now() + Math.random(),
                        nombre: item.name,
                        cantidad: item.quantity,
                        precio: item.price
                    })),
                    subtotal: userOrder.subtotal || userOrder.total,
                    impuestos: 0,
                    descuentos: 0,
                    total: userOrder.total,
                    estado: userOrder.status === 'por-pagar' ? 'pendiente' : 
                            userOrder.status === 'pagado' ? 'pagado' : 
                            userOrder.status === 'cancelados' ? 'cancelado' : 'pendiente',
                    fechaCreacion: userOrder.date || userOrder.createdAt,
                    fechaModificacion: new Date().toISOString(),
                    notas: '', // AGREGAR: igual que hardcodeados
                    delivery: userOrder.delivery || false, // AGREGAR: información de delivery
                    deliveryCost: userOrder.deliveryCost || 0, // AGREGAR: costo de delivery
                    deliveryAddress: userOrder.deliveryAddress || userOrder.address || null, // AGREGAR: dirección de delivery
                    modalidadPago: userOrder.modalidadPago || 'contado', // AGREGAR: modalidad de pago
                    credito: userOrder.credito || null // AGREGAR: información de crédito
                };
                
                pedidos.unshift(dashboardPedido);
            });
            
            // Solo guardar si hay cambios
            if (pedidosParaSincronizar.length > 0) {
                localStorage.setItem('pedidos', JSON.stringify(pedidos));
            }
        
        // Actualizar pedidos existentes con información de crédito
        actualizarPedidosConCredito();
        }
        
        filteredPedidos = [...pedidos];
        renderPedidos();
        updateProcesarVentasButton();
        
        console.log(`📊 Total de pedidos cargados: ${pedidos.length}`);
    }
    
    function actualizarPedidosConCredito() {
        console.log('🔄 Actualizando pedidos existentes con información de crédito...');
        
        // Obtener userOrders para buscar información de crédito
        const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        let actualizado = false;
        
        // Actualizar cada pedido existente
        pedidos.forEach(pedido => {
            const userOrder = userOrders.find(uo => uo.id === pedido.id);
            if (userOrder && userOrder.credito && !pedido.credito) {
                console.log(`✅ Actualizando pedido ${pedido.numero} con información de crédito`);
                pedido.credito = userOrder.credito;
                pedido.modalidadPago = userOrder.modalidadPago || 'contado';
                actualizado = true;
            }
        });
        
        // Guardar cambios si hubo actualizaciones
        if (actualizado) {
            localStorage.setItem('pedidos', JSON.stringify(pedidos));
            console.log('✅ Pedidos actualizados con información de crédito');
        }
    }
    
    function createSamplePedidos() {
        pedidos = [
            {
                id: 1,
                numero: 'PED-001',
                cliente: {
                    nombre: 'Juan Pérez',
                    telefono: '+1234567890',
                    email: 'juan@email.com'
                },
                productos: [
                    { id: 1, nombre: 'Laptop HP', cantidad: 1, precio: 800 },
                    { id: 2, nombre: 'Mouse Inalámbrico', cantidad: 2, precio: 25 }
                ],
                subtotal: 850,
                impuestos: 0,
                descuentos: 0,
                total: 850,
                estado: 'pendiente',
                fechaCreacion: new Date().toISOString(),
                fechaModificacion: new Date().toISOString(),
                notas: 'Entrega urgente',
            },
            {
                id: 2,
                numero: 'PED-002',
                cliente: {
                    nombre: 'María García',
                    telefono: '+0987654321',
                    email: 'maria@email.com'
                },
                productos: [
                    { id: 3, nombre: 'Monitor Samsung', cantidad: 1, precio: 300 }
                ],
                subtotal: 300,
                impuestos: 0,
                descuentos: 0,
                total: 300,
                estado: 'pagado',
                fechaCreacion: new Date(Date.now() - 86400000).toISOString(),
                fechaModificacion: new Date().toISOString(),
                notas: '',
            },
            {
                id: 3,
                numero: 'PED-003',
                cliente: {
                    nombre: 'Carlos López',
                    telefono: '+1122334455',
                    email: 'carlos@email.com'
                },
                productos: [
                    { id: 4, nombre: 'Teclado Mecánico', cantidad: 1, precio: 120 }
                ],
                subtotal: 120,
                impuestos: 0,
                descuentos: 0,
                total: 120,
                estado: 'procesado',
                fechaCreacion: new Date(Date.now() - 172800000).toISOString(),
                fechaModificacion: new Date().toISOString(),
                notas: 'Ya entregado',
            }
        ];
        
        savePedidos();
    }
    
    function savePedidos() {
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
    }
    
    // ===================================
    // RENDERIZADO
    // ===================================
    function renderPedidos() {
        console.log('🎨 Renderizando pedidos...');
        console.log('🔍 pedidosGrid encontrado:', !!pedidosGrid);
        console.log('📊 filteredPedidos.length:', filteredPedidos.length);
        
        if (!pedidosGrid) {
            console.error('❌ pedidosGrid no encontrado');
            return;
        }
        
        if (filteredPedidos.length === 0) {
            console.log('📭 No hay pedidos para mostrar');
            pedidosGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h4>No hay pedidos</h4>
                    <p>Los pedidos aparecerán aquí cuando se creen</p>
                </div>
            `;
            return;
        }
        
        console.log('✅ Renderizando', filteredPedidos.length, 'pedidos');
        
        // B3.1 - DocumentFragment para optimización
        const fragment = document.createDocumentFragment();
        
        filteredPedidos.forEach(pedido => {
            const cardHTML = createPedidoCard(pedido);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cardHTML;
            fragment.appendChild(tempDiv.firstElementChild);
        });
        
        // Limpiar y agregar todos los pedidos de una vez
        pedidosGrid.innerHTML = '';
        pedidosGrid.appendChild(fragment);
        
        console.log('✅ Pedidos renderizados correctamente con DocumentFragment');
    }
    
    
    function createPedidoCard(pedido) {
        const estadoClass = `estado-${pedido.estado}`;
        const fechaFormateada = new Date(pedido.fechaCreacion).toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
        const horaFormateada = new Date(pedido.fechaCreacion).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const estadoLabels = {
            'pendiente': 'Por Pagar',
            'pagado': 'Pagado',
            'procesado': 'Procesado',
            'cancelado': 'Cancelado',
            'por-pagar': 'Por Pagar'
        };
        
        return `
            <div class="pedido-card ${estadoClass}">
                <div class="pedido-info">
                    <div class="pedido-numero">${pedido.numero}</div>
                    <div class="pedido-cliente">${pedido.cliente.nombre}</div>
                    <div class="pedido-fecha">${fechaFormateada}</div>
                    <div class="pedido-hora">${horaFormateada}</div>
                    <div class="pedido-total">$${pedido.total.toLocaleString()}</div>
                </div>
                
                <div class="pedido-actions">
                    <div class="estado-dropdown ${estadoClass}">
                        <span>${estadoLabels[pedido.estado]}</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <button class="btn-ver-pedido" onclick="verDetallePedido(${pedido.id})">
                        <i class="fas fa-eye"></i>
                        Ver
                    </button>
                </div>
            </div>
        `;
    }
    
    function getPedidoActions(pedido) {
        let actions = '';
        
        switch (pedido.estado) {
            case 'pendiente':
            case 'por-pagar':
                actions = `
                    <button class="btn-action btn-confirmar" onclick="confirmarPago(${pedido.id})">
                        <i class="fas fa-check"></i>
                        Confirmar Pago
                    </button>
                    <button class="btn-action btn-cancelar" onclick="cancelarPedido(${pedido.id})">
                        <i class="fas fa-times"></i>
                        Cancelar
                    </button>
                `;
                break;
            case 'pagado':
                actions = `
                    <button class="btn-action btn-ver" onclick="verDetallePedido(${pedido.id})">
                        <i class="fas fa-eye"></i>
                        Ver Detalle
                    </button>
                    <button class="btn-action btn-cancelar" onclick="cancelarPedido(${pedido.id})">
                        <i class="fas fa-times"></i>
                        Cancelar
                    </button>
                `;
                break;
            case 'procesado':
                actions = `
                    <button class="btn-action btn-ver" onclick="verDetallePedido(${pedido.id})">
                        <i class="fas fa-eye"></i>
                        Ver Detalle
                    </button>
                `;
                break;
            case 'cancelado':
                actions = `
                    <button class="btn-action btn-ver" onclick="verDetallePedido(${pedido.id})">
                        <i class="fas fa-eye"></i>
                        Ver Detalle
                    </button>
                `;
                break;
        }
        
        return actions;
    }
    
    // ===================================
    // FUNCIONES DE PEDIDOS
    // ===================================
    
    function showCajaModal() {
        console.log('💰 Abriendo modal de Caja...');
        const cajaHTML = createCajaModal();
        
        if (window.dashboard && window.dashboard.openModal) {
            console.log('✅ Usando sistema de modales del dashboard');
            window.dashboard.openModal('Caja', cajaHTML, 'large');
            
            // Forzar visibilidad del modal después de un breve delay
            setTimeout(() => {
                const modalOverlay = document.getElementById('modalOverlay');
                const modal = document.getElementById('modal');
                if (modalOverlay && modal) {
                    console.log('🔧 Forzando visibilidad del modal de Caja...');
                    modalOverlay.style.display = 'flex';
                    modalOverlay.style.visibility = 'visible';
                    modalOverlay.style.opacity = '1';
                    modalOverlay.style.zIndex = '9999';
                    modal.style.display = 'block';
                    modal.style.visibility = 'visible';
                    modal.style.opacity = '1';
                    console.log('✅ Modal de Caja forzado a ser visible');
                } else {
                    console.error('❌ Elementos del modal no encontrados');
                }
            }, 100);
        } else {
            console.error('❌ Dashboard openModal no disponible');
        }
    }
    
    function createCajaModal() {
        // Calcular indicadores
        const totalPedidos = pedidos.length;
        const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'pagado').length;
        const pedidosCancelados = pedidos.filter(p => p.estado === 'cancelado').length;
        const pedidosProcesados = pedidos.filter(p => p.estado === 'procesado').length;
        
        const totalIngresos = pedidos
            .filter(p => p.estado === 'procesado')
            .reduce((sum, p) => sum + (p.total || 0), 0);
        
        const totalPendiente = pedidos
            .filter(p => p.estado === 'pendiente' || p.estado === 'pagado')
            .reduce((sum, p) => sum + (p.total || 0), 0);
        
        return `
            <div class="caja-container">
                <div class="caja-header">
                    <h3><i class="fas fa-cash-register"></i> Resumen de Caja</h3>
                    <p class="caja-subtitle">Indicadores de ventas y pedidos</p>
                </div>
                
                <div class="caja-actions-top">
                    <button class="btn btn-warning" onclick="limpiarPedidos()">
                        <i class="fas fa-broom"></i>
                        Limpiar
                    </button>
                    <button class="btn btn-info" onclick="mostrarHistorial()">
                        <i class="fas fa-history"></i>
                        Historial
                    </button>
                </div>
                
                <div class="indicators-grid">
                    <div class="indicator-card total">
                        <div class="indicator-icon">
                            <i class="fas fa-shopping-bag"></i>
                        </div>
                        <div class="indicator-content">
                            <h4>Total Pedidos</h4>
                            <span class="indicator-value">${totalPedidos}</span>
                            <p class="indicator-description">Pedidos realizados</p>
                        </div>
                    </div>
                    
                    <div class="indicator-card ingresos">
                        <div class="indicator-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="indicator-content">
                            <h4>Total Ingresos</h4>
                            <span class="indicator-value">$${totalIngresos.toLocaleString()}</span>
                            <p class="indicator-description">Ventas procesadas</p>
                        </div>
                    </div>
                    
                    <div class="indicator-card pendiente">
                        <div class="indicator-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="indicator-content">
                            <h4>Por Procesar</h4>
                            <span class="indicator-value">$${totalPendiente.toLocaleString()}</span>
                            <p class="indicator-description">${pedidosPendientes} pedidos pendientes</p>
                        </div>
                    </div>
                    
                    <div class="indicator-card cancelados">
                        <div class="indicator-icon">
                            <i class="fas fa-times-circle"></i>
                        </div>
                        <div class="indicator-content">
                            <h4>Cancelados</h4>
                            <span class="indicator-value">${pedidosCancelados}</span>
                            <p class="indicator-description">Pedidos cancelados</p>
                        </div>
                    </div>
                    
                    <div class="indicator-card procesados">
                        <div class="indicator-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="indicator-content">
                            <h4>Procesados</h4>
                            <span class="indicator-value">${pedidosProcesados}</span>
                            <p class="indicator-description">Pedidos completados</p>
                        </div>
                    </div>
                    
                    <div class="indicator-card promedio">
                        <div class="indicator-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="indicator-content">
                            <h4>Promedio</h4>
                            <span class="indicator-value">$${totalPedidos > 0 ? Math.round(totalIngresos / totalPedidos) : 0}</span>
                            <p class="indicator-description">Por pedido</p>
                        </div>
                    </div>
                </div>
                
                <div class="caja-actions">
                    <button class="btn btn-primary" onclick="window.dashboard.closeModal()">
                        <i class="fas fa-check"></i>
                        Cerrar
                    </button>
                </div>
            </div>
        `;
    }
    
    // Actualizar userOrders después de limpiar pedidos para evitar que vuelvan a aparecer
    function actualizarUserOrdersDespuesDeLimpieza(pedidosALimpiar) {
        console.log('🔄 Actualizando userOrders después de limpieza...');
        
        // Obtener userOrders actuales
        const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        console.log('📦 userOrders antes de actualizar:', userOrders.length);
        
        // Obtener IDs de pedidos limpiados (SOLO procesados y cancelados del dashboard)
        const idsALimpiar = pedidosALimpiar.map(p => p.id);
        console.log('🗑️ IDs a limpiar de userOrders:', idsALimpiar);
        
        // Filtrar userOrders para remover SOLO los procesados y cancelados del dashboard
        // NO tocar los pagados y cancelados del historial del usuario
        const userOrdersActualizados = userOrders.filter(userOrder => {
            const estaEnListaParaLimpiar = idsALimpiar.includes(userOrder.id);
            
            if (estaEnListaParaLimpiar) {
                // Solo eliminar si NO es un pedido pagado o cancelado del historial del usuario
                const esPedidoDelHistorial = userOrder.status === 'pagado' || userOrder.status === 'cancelados';
                
                if (esPedidoDelHistorial) {
                    console.log('✅ MANTENIENDO en userOrders (pedido del historial del usuario):', userOrder.id, 'estado:', userOrder.status);
                    return true; // Mantener en userOrders
                } else {
                    console.log('❌ Removiendo de userOrders (procesado/cancelado del dashboard):', userOrder.id, 'estado:', userOrder.status);
                    return false; // Eliminar de userOrders
                }
            }
            
            return true; // Mantener todos los demás pedidos
        });
        
        // Guardar userOrders actualizados
        localStorage.setItem('userOrders', JSON.stringify(userOrdersActualizados));
        console.log('✅ userOrders actualizados:', userOrdersActualizados.length);
        console.log('📊 Pedidos removidos de userOrders:', userOrders.length - userOrdersActualizados.length);
    }
    
    // ===================================
    // FUNCIONES DE CAJA
    // ===================================
    function limpiarPedidos() {
        console.log('🧹 Iniciando limpieza de pedidos...');
        
        // Contar pedidos a limpiar (SOLO procesados y cancelados del dashboard)
        const pedidosALimpiar = pedidos.filter(p => p.estado === 'procesado' || p.estado === 'cancelado');
        const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'pagado');
        
        if (pedidosALimpiar.length === 0) {
            console.log('ℹ️ No hay pedidos para limpiar');
            if (window.dashboard && window.dashboard.showToast) {
                window.dashboard.showToast('No hay pedidos procesados o cancelados para limpiar', 'info');
            }
            return;
        }
        
        // Mostrar confirmación
        if (confirm(`¿Limpiar ${pedidosALimpiar.length} pedido(s) procesados/cancelados?\n\nSe mantendrán ${pedidosPendientes.length} pedido(s) pendientes.`)) {
            console.log('🧹 ANTES de limpiar - Total pedidos:', pedidos.length);
            console.log('🧹 Pedidos a limpiar:', pedidosALimpiar.map(p => ({ id: p.id, numero: p.numero, estado: p.estado })));
            
            // Guardar pedidos limpiados en historial
            guardarEnHistorial(pedidosALimpiar);
            
            // Filtrar solo pedidos pendientes y pagados
            pedidos = pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'pagado');
            console.log('🧹 DESPUÉS de filtrar - Total pedidos:', pedidos.length);
            console.log('🧹 Pedidos restantes:', pedidos.map(p => ({ id: p.id, numero: p.numero, estado: p.estado })));
            
            // ACTUALIZAR TAMBIÉN userOrders para evitar que vuelvan a aparecer
            actualizarUserOrdersDespuesDeLimpieza(pedidosALimpiar);
            
            // Guardar cambios
            savePedidos();
            
            // Actualizar vistas SIN recargar desde localStorage
            filteredPedidos = [...pedidos];
            renderPedidos();
            updateProcesarVentasButton();
            
            console.log(`✅ Limpieza completada: ${pedidosALimpiar.length} pedidos movidos al historial`);
            
            if (window.dashboard && window.dashboard.showToast) {
                window.dashboard.showToast(`Limpieza completada: ${pedidosALimpiar.length} pedidos movidos al historial`, 'success');
            }
            
            // Cerrar modal de caja
            if (window.dashboard && window.dashboard.closeModal) {
                window.dashboard.closeModal();
            }
        }
    }
    
    function guardarEnHistorial(pedidosALimpiar) {
        // Obtener historial existente
        let historial = JSON.parse(localStorage.getItem('pedidosHistorial') || '[]');
        
        // Agregar pedidos con timestamp de limpieza
        const pedidosConTimestamp = pedidosALimpiar.map(pedido => ({
            ...pedido,
            fechaLimpieza: new Date().toISOString(),
            motivoLimpieza: pedido.estado === 'procesado' ? 'Procesado' : 'Cancelado'
        }));
        
        historial = historial.concat(pedidosConTimestamp);
        
        // Guardar historial
        localStorage.setItem('pedidosHistorial', JSON.stringify(historial));
        
        console.log(`📚 ${pedidosConTimestamp.length} pedidos guardados en historial`);
    }
    
    function mostrarHistorial() {
        console.log('📚 Mostrando historial de pedidos...');
        
        const historial = JSON.parse(localStorage.getItem('pedidosHistorial') || '[]');
        
        if (historial.length === 0) {
            if (window.dashboard && window.dashboard.showToast) {
                window.dashboard.showToast('No hay pedidos en el historial', 'info');
            }
            return;
        }
        
        const historialHTML = createHistorialModal(historial);
        
        if (window.dashboard && window.dashboard.openModal) {
            window.dashboard.openModal('Historial de Pedidos', historialHTML, 'large');
            
            // Forzar visibilidad del modal
            setTimeout(() => {
                const modalOverlay = document.getElementById('modalOverlay');
                const modal = document.getElementById('modal');
                if (modalOverlay && modal) {
                    modalOverlay.style.display = 'flex';
                    modalOverlay.style.visibility = 'visible';
                    modalOverlay.style.opacity = '1';
                    modalOverlay.style.zIndex = '9999';
                    modal.style.display = 'block';
                    modal.style.visibility = 'visible';
                    modal.style.opacity = '1';
                }
            }, 100);
        }
    }
    
    function createHistorialModal(historial) {
        // Agrupar por fecha de limpieza
        const historialAgrupado = historial.reduce((acc, pedido) => {
            const fecha = new Date(pedido.fechaLimpieza).toLocaleDateString();
            if (!acc[fecha]) acc[fecha] = [];
            acc[fecha].push(pedido);
            return acc;
        }, {});
        
        return `
            <div class="historial-container">
                <div class="historial-header">
                    <h3><i class="fas fa-history"></i> Historial de Pedidos</h3>
                    <p class="historial-subtitle">Pedidos procesados y cancelados</p>
                </div>
                
                <div class="historial-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total en historial:</span>
                        <span class="stat-value">${historial.length}</span>
                    </div>
                </div>
                
                <div class="historial-content">
                    ${Object.keys(historialAgrupado).map(fecha => `
                        <div class="historial-group">
                            <h4 class="historial-fecha">${fecha}</h4>
                            <div class="historial-pedidos">
                                ${historialAgrupado[fecha].map(pedido => `
                                    <div class="historial-pedido ${pedido.estado}">
                                        <div class="pedido-info">
                                            <span class="pedido-numero">${pedido.numero}</span>
                                            <span class="pedido-cliente">${pedido.cliente?.nombre || 'Cliente'}</span>
                                            <span class="pedido-total">$${pedido.total?.toLocaleString() || '0'}</span>
                                        </div>
                                        <div class="pedido-estado">
                                            <span class="estado-badge ${pedido.estado}">${pedido.motivoLimpieza}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="historial-actions">
                    <button class="btn btn-secondary" onclick="window.dashboard.closeModal()">
                        <i class="fas fa-times"></i>
                        Cerrar
                    </button>
                </div>
            </div>
        `;
    }
    
    // Hacer las funciones globales
    window.limpiarPedidos = limpiarPedidos;
    window.mostrarHistorial = mostrarHistorial;
    
    function showNewPedidoForm() {
        console.log('📦 Abriendo modal de Nuevo Pedido...');
        const newPedidoHTML = createNewPedidoModal();
        
        if (window.dashboard && window.dashboard.openModal) {
            console.log('✅ Usando sistema de modales del dashboard');
            window.dashboard.openModal('Nuevo Pedido', newPedidoHTML, 'large');
            
            // Forzar visibilidad del modal después de un breve delay
            setTimeout(() => {
                const modalOverlay = document.getElementById('modalOverlay');
                const modal = document.getElementById('modal');
                if (modalOverlay && modal) {
                    console.log('🔧 Forzando visibilidad del modal de Nuevo Pedido...');
                    modalOverlay.style.display = 'flex';
                    modalOverlay.style.visibility = 'visible';
                    modalOverlay.style.opacity = '1';
                    modalOverlay.style.zIndex = '9999';
                    modal.style.display = 'block';
                    modal.style.visibility = 'visible';
                    modal.style.opacity = '1';
                    console.log('✅ Modal de Nuevo Pedido forzado a ser visible');
                } else {
                    console.error('❌ Elementos del modal no encontrados');
                }
            }, 100);
        } else {
            console.error('❌ Dashboard openModal no disponible');
        }
    }
    
    function createNewPedidoModal() {
        return `
            <div class="new-pedido-container">
                <div class="pedido-form">
                    <div class="form-section">
                        <h4>Información del Cliente</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nombre Completo *</label>
                                <input type="text" class="form-control" id="clienteNombre" placeholder="Nombre del cliente">
                            </div>
                            <div class="form-group">
                                <label>Teléfono *</label>
                                <input type="tel" class="form-control" id="clienteTelefono" placeholder="+1234567890">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" class="form-control" id="clienteEmail" placeholder="cliente@email.com">
                            </div>
                            <div class="form-group">
                                <label>Dirección</label>
                                <input type="text" class="form-control" id="clienteDireccion" placeholder="Dirección de entrega">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4>Productos</h4>
                        <div class="productos-container" id="productosContainer">
                            <div class="producto-row">
                                <select class="form-control" id="productoSelect">
                                    <option value="">Seleccionar producto...</option>
                                    ${getProductosOptions()}
                                </select>
                                <input type="number" class="form-control" id="productoCantidad" placeholder="Cantidad" min="1" value="1">
                                <button class="btn btn-primary" onclick="agregarProducto()">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="productos-lista" id="productosLista">
                            <!-- Los productos seleccionados aparecerán aquí -->
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4>Información Adicional</h4>
                        <div class="form-group">
                            <label>Notas del Pedido</label>
                            <textarea class="form-control" id="pedidoNotas" rows="3" placeholder="Notas adicionales..."></textarea>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button class="btn btn-secondary" onclick="window.dashboard.closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="crearPedido()">
                            <i class="fas fa-save"></i>
                            Crear Pedido
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function getProductosOptions() {
        // Obtener productos desde el módulo de productos
        const productos = JSON.parse(localStorage.getItem('products') || '[]');
        return productos.map(producto => `
            <option value="${producto.id}" data-precio="${producto.regularPrice}">${producto.name} - $${producto.regularPrice}</option>
        `).join('');
    }
    
    function agregarProducto() {
        const productoSelect = document.getElementById('productoSelect');
        const cantidadInput = document.getElementById('productoCantidad');
        const productosLista = document.getElementById('productosLista');
        
        if (!productoSelect.value || !cantidadInput.value) {
            showToast('Por favor selecciona un producto y cantidad', 'error');
            return;
        }
        
        const productoId = productoSelect.value;
        const cantidad = parseInt(cantidadInput.value);
        const precio = parseFloat(productoSelect.selectedOptions[0].dataset.precio);
        const nombre = productoSelect.selectedOptions[0].text.split(' - ')[0];
        
        // Verificar si el producto ya está agregado
        const existingProduct = document.querySelector(`[data-producto-id="${productoId}"]`);
        if (existingProduct) {
            showToast('Este producto ya está en el pedido', 'error');
            return;
        }
        
        const productoRow = document.createElement('div');
        productoRow.className = 'producto-seleccionado';
        productoRow.setAttribute('data-producto-id', productoId);
        productoRow.innerHTML = `
            <div class="producto-info">
                <span class="producto-nombre">${nombre}</span>
                <span class="producto-cantidad">x${cantidad}</span>
                <span class="producto-precio">$${precio.toLocaleString()}</span>
            </div>
            <button class="btn btn-sm btn-danger" onclick="removerProducto(${productoId})">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        productosLista.appendChild(productoRow);
        
        // Limpiar inputs
        productoSelect.value = '';
        cantidadInput.value = '1';
        
        // Actualizar totales
        actualizarTotales();
    }
    
    function removerProducto(productoId) {
        const productoRow = document.querySelector(`[data-producto-id="${productoId}"]`);
        if (productoRow) {
            productoRow.remove();
            actualizarTotales();
        }
    }
    
    function actualizarTotales() {
        const productosLista = document.getElementById('productosLista');
        const productos = productosLista.querySelectorAll('.producto-seleccionado');
        
        let subtotal = 0;
        productos.forEach(producto => {
            const cantidad = parseInt(producto.querySelector('.producto-cantidad').textContent.replace('x', ''));
            const precio = parseFloat(producto.querySelector('.producto-precio').textContent.replace('$', '').replace(',', ''));
            subtotal += cantidad * precio;
        });
        
        // Mostrar totales (esto se implementaría en el modal)
        console.log('Subtotal:', subtotal);
    }
    
    function crearPedido() {
        const clienteNombre = document.getElementById('clienteNombre').value.trim();
        const clienteTelefono = document.getElementById('clienteTelefono').value.trim();
        const clienteEmail = document.getElementById('clienteEmail').value.trim();
        const clienteDireccion = document.getElementById('clienteDireccion').value.trim();
        const pedidoNotas = document.getElementById('pedidoNotas').value.trim();
        
        if (!clienteNombre || !clienteTelefono) {
            showToast('Por favor completa los campos obligatorios', 'error');
            return;
        }
        
        const productosLista = document.getElementById('productosLista');
        const productos = Array.from(productosLista.querySelectorAll('.producto-seleccionado')).map(producto => {
            const productoId = producto.getAttribute('data-producto-id');
            const cantidad = parseInt(producto.querySelector('.producto-cantidad').textContent.replace('x', ''));
            const precio = parseFloat(producto.querySelector('.producto-precio').textContent.replace('$', '').replace(',', ''));
            const nombre = producto.querySelector('.producto-nombre').textContent;
            
            return { id: parseInt(productoId), nombre, cantidad, precio };
        });
        
        // Verificar si algún producto tiene crédito habilitado
        console.log('🔍 PRODUCTOS EN PEDIDO:', productos);
        const productosDisponibles = JSON.parse(localStorage.getItem('productos') || '[]');
        console.log('🔍 PRODUCTOS DISPONIBLES:', productosDisponibles);
        
        const productosConCredito = productos.filter(p => {
            const producto = productosDisponibles.find(prod => prod.id === p.id);
            console.log(`🔍 PRODUCTO ${p.id}:`, producto);
            console.log(`🔍 CRÉDITO DEL PRODUCTO:`, producto ? producto.credito : 'NO ENCONTRADO');
            console.log(`🔍 HABILITADO:`, producto ? producto.credito?.habilitado : 'NO ENCONTRADO');
            console.log(`🔍 TIENE CRÉDITO:`, producto && producto.credito && producto.credito.habilitado);
            return producto && producto.credito && producto.credito.habilitado;
        });
        
        console.log('🔍 PRODUCTOS CON CRÉDITO:', productosConCredito);
        
        // Calcular información de crédito si hay productos con crédito
        let creditoInfo = null;
        if (productosConCredito.length > 0) {
            console.log('✅ HAY PRODUCTOS CON CRÉDITO - CREANDO INFO DE CRÉDITO');
            const totalCredito = productosConCredito.reduce((sum, p) => sum + (p.cantidad * p.precio), 0);
            const maxCuotas = Math.max(...productosConCredito.map(p => {
                const productosDisponibles = JSON.parse(localStorage.getItem('productos') || '[]');
                const producto = productosDisponibles.find(prod => prod.id === p.id);
                return producto ? producto.credito.cuotas : 0;
            }));
            
            const montoPorCuota = totalCredito / maxCuotas;
            
            creditoInfo = {
                habilitado: true,
                cuotas: maxCuotas,
                cuotasPagadas: 0,
                montoPorCuota: montoPorCuota,
                cuotasDetalle: Array.from({length: maxCuotas}, (_, i) => ({
                    numero: i + 1,
                    pagado: false,
                    monto: montoPorCuota,
                    fechaPago: null
                }))
            };
            console.log('✅ INFO DE CRÉDITO CREADA:', creditoInfo);
        } else {
            console.log('❌ NO HAY PRODUCTOS CON CRÉDITO');
        }
        
        if (productos.length === 0) {
            showToast('Por favor agrega al menos un producto', 'error');
            return;
        }
        
        const subtotal = productos.reduce((sum, p) => sum + (p.cantidad * p.precio), 0);
        const total = subtotal; // Por ahora sin impuestos ni descuentos
        
        const nuevoPedido = {
            id: window.generateId('order'),
            numero: window.generatePrefixedId('PED', 'order'),
            cliente: {
                nombre: clienteNombre,
                telefono: clienteTelefono,
                email: clienteEmail,
                direccion: clienteDireccion
            },
            productos: productos,
            subtotal: subtotal,
            impuestos: 0,
            descuentos: 0,
            total: total,
            estado: 'pendiente',
            fechaCreacion: new Date().toISOString(),
            fechaModificacion: new Date().toISOString(),
            notas: pedidoNotas,
            credito: creditoInfo
        };
        
        console.log('🔍 PEDIDO FINAL CREADO:', nuevoPedido);
        console.log('🔍 CRÉDITO EN PEDIDO:', nuevoPedido.credito);
        
        pedidos.unshift(nuevoPedido);
        savePedidos();
        
        // Actualizar vistas
        filteredPedidos = [...pedidos];
        renderPedidos();
        updateProcesarVentasButton();
        
        if (window.dashboard && window.dashboard.closeModal) {
            window.dashboard.closeModal();
        }
        
        showToast('Pedido creado exitosamente', 'success');
    }
    
    // ===================================
    // FUNCIONES DE ESTADO
    // ===================================
    
    // Función para actualizar el estado de un pedido en userOrders
    function updateUserOrderStatus(pedidoId, newStatus) {
        console.log(`🔄 Actualizando estado de pedido ${pedidoId} a ${newStatus} en userOrders`);
        
        try {
            const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
            const orderIndex = userOrders.findIndex(order => order.id == pedidoId);
            
            if (orderIndex !== -1) {
                userOrders[orderIndex].status = newStatus;
                localStorage.setItem('userOrders', JSON.stringify(userOrders));
                console.log(`✅ Estado actualizado en userOrders: ${pedidoId} -> ${newStatus}`);
            } else {
                console.log(`⚠️ Pedido ${pedidoId} no encontrado en userOrders`);
            }
        } catch (error) {
            console.error('Error al actualizar estado en userOrders:', error);
        }
    }
    function confirmarPago(pedidoId) {
        const pedido = pedidos.find(p => p.id == pedidoId);
        if (!pedido) return;
        
        showModernConfirm(
            '¿Estás seguro?',
            `¿Confirmar el pago del pedido ${pedido.numero}?`,
            () => {
                pedido.estado = 'pagado';
                pedido.fechaModificacion = new Date().toISOString();
                
                // Guardar cambios primero
                savePedidos();
                
                // Actualizar estado en userOrders para sincronización con index
                updateUserOrderStatus(pedido.id, 'pagado');
                
                // Actualizar frontend con información de crédito si existe
                actualizarFrontendCuotas(pedido);
                
                // Actualizar vistas SIN regenerar todo el HTML
                updateProcesarVentasButton();
                
                // Actualizar solo la tarjeta específica en lugar de regenerar todo
                updatePedidoCard(pedido.id);
                
                // Mostrar toast de confirmación DESPUÉS de las actualizaciones
                setTimeout(() => {
                    if (window.dashboard && window.dashboard.showToast) {
                        window.dashboard.showToast('Pago confirmado exitosamente', 'success', 2000);
                    }
                }, 100);
            }
        );
    }
    
    // Actualizar solo una tarjeta específica sin regenerar todo
    function updatePedidoCard(pedidoId) {
        const pedido = pedidos.find(p => p.id === pedidoId);
        if (!pedido) return;
        
        // Buscar la tarjeta existente
        const cardElement = document.querySelector(`[data-pedido-id="${pedidoId}"]`);
        if (cardElement) {
            // Reemplazar solo esta tarjeta
            const newCardHTML = createPedidoCard(pedido);
            cardElement.outerHTML = newCardHTML;
            console.log('✅ Tarjeta actualizada:', pedido.numero);
        } else {
            // Si no se encuentra la tarjeta, regenerar todo (fallback)
            console.log('⚠️ Tarjeta no encontrada, regenerando todo...');
            loadPedidos();
        }
    }
    
    // Modal de confirmación moderno
    function showModernConfirm(title, message, onConfirm, onCancel = null) {
        const confirmHTML = `
            <div class="modern-confirm-modal">
                <div class="confirm-icon">
                    <i class="fas fa-question-circle"></i>
                </div>
                <h3 class="confirm-title">${title}</h3>
                <p class="confirm-message">${message}</p>
                <div class="confirm-buttons">
                    <button class="btn btn-secondary" onclick="closeModernConfirm()">
                        <i class="fas fa-times"></i>
                        Cancelar
                    </button>
                    <button class="btn btn-primary" onclick="executeModernConfirm()">
                        <i class="fas fa-check"></i>
                        Aceptar
                    </button>
                </div>
                <div class="emergency-close" style="margin-top: 15px;">
                    <button class="btn btn-link" onclick="closeModernConfirm()" style="color: #6c757d; font-size: 0.8rem;">
                        <i class="fas fa-times-circle"></i>
                        Cerrar si no responde
                    </button>
                </div>
            </div>
        `;
        
        // Guardar callbacks temporalmente
        window.tempModernConfirmCallback = onConfirm;
        window.tempModernCancelCallback = onCancel;
        
        console.log('🔍 Abriendo modal de confirmación moderna...');
        console.log('🔍 window.dashboard:', window.dashboard);
        console.log('🔍 window.dashboard.openModal:', window.dashboard?.openModal);
        
        if (window.dashboard && window.dashboard.openModal) {
            console.log('✅ Usando sistema de modales del dashboard');
            window.dashboard.openModal('Confirmación', confirmHTML, 'small');
            
            // Forzar visibilidad del modal después de un breve delay
            setTimeout(() => {
                const modalOverlay = document.getElementById('modalOverlay');
                const modal = document.getElementById('modal');
                if (modalOverlay && modal) {
                    console.log('🔧 Forzando visibilidad del modal...');
                    modalOverlay.style.display = 'flex';
                    modalOverlay.style.visibility = 'visible';
                    modalOverlay.style.opacity = '1';
                    modalOverlay.style.zIndex = '99999';
                    modal.style.display = 'block';
                    modal.style.visibility = 'visible';
                    modal.style.opacity = '1';
                    modal.style.zIndex = '99999';
                    console.log('✅ Modal forzado a ser visible con z-index alto');
                } else {
                    console.error('❌ Elementos del modal no encontrados');
                }
            }, 100);
        } else {
            console.log('⚠️ Usando fallback confirm nativo');
            // Fallback: usar confirm nativo
            if (confirm(`${title}\n\n${message}`)) {
                onConfirm();
            } else if (onCancel) {
                onCancel();
            }
        }
    }
    
    function executeModernConfirm() {
        console.log('✅ Ejecutando confirmación moderna...');
        if (window.tempModernConfirmCallback) {
            window.tempModernConfirmCallback();
            window.tempModernConfirmCallback = null;
        }
        closeModernConfirm();
    }
    
    function closeModernConfirm() {
        console.log('❌ Cerrando confirmación moderna...');
        if (window.tempModernCancelCallback) {
            window.tempModernCancelCallback();
            window.tempModernCancelCallback = null;
        }
        if (window.dashboard && window.dashboard.closeModal) {
            window.dashboard.closeModal();
        }
    }
    
    // Hacer las funciones globales
    window.executeModernConfirm = executeModernConfirm;
    window.closeModernConfirm = closeModernConfirm;
    
    function cancelarPedido(pedidoId) {
        const pedido = pedidos.find(p => p.id == pedidoId);
        if (!pedido) return;
        
        if (confirm(`¿Cancelar el pedido ${pedido.numero}?`)) {
            pedido.estado = 'cancelado';
            pedido.fechaModificacion = new Date().toISOString();
            
            savePedidos();
            
            // Actualizar estado en userOrders para sincronización con index
            updateUserOrderStatus(pedido.id, 'cancelados');
            
            updateProcesarVentasButton();
            updatePedidoCard(pedido.id);
        }
    }
    
    function verDetallePedido(pedidoId) {
        console.log('🔍 verDetallePedido llamado con ID:', pedidoId, 'tipo:', typeof pedidoId);
        console.log('📊 Pedidos disponibles:', pedidos.map(p => ({ id: p.id, tipo: typeof p.id, numero: p.numero })));
        
        // Buscar con múltiples métodos de comparación
        let pedido = pedidos.find(p => p.id == pedidoId);
        if (!pedido) {
            pedido = pedidos.find(p => p.id === pedidoId);
        }
        if (!pedido) {
            pedido = pedidos.find(p => p.id.toString() === pedidoId.toString());
        }
        
        if (!pedido) {
            console.log('❌ Pedido no encontrado con ID:', pedidoId);
            console.log('📋 IDs disponibles:', pedidos.map(p => ({ id: p.id, tipo: typeof p.id, numero: p.numero })));
            console.log('🔍 Intentando búsqueda manual...');
            pedidos.forEach((p, index) => {
                console.log(`  ${index}: ID=${p.id} (${typeof p.id}) vs ${pedidoId} (${typeof pedidoId}) - igual: ${p.id == pedidoId}`);
            });
            return;
        }
        
        console.log('Pedido encontrado:', pedido);
        
        // Crear modal con HTML original
        let modalHTML = createOriginalModalHTML(pedido);
        
        // Verificar si el pedido tiene productos con crédito
        const productosDisponibles = JSON.parse(localStorage.getItem('productos') || '[]');
        let tieneCredito = false;
        let creditoInfo = null;
        
        // Buscar productos con crédito en el pedido
        const productosConCredito = pedido.productos.filter(pedidoProducto => {
            const producto = productosDisponibles.find(prod => prod.id == pedidoProducto.id);
            return producto && producto.credito && producto.credito.habilitado;
        });
        
        if (productosConCredito.length > 0) {
            tieneCredito = true;
            
            // Si ya tiene información de crédito, usarla; si no, crearla
            if (pedido.credito && pedido.credito.habilitado) {
                creditoInfo = pedido.credito;
                console.log('✅ Usando información de crédito existente del pedido:', creditoInfo);
            } else {
                // Calcular información de crédito
                const totalCredito = productosConCredito.reduce((sum, p) => sum + (p.cantidad * p.precio), 0);
                const maxCuotas = Math.max(...productosConCredito.map(p => {
                    const producto = productosDisponibles.find(prod => prod.id == p.id);
                    return producto ? producto.credito.cuotas : 0;
                }));
                
                creditoInfo = {
                    habilitado: true,
                    cuotas: maxCuotas,
                    cuotasPagadas: 0,
                    montoPorCuota: totalCredito / maxCuotas,
                    cuotasDetalle: Array.from({length: maxCuotas}, (_, i) => ({
                        numero: i + 1,
                        pagado: false,
                        monto: totalCredito / maxCuotas,
                        fechaPago: null
                    }))
                };
                console.log('✅ Creando nueva información de crédito:', creditoInfo);
            }
        }
        
        // Agregar sección de cuotas si tiene crédito
        if (tieneCredito && creditoInfo) {
            const cuotasHTML = createCuotasSectionHTML({...pedido, credito: creditoInfo});
            modalHTML = modalHTML.replace('<!-- Sección de cuotas se insertará aquí si el pedido tiene crédito -->', cuotasHTML);
        }
        
        // Usar el sistema de modales del dashboard
        if (window.dashboard && window.dashboard.openModal) {
            console.log('✅ Usando sistema de modales del dashboard');
            window.dashboard.openModal(`Detalle - ${pedido.numero}`, modalHTML, 'large');
            
        } else {
            console.error('❌ Dashboard modal system not available, creando modal manual');
            // Crear modal manualmente como fallback
            createManualModal(`Detalle - ${pedido.numero}`, modalHTML);
        }
    }
    
    function createCuotasSectionHTML(pedido) {
        console.log('🔍 createCuotasSectionHTML - pedido:', pedido);
        console.log('🔍 createCuotasSectionHTML - credito:', pedido.credito);
        console.log('🔍 createCuotasSectionHTML - habilitado:', pedido.credito && pedido.credito.habilitado);
        
        if (!pedido.credito || !pedido.credito.habilitado) {
            console.log('❌ NO SE CREA HTML DE CUOTAS - Sin crédito');
            return '';
        }
        
        console.log('✅ CREANDO HTML DE CUOTAS');
        console.log('🔍 Estado de cuotas:', pedido.credito.cuotasDetalle);
        const cuotasHTML = pedido.credito.cuotasDetalle.map(cuota => `
            <div class="cuota-item ${cuota.pagado ? 'pagada' : 'pendiente'}" data-cuota="${cuota.numero}">
                <label class="cuota-switch">
                    <input type="checkbox" 
                           ${cuota.pagado ? 'checked' : ''} 
                           ${cuota.pagado ? 'disabled' : ''}
                           onchange="console.log('🔧 Checkbox clicked:', this.checked); toggleCuota('${pedido.id}', ${cuota.numero}, this.checked, this)">
                    <span class="switch-slider"></span>
                </label>
                <span class="cuota-numero">Cuota ${cuota.numero}</span>
                <input type="number" 
                       class="cuota-monto" 
                       placeholder="Monto" 
                       step="0.01" 
                       value="${cuota.monto}"
                       ${cuota.pagado ? 'disabled' : ''}
                       data-cuota="${cuota.numero}">
            </div>
        `).join('');
        
        return `
            <div class="detalle-section cuotas-section">
                <h4>💳 Gestión de Cuotas</h4>
                <div class="cuotas-container">
                    ${cuotasHTML}
                </div>
            </div>
        `;
    }
    
    function toggleCuota(pedidoId, numeroCuota, isChecked, checkboxElement) {
        console.log('🔧 toggleCuota llamado:', {pedidoId, numeroCuota, isChecked});
        
        const pedido = pedidos.find(p => p.id == pedidoId);
        if (!pedido) {
            console.log('❌ Pedido no encontrado');
            console.log('🔍 Buscando pedido con ID:', pedidoId, 'tipo:', typeof pedidoId);
            console.log('🔍 IDs disponibles:', pedidos.map(p => ({ id: p.id, tipo: typeof p.id })));
            return;
        }
        
        console.log('✅ Pedido encontrado:', pedido);
        console.log('🔍 Pedido.credito:', pedido.credito);
        
        if (!pedido.credito) {
            console.log('❌ Pedido sin crédito - creando información de crédito...');
            
            // Crear información de crédito si no existe
            const productosDisponibles = JSON.parse(localStorage.getItem('productos') || '[]');
            const productosConCredito = pedido.productos.filter(pedidoProducto => {
                const producto = productosDisponibles.find(prod => prod.id == pedidoProducto.id);
                return producto && producto.credito && producto.credito.habilitado;
            });
            
            if (productosConCredito.length > 0) {
                const totalCredito = productosConCredito.reduce((sum, p) => sum + (p.cantidad * p.precio), 0);
                const maxCuotas = Math.max(...productosConCredito.map(p => {
                    const producto = productosDisponibles.find(prod => prod.id == p.id);
                    return producto ? producto.credito.cuotas : 0;
                }));
                
                pedido.credito = {
                    habilitado: true,
                    cuotas: maxCuotas,
                    cuotasPagadas: 0,
                    montoPorCuota: totalCredito / maxCuotas,
                    cuotasDetalle: Array.from({length: maxCuotas}, (_, i) => ({
                        numero: i + 1,
                        pagado: false,
                        monto: totalCredito / maxCuotas,
                        fechaPago: null
                    }))
                };
                
                console.log('✅ Información de crédito creada:', pedido.credito);
            } else {
                console.log('❌ No hay productos con crédito en este pedido');
                return;
            }
        } else {
            console.log('✅ Usando información de crédito existente:', pedido.credito);
        }
        
        const cuota = pedido.credito.cuotasDetalle.find(c => c.numero === numeroCuota);
        if (!cuota) {
            console.log('❌ Cuota no encontrada');
            return;
        }
        
        console.log('✅ Datos encontrados, procesando...');
        
        if (isChecked) {
            // Obtener monto ingresado
            const montoInput = document.querySelector(`input[data-cuota="${numeroCuota}"]`);
            const montoIngresado = parseFloat(montoInput.value) || 0;
            
            // Confirmar pago
            const confirmacion = confirm(`¿Confirmar pago de la Cuota ${numeroCuota} por $${montoIngresado.toFixed(2)}?`);
            if (!confirmacion) {
                checkboxElement.checked = false;
                return;
            }
            
            // Marcar como pagada (solo si no estaba pagada antes)
            if (!cuota.pagado) {
                cuota.pagado = true;
                cuota.fechaPago = new Date().toISOString();
                cuota.monto = montoIngresado; // Usar monto ingresado
                
                pedido.credito.cuotasPagadas++;
                pedido.fechaModificacion = new Date().toISOString();
            } else {
                // Si ya estaba pagada, solo actualizar el monto
                cuota.monto = montoIngresado;
                pedido.fechaModificacion = new Date().toISOString();
            }
            
            // Actualizar UI - Div verde
            const cuotaItem = document.querySelector(`[data-cuota="${numeroCuota}"]`);
            if (cuotaItem) {
                cuotaItem.classList.add('pagada');
                cuotaItem.classList.remove('pendiente');
            }
            
            // Bloquear campo monto (ya pagado, no se puede editar)
            montoInput.disabled = true;
            checkboxElement.disabled = true;
            
            // Forzar bloqueo visual del campo
            montoInput.style.backgroundColor = '#e9ecef';
            montoInput.style.cursor = 'not-allowed';
            montoInput.style.color = '#6c757d';
            
            
            // Actualizar el array pedidos global
            const pedidoIndex = pedidos.findIndex(p => p.id == pedidoId);
            if (pedidoIndex !== -1) {
                pedidos[pedidoIndex] = pedido;
                console.log('✅ Pedido actualizado en array global');
            }
            
            // Guardar cambios
            savePedidos();
            
            // Actualizar frontend si está abierto
            actualizarFrontendCuotas(pedido);
            
            showToast(`Cuota ${numeroCuota} pagada exitosamente`, 'success');
        } else {
            // Si se desactiva el switcher, desmarcar como pagada (solo si estaba pagada)
            if (cuota.pagado) {
                cuota.pagado = false;
                cuota.fechaPago = null;
                
                pedido.credito.cuotasPagadas--;
                pedido.fechaModificacion = new Date().toISOString();
            }
            
            // Habilitar campo monto
            const montoInput = document.querySelector(`input[data-cuota="${numeroCuota}"]`);
            if (montoInput) {
                montoInput.disabled = false;
                montoInput.style.backgroundColor = 'white';
                montoInput.style.cursor = 'text';
            }
            
            // Actualizar UI para mostrar como pendiente
            const cuotaItem = document.querySelector(`[data-cuota="${numeroCuota}"]`);
            if (cuotaItem) {
                cuotaItem.classList.remove('pagada');
                cuotaItem.classList.add('pendiente');
            }
            
            // Actualizar el array pedidos global
            const pedidoIndex = pedidos.findIndex(p => p.id == pedidoId);
            if (pedidoIndex !== -1) {
                pedidos[pedidoIndex] = pedido;
                console.log('✅ Pedido actualizado en array global (desactivado)');
            }
            
            // Guardar cambios
            savePedidos();
            
            // Actualizar frontend si está abierto
            actualizarFrontendCuotas(pedido);
        }
    }
    
    function actualizarContadorCuotas(pedido) {
        const progressElement = document.querySelector('.cuotas-progress');
        if (progressElement) {
            progressElement.textContent = `${pedido.credito.cuotasPagadas}/${pedido.credito.cuotas} cuotas pagadas`;
        }
    }
    
    function actualizarFrontendCuotas(pedido) {
        // Actualizar localStorage para sincronización con frontend
        const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        const orderIndex = userOrders.findIndex(order => order.id == pedido.id);
        
        if (orderIndex !== -1) {
            // Actualizar información de crédito
            userOrders[orderIndex].credito = pedido.credito;
            
            // Actualizar estado del pedido
            if (pedido.estado === 'pagado') {
                userOrders[orderIndex].status = 'pagado';
            } else if (pedido.estado === 'procesado') {
                userOrders[orderIndex].status = 'procesado';
            } else if (pedido.estado === 'cancelado') {
                userOrders[orderIndex].status = 'cancelados';
            }
            
            localStorage.setItem('userOrders', JSON.stringify(userOrders));
            console.log('✅ Frontend actualizado - Estado:', userOrders[orderIndex].status);
        }
    }
    
    function createManualModal(title, content) {
        // Cerrar modal existente si hay uno
        const existingModal = document.querySelector('.modal.show, .modal-overlay.active');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'modal modal-large';
        modal.style.cssText = `
            background: #2d2d2d;
            border-radius: 8px;
            max-width: 90%;
            max-height: 90vh;
            width: 100%;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        `;
        
        modal.innerHTML = `
            <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #444; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="color: #fff; margin: 0; font-size: 18px;">${title}</h3>
                <button onclick="closeManualModal()" style="background: none; border: none; color: #999; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">×</button>
            </div>
            <div class="modal-body" style="padding: 0; max-height: 70vh; overflow-y: auto;">
                ${content}
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Cerrar al hacer clic fuera del modal
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeManualModal();
            }
        });
        
        // Configurar event listeners después de que el modal esté en el DOM
        setTimeout(() => {
            setupCuotasEventListeners();
        }, 100);
    }
    
    function closeManualModal() {
        const modal = document.querySelector('.modal-overlay.active');
        if (modal) {
            modal.remove();
        }
    }
    
    function closePedidoModal() {
        const modal = document.querySelector('.modal.show');
        if (modal) {
            modal.remove();
        }
    }
    
    function createFallbackModalHTML(pedido) {
        const cuotasPagadas = pedido.cuotas ? pedido.cuotas.filter(c => c.pagado).length : 0;
        const totalCuotas = pedido.cuotas ? pedido.cuotas.length : 0;
        const montoPorCuota = pedido.total / totalCuotas;
        
        return `
            <div class="pedido-detalle">
                <div class="detalle-section">
                    <h4>Productos del Pedido</h4>
                    <div class="productos-pedido-list">
                        ${pedido.productos.map(producto => `
                            <div class="producto-pedido-item">
                                <div class="producto-info">
                                    <div class="producto-nombre">${producto.nombre}</div>
                                    <div class="producto-controls">
                                        <button class="btn-cantidad" onclick="cambiarCantidad(${pedido.id}, ${producto.id}, -1)">-</button>
                                        <span class="cantidad-display">${producto.cantidad}</span>
                                        <button class="btn-cantidad" onclick="cambiarCantidad(${pedido.id}, ${producto.id}, 1)">+</button>
                                        <button class="btn-eliminar" onclick="eliminarProducto(${pedido.id}, ${producto.id})">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                    <div class="producto-subtotal">$${(producto.precio * producto.cantidad).toLocaleString()}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="detalle-section">
                    <h4>Totales</h4>
                    <div class="totales-list">
                        <div class="total-item">
                            <span>Subtotal:</span>
                            <span>$${pedido.subtotal.toLocaleString()}</span>
                        </div>
                        <div class="total-item">
                            <span>Impuestos:</span>
                            <span>$${pedido.impuestos.toLocaleString()}</span>
                        </div>
                        <div class="total-item">
                            <span>Descuentos:</span>
                            <span>-$${pedido.descuentos.toLocaleString()}</span>
                        </div>
                        <div class="total-item total-final">
                            <span>Total:</span>
                            <span>$${pedido.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                ${pedido.modalidadPago === 'credito' && pedido.cuotas ? `
                    <div class="detalle-section">
                        <h4>Gestión de Cuotas</h4>
                        <div class="cuotas-gestion">
                            <div class="cuotas-gestion-compacta">
                                <div class="cuotas-header">
                                    <h5>Gestión de Cuotas</h5>
                                    <div class="cuotas-progress-compact">
                                        <span class="progress-text">${cuotasPagadas}/${totalCuotas} cuotas pagadas</span>
                                        <div class="progress-bar-compact">
                                            <div class="progress-fill" style="width: ${(cuotasPagadas / totalCuotas) * 100}%"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="cuotas-switchers">
                                    ${pedido.cuotas.map(cuota => `
                                        <div class="cuota-switcher-item ${cuota.pagado ? 'pagada' : 'pendiente'}" 
                                             data-cuota="${cuota.numero}" 
                                             data-pedido="${pedido.id}">
                                            <div class="cuota-info-compact">
                                                <span class="cuota-numero">Cuota ${cuota.numero}</span>
                                                <span class="cuota-monto">$${montoPorCuota.toFixed(2)}</span>
                                            </div>
                                            <label class="cuota-switch">
                                                <input type="checkbox" 
                                                       ${cuota.pagado ? 'checked' : ''} 
                                                       ${cuota.pagado ? 'disabled' : ''}
                                                       onchange="toggleCuotaSwitch(${pedido.id}, ${cuota.numero}, this.checked)">
                                                <span class="switch-slider"></span>
                                            </label>
                                        </div>
                                    `).join('')}
                                </div>
                                
                                <div class="cuotas-actions-compact">
                                    <button class="btn-confirmar-cuotas" 
                                            id="btnConfirmarCuotas-${pedido.id}"
                                            onclick="confirmarPagoCuotas(${pedido.id})"
                                            disabled>
                                        <i class="fas fa-credit-card"></i>
                                        Confirmar Pago de Cuotas
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <div class="detalle-section">
                    <h4>Acciones</h4>
                    <div class="acciones-buttons">
                        ${getPedidoActions(pedido)}
                    </div>
                </div>
            </div>
        `;
    }
    
    function createOriginalModalHTML(pedido) {
        return `
            <div class="pedido-detalle">
                <div class="detalle-section">
                    <h4>Productos del Pedido</h4>
                    <div class="productos-pedido-list">
                        ${pedido.productos.map(producto => `
                            <div class="producto-pedido-item">
                                <div class="producto-info">
                                    <div class="producto-nombre">${producto.nombre}</div>
                                    <div class="producto-controls">
                                        <button class="btn-cantidad" onclick="cambiarCantidad(${pedido.id}, ${producto.id}, -1)">-</button>
                                        <span class="cantidad-display">${producto.cantidad}</span>
                                        <button class="btn-cantidad" onclick="cambiarCantidad(${pedido.id}, ${producto.id}, 1)">+</button>
                                        <button class="btn-eliminar" onclick="eliminarProducto(${pedido.id}, ${producto.id})">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                </div>
                                <div class="producto-subtotal">$${(producto.precio * producto.cantidad).toLocaleString()}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="agregar-producto-section">
                        <button class="btn-agregar-producto" onclick="mostrarAgregarProducto(${pedido.id})">
                            <i class="fas fa-plus"></i>
                            Agregar Producto
                        </button>
                    </div>
                </div>
                
                <!-- Sección de cuotas se insertará aquí si el pedido tiene crédito -->
                
                <div class="detalle-section">
                    <h4>Totales</h4>
                    <div class="totales-list">
                        <div class="total-item">
                            <span>Subtotal:</span>
                            <span>$${pedido.subtotal.toLocaleString()}</span>
                        </div>
                        <div class="total-item">
                            <span>Impuestos:</span>
                            <span>$${pedido.impuestos.toLocaleString()}</span>
                        </div>
                        <div class="total-item">
                            <span>Descuentos:</span>
                            <span>-$${pedido.descuentos.toLocaleString()}</span>
                        </div>
                        <div class="total-item total-final">
                            <span>Total:</span>
                            <span>$${pedido.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detalle-section">
                    <h4>Información de Entrega</h4>
                    <div class="entrega-info">
                        ${pedido.delivery ? `
                            <div class="delivery-info">
                                <div class="info-item">
                                    <strong>Tipo:</strong> Delivery
                                </div>
                                <div class="info-item">
                                    <strong>Costo:</strong> $${(pedido.deliveryCost || 0).toLocaleString()}
                                </div>
                                ${pedido.deliveryAddress ? `
                                    <div class="info-item">
                                        <strong>Dirección:</strong> ${pedido.deliveryAddress}
                                    </div>
                                ` : ''}
                            </div>
                        ` : `
                            <div class="pickup-info">
                                <div class="info-item">
                                    <strong>Tipo:</strong> Recogida en tienda
                                </div>
                            </div>
                        `}
                    </div>
                </div>
                
                
                <div class="detalle-section">
                    <h4>Acciones</h4>
                    <div class="acciones-buttons">
                        ${pedido.delivery && pedido.deliveryAddress ? `
                            <button class="btn btn-info" onclick="mostrarDireccion('${pedido.deliveryAddress}')">
                                <i class="fas fa-map-marker-alt"></i>
                                Ver Dirección de Entrega
                            </button>
                        ` : ''}
                        ${getPedidoActions(pedido)}
                    </div>
                </div>
            </div>
        `;
    }
    
    function createDetallePedidoModal(pedido) {
        return `
            <div class="detalle-pedido-container">
                <div class="pedido-info-completa">
                    <div class="info-section">
                        <h4>Información del Pedido</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Estado:</label>
                                <span class="estado-badge estado-${pedido.estado}">${pedido.estado}</span>
                            </div>
                            <div class="info-item">
                                <label>Cliente:</label>
                                <span>${pedido.cliente.nombre} - ${pedido.cliente.telefono}</span>
                            </div>
                            ${pedido.cliente.direccion ? `
                                <div class="info-item">
                                    <label>Dirección:</label>
                                    <button class="btn-ver-direccion" onclick="mostrarDireccion('${pedido.cliente.direccion}')">
                                        <i class="fas fa-map-marker-alt"></i>
                                        Ver Dirección
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h4>Productos del Pedido</h4>
                        <div class="productos-pedido-list">
                            ${pedido.productos.map((producto, index) => `
                                <div class="producto-pedido-item" data-producto-id="${producto.id}">
                                    <div class="producto-info">
                                        <div class="producto-nombre">${producto.nombre}</div>
                                        <div class="producto-precio">$${producto.precio.toLocaleString()}</div>
                                    </div>
                                    <div class="producto-controls">
                                        <button class="btn-cantidad" onclick="cambiarCantidad(${pedido.id}, ${producto.id}, -1)">
                                            <i class="fas fa-minus"></i>
                                        </button>
                                        <span class="cantidad-display">${producto.cantidad}</span>
                                        <button class="btn-cantidad" onclick="cambiarCantidad(${pedido.id}, ${producto.id}, 1)">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                        <button class="btn-eliminar" onclick="eliminarProducto(${pedido.id}, ${producto.id})">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                    <div class="producto-subtotal">
                                        $${(producto.cantidad * producto.precio).toLocaleString()}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="agregar-producto-section">
                            <button class="btn-agregar-producto" onclick="mostrarAgregarProducto(${pedido.id})">
                                <i class="fas fa-plus"></i>
                                Agregar Producto
                            </button>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h4>Totales</h4>
                        <div class="totales-detalle">
                            <div class="total-line">
                                <span>Subtotal:</span>
                                <span id="subtotal-${pedido.id}">$${pedido.subtotal.toLocaleString()}</span>
                            </div>
                            <div class="total-line">
                                <span>Impuestos:</span>
                                <span>$${pedido.impuestos.toLocaleString()}</span>
                            </div>
                            <div class="total-line">
                                <span>Descuentos:</span>
                                <span>-$${pedido.descuentos.toLocaleString()}</span>
                            </div>
                            <div class="total-line total-final">
                                <span>Total:</span>
                                <span id="total-${pedido.id}">$${pedido.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${pedido.modalidadPago === 'credito' && pedido.cuotas ? `
                        <div class="info-section">
                            <h4>Gestión de Cuotas</h4>
                            <div class="cuotas-gestion">
                                ${createCuotasGestionHTML(pedido)}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="info-section">
                        <h4>Acciones</h4>
                        <div class="pedido-actions-detalle">
                            ${getPedidoActions(pedido)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ===================================
    // FUNCIONES ADICIONALES
    // ===================================
    
    function confirmarPago(pedidoId) {
        const pedido = pedidos.find(p => p.id == pedidoId);
        if (!pedido) return;
        
        // Confirmar pago
        const confirmacion = confirm(`¿Confirmar pago del pedido ${pedido.numero} por $${pedido.total}?`);
        if (!confirmacion) return;
        
        // Actualizar estado
        pedido.estado = 'pagado';
        pedido.fechaModificacion = new Date().toISOString();
        
        // Guardar cambios
        savePedidos();
        
        // Actualizar frontend con información de crédito si existe
        actualizarFrontendCuotas(pedido);
        
        renderPedidos();
        
        showToast('Pago confirmado exitosamente', 'success');
        
        // Cerrar modal si está abierto
        if (window.dashboard && window.dashboard.closeModal) {
            window.dashboard.closeModal();
        }
    }
    
    
    // ===================================
    // GESTIÓN DE PRODUCTOS EN PEDIDO
    // ===================================
    function cambiarCantidad(pedidoId, productoId, cambio) {
        const pedido = pedidos.find(p => p.id === pedidoId);
        if (!pedido) return;
        
        const producto = pedido.productos.find(p => p.id === productoId);
        if (!producto) return;
        
        const nuevaCantidad = producto.cantidad + cambio;
        if (nuevaCantidad <= 0) {
            eliminarProducto(pedidoId, productoId);
            return;
        }
        
        producto.cantidad = nuevaCantidad;
        actualizarTotalesPedido(pedido);
        guardarPedidos();
        renderPedidos();
        
        // Actualizar la vista del modal si está abierto
        const modal = document.querySelector('.modal.show');
        if (modal) {
            const detalleHTML = createDetallePedidoModal(pedido);
            modal.querySelector('.modal-body').innerHTML = detalleHTML;
        }
        
        showToast(`Cantidad actualizada: ${nuevaCantidad}`, 'success');
    }
    
    function eliminarProducto(pedidoId, productoId) {
        const pedido = pedidos.find(p => p.id === pedidoId);
        if (!pedido) return;
        
        pedido.productos = pedido.productos.filter(p => p.id !== productoId);
        
        if (pedido.productos.length === 0) {
            if (confirm('¿Eliminar el pedido completo?')) {
                pedidos = pedidos.filter(p => p.id !== pedidoId);
                if (window.dashboard && window.dashboard.closeModal) {
                    window.dashboard.closeModal();
                }
                savePedidos();
                loadPedidos();
                updateProcesarVentasButton();
            } else {
                return;
            }
        } else {
            actualizarTotalesPedido(pedido);
        }
        
        guardarPedidos();
        renderPedidos();
        
        // Actualizar la vista del modal si está abierto
        const modal = document.querySelector('.modal.show');
        if (modal) {
            const detalleHTML = createDetallePedidoModal(pedido);
            modal.querySelector('.modal-body').innerHTML = detalleHTML;
        }
    }
    
    function actualizarTotalesPedido(pedido) {
        pedido.subtotal = pedido.productos.reduce((sum, producto) => sum + (producto.cantidad * producto.precio), 0);
        pedido.total = pedido.subtotal + pedido.impuestos - pedido.descuentos;
        pedido.fechaModificacion = new Date().toISOString();
    }
    
    function mostrarAgregarProducto(pedidoId) {
        // Cargar productos disponibles
        const productosDisponibles = JSON.parse(localStorage.getItem('productos') || '[]');
        
        if (productosDisponibles.length === 0) {
            showToast('No hay productos disponibles', 'warning');
            return;
        }
        
        const productosHTML = productosDisponibles.map(producto => `
            <div class="producto-disponible-item" data-producto-id="${producto.id}">
                <div class="producto-info">
                    <div class="producto-nombre">${producto.nombre}</div>
                    <div class="producto-precio">$${producto.precio.toLocaleString()}</div>
                </div>
                <button class="btn-agregar" onclick="agregarProductoAPedido(${pedidoId}, ${producto.id})">
                    <i class="fas fa-plus"></i>
                    Agregar
                </button>
            </div>
        `).join('');
        
        const modalHTML = `
            <div class="agregar-producto-modal">
                <h4>Seleccionar Producto</h4>
                <div class="productos-disponibles-list">
                    ${productosHTML}
                </div>
            </div>
        `;
        
        if (window.dashboard && window.dashboard.openModal) {
            window.dashboard.openModal('Agregar Producto', modalHTML, 'medium');
        } else {
            console.error('Dashboard openModal no disponible');
        }
    }
    
    function agregarProductoAPedido(pedidoId, productoId) {
        const pedido = pedidos.find(p => p.id === pedidoId);
        if (!pedido) return;
        
        const productosDisponibles = JSON.parse(localStorage.getItem('productos') || '[]');
        const producto = productosDisponibles.find(p => p.id === productoId);
        if (!producto) return;
        
        // Verificar si el producto ya existe en el pedido
        const productoExistente = pedido.productos.find(p => p.id === productoId);
        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            pedido.productos.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1
            });
        }
        
        actualizarTotalesPedido(pedido);
        guardarPedidos();
        renderPedidos();
        
        if (window.dashboard && window.dashboard.closeModal) {
            window.dashboard.closeModal();
        }
        
        // Reabrir el modal de detalle del pedido
        const detalleHTML = createDetallePedidoModal(pedido);
        if (window.dashboard && window.dashboard.openModal) {
            window.dashboard.openModal(`Detalle - ${pedido.numero}`, detalleHTML, 'large');
        }
        
        showToast('Producto agregado al pedido', 'success');
    }
    
    function mostrarDireccion(direccion) {
        const modalHTML = `
            <div class="direccion-modal">
                <div class="direccion-content">
                    <h4><i class="fas fa-map-marker-alt"></i> Dirección de Entrega</h4>
                    <p>${direccion}</p>
                    <button class="btn-cerrar-direccion" onclick="window.dashboard.closeModal()">
                        <i class="fas fa-times"></i>
                        Cerrar
                    </button>
                </div>
            </div>
        `;
        
        if (window.dashboard && window.dashboard.openModal) {
            window.dashboard.openModal('Dirección', modalHTML, 'small');
        } else {
            console.error('Dashboard openModal no disponible');
        }
    }
    
    // ===================================
    // ANIMACIONES DE PROCESAMIENTO
    // ===================================
    function startProcessingAnimation() {
        if (!btnProcesarVentas) {
            console.error('❌ btnProcesarVentas no encontrado');
            return;
        }
        
        console.log('🎬 Iniciando animación de procesamiento...');
        console.log('🔍 Botón encontrado:', btnProcesarVentas);
        console.log('🔍 Contenido actual:', btnProcesarVentas.innerHTML);
        
        // Guardar contenido original
        const originalContent = btnProcesarVentas.innerHTML;
        btnProcesarVentas.setAttribute('data-original-content', originalContent);
        
        // Aplicar estado de procesamiento
        btnProcesarVentas.classList.add('btn-processing');
        btnProcesarVentas.disabled = true;
        
        // Cambiar contenido
        btnProcesarVentas.innerHTML = `
            <div class="btn-spinner"></div>
            <span class="btn-text">Procesando...</span>
        `;
        
        console.log('🔍 Clases aplicadas:', btnProcesarVentas.className);
        console.log('🔍 Nuevo contenido:', btnProcesarVentas.innerHTML);
        console.log('✅ Animación de procesamiento iniciada');
    }
    
    function showSuccessAnimation(callback) {
        if (!btnProcesarVentas) {
            console.error('❌ btnProcesarVentas no encontrado en éxito');
            if (callback) callback();
            return;
        }
        
        console.log('🎉 Mostrando animación de éxito...');
        console.log('🔍 Botón antes del cambio:', btnProcesarVentas.className);
        
        // Aplicar animación de éxito
        btnProcesarVentas.classList.remove('btn-processing');
        btnProcesarVentas.classList.add('btn-success-animation');
        btnProcesarVentas.disabled = true;
        
        // Cambiar a icono de éxito
        btnProcesarVentas.innerHTML = `
            <i class="fas fa-check btn-success-icon"></i>
            <span class="btn-text">¡Completado!</span>
        `;
        
        console.log('🔍 Clases después del cambio:', btnProcesarVentas.className);
        console.log('🔍 Contenido después del cambio:', btnProcesarVentas.innerHTML);
        
        // Restaurar estado normal después de 1.5 segundos (más rápido)
        setTimeout(() => {
            resetButtonToNormal();
            if (callback) callback();
        }, 1500);
        
        console.log('✅ Animación de éxito mostrada');
    }
    
    function resetButtonToNormal() {
        if (!btnProcesarVentas) return;
        
        console.log('🔄 Restaurando botón a estado normal...');
        
        // Remover clases de animación
        btnProcesarVentas.classList.remove('btn-processing', 'btn-success-animation');
        btnProcesarVentas.disabled = false;
        
        // Restaurar contenido original
        const originalContent = btnProcesarVentas.getAttribute('data-original-content');
        if (originalContent) {
            btnProcesarVentas.innerHTML = originalContent;
            btnProcesarVentas.removeAttribute('data-original-content');
        }
        
        // Actualizar el botón con la lógica normal
        updateProcesarVentasButton();
        
        console.log('✅ Botón restaurado a estado normal');
    }
    
    // ===================================
    // PROCESAR VENTAS
    // ===================================
    function procesarVentas() {
        console.log('💰 PROCESAR VENTAS INICIADO');
        console.log('📊 Total de pedidos:', pedidos.length);
        console.log('📋 Pedidos disponibles:', pedidos.map(p => ({ numero: p.numero, estado: p.estado })));
        
        const pedidosPagados = pedidos.filter(p => p.estado === 'pagado');
        console.log('✅ Pedidos pagados encontrados:', pedidosPagados.length);
        
        if (pedidosPagados.length === 0) {
            console.log('❌ No hay pedidos pagados para procesar');
            return;
        }
        
        // Iniciar animación de procesamiento
        if (typeof startProcessingAnimation === 'function') {
            startProcessingAnimation();
        } else {
            console.log('⚠️ Función de animación no disponible, procesando sin animación');
        }
        
        console.log('🔄 Procesando ventas directamente...');
        let totalIngresos = 0;
        let productosDescontados = [];
            
            pedidosPagados.forEach(pedido => {
                // Cambiar estado a procesado
                pedido.estado = 'procesado';
                pedido.fechaModificacion = new Date().toISOString();
                
                // Sumar a ingresos
                totalIngresos += pedido.total;
                
                // Descontar productos del inventario
                pedido.productos.forEach(productoPedido => {
                    const producto = getProductoById(productoPedido.id);
                    if (producto) {
                        // Descontar stock
                        producto.stock = Math.max(0, producto.stock - productoPedido.cantidad);
                        producto.lastMovement = new Date().toLocaleString();
                        producto.lastUpdate = new Date().toISOString();
                        
                        // Registrar movimiento en inventario
                        registrarMovimientoInventario(producto, 'salida', productoPedido.cantidad, `Venta - Pedido ${pedido.numero}`);
                        
                        productosDescontados.push({
                            nombre: productoPedido.nombre,
                            cantidad: productoPedido.cantidad,
                            stockAnterior: producto.stock + productoPedido.cantidad,
                            stockNuevo: producto.stock
                        });
                    }
                });
            });
            
            // Guardar cambios
            savePedidos();
            saveProducts();
            registrarIngresos(totalIngresos);
            
            // Actualizar vistas
            loadPedidos();
            updateProcesarVentasButton();
            
            // Mostrar animación de éxito y luego resumen
            if (typeof showSuccessAnimation === 'function') {
                showSuccessAnimation(() => {
                    showProcesamientoResumen(pedidosPagados.length, totalIngresos, productosDescontados);
                });
            } else {
                console.log('⚠️ Función de animación de éxito no disponible, mostrando resumen directamente');
                showProcesamientoResumen(pedidosPagados.length, totalIngresos, productosDescontados);
            }
    }
    
    function getProductoById(id) {
        const productos = JSON.parse(localStorage.getItem('products') || '[]');
        return productos.find(p => p.id === id);
    }
    
    function saveProducts() {
        // Esta función se conectaría con el módulo de productos
        // Por ahora solo mostramos un mensaje
        console.log('Guardando productos...');
    }
    
    function registrarMovimientoInventario(producto, tipo, cantidad, motivo) {
        // Esta función se conectaría con el módulo de inventario
        console.log('Registrando movimiento:', { producto: producto.name, tipo, cantidad, motivo });
    }
    
    function registrarIngresos(monto) {
        // Registrar ingresos en el sistema de caja/contabilidad
        const ingresos = JSON.parse(localStorage.getItem('ingresos') || '[]');
        const nuevoIngreso = {
            id: Date.now(),
            monto: monto,
            fecha: new Date().toISOString(),
            tipo: 'ventas',
            descripcion: 'Ventas procesadas'
        };
        ingresos.push(nuevoIngreso);
        localStorage.setItem('ingresos', JSON.stringify(ingresos));
    }
    
    function showProcesamientoResumen(cantidadPedidos, totalIngresos, productosDescontados) {
        // Prevenir múltiples llamadas
        if (window.procesamientoResumenMostrado) {
            console.log('⚠️ Resumen ya mostrado, evitando duplicación');
            return;
        }
        
        window.procesamientoResumenMostrado = true;
        
        // Mostrar toast de éxito en lugar de modal
        const message = `✅ Ventas procesadas: ${cantidadPedidos} pedidos por $${totalIngresos.toLocaleString()}`;
        
        // Usar el sistema de toast del dashboard si está disponible
        if (window.dashboard && window.dashboard.showToast) {
            window.dashboard.showToast(message, 'success', 2000); // Duración explícita de 2 segundos
        } else {
            // Fallback: usar alert temporal
            alert(message);
        }
        
        console.log('💰 Procesamiento completado:', {
            pedidos: cantidadPedidos,
            ingresos: totalIngresos,
            productos: productosDescontados.length
        });
        
        // Resetear flag después de 3 segundos para permitir futuras ejecuciones
        setTimeout(() => {
            window.procesamientoResumenMostrado = false;
        }, 3000);
    }
    
    function updateProcesarVentasButton() {
        if (!btnProcesarVentas) return;
        
        const pedidosPagados = pedidos.filter(p => p.estado === 'pagado');
        const hasPagados = pedidosPagados.length > 0;
        
        btnProcesarVentas.disabled = !hasPagados;
        
        if (hasPagados) {
            btnProcesarVentas.innerHTML = `
                <i class="fas fa-cash-register"></i>
                Procesar Ventas (${pedidosPagados.length})
            `;
        } else {
            btnProcesarVentas.innerHTML = `
                <i class="fas fa-cash-register"></i>
                Procesar Ventas
            `;
        }
    }
    
    // ===================================
    // FILTROS Y BÚSQUEDA
    // ===================================
    function handleSearch() {
        searchTerm = pedidosSearch.value.toLowerCase();
        applyFilters();
    }
    
    function handleFilter() {
        estadoFilter = estadoFilterSelect.value;
        fechaFilter = fechaFilterInput.value;
        applyFilters();
    }
    
    function applyFilters() {
        filteredPedidos = pedidos.filter(pedido => {
            // Filtro de búsqueda
            if (searchTerm) {
                const searchMatch = 
                    pedido.numero.toLowerCase().includes(searchTerm) ||
                    pedido.cliente.nombre.toLowerCase().includes(searchTerm) ||
                    pedido.cliente.telefono.includes(searchTerm) ||
                    pedido.productos.some(p => p.nombre.toLowerCase().includes(searchTerm));
                
                if (!searchMatch) return false;
            }
            
            // Filtro de estado
            if (estadoFilter && pedido.estado !== estadoFilter) {
                return false;
            }
            
            // Filtro de fecha
            if (fechaFilter) {
                const pedidoFecha = new Date(pedido.fechaCreacion).toDateString();
                const filtroFecha = new Date(fechaFilter).toDateString();
                if (pedidoFecha !== filtroFecha) {
                    return false;
                }
            }
            
            return true;
        });
        
        renderPedidos();
    }
    
    
    function openDeliveryConfig() {
        console.log('🚚 Abriendo configuración de delivery...');
        const currentCost = getDeliveryCost();
        console.log('💰 Costo actual:', currentCost);
        
        const modalContent = `
            <div class="delivery-config">
                <div class="form-group">
                    <label for="deliveryCostInput">Costo de Delivery:</label>
                    <div class="input-group">
                        <span class="input-group-text">$</span>
                        <input type="number" class="form-control" id="deliveryCostInput" 
                               value="${currentCost}" min="0" step="100" 
                               placeholder="Ingrese el costo de delivery">
                    </div>
                    <small class="form-text text-muted">
                        Este costo se aplicará cuando los clientes seleccionen delivery en sus pedidos.
                    </small>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="deliveryEnabled" ${isDeliveryEnabled() ? 'checked' : ''}>
                        Habilitar servicio de delivery
                    </label>
                </div>
                
                <div class="delivery-info">
                    <h4>Información del Servicio:</h4>
                    <ul>
                        <li>Los clientes podrán seleccionar delivery al confirmar sus pedidos</li>
                        <li>El costo se agregará automáticamente al total del pedido</li>
                        <li>Los pedidos con delivery incluirán la dirección de entrega</li>
                    </ul>
                </div>
            </div>
        `;
        
        console.log('📝 Contenido del modal generado');
        console.log('🔍 Verificando window.dashboard:', typeof window.dashboard);
        console.log('🔍 Verificando window.dashboard.openModal:', typeof window.dashboard?.openModal);
        
        if (typeof window.dashboard !== 'undefined' && window.dashboard.openModal) {
            console.log('✅ Abriendo modal con dashboard.openModal');
            window.dashboard.openModal('Configuración de Delivery', modalContent, 'medium');
            
            // Forzar visibilidad del modal
            setTimeout(() => {
                const modalOverlay = document.getElementById('modalOverlay');
                const modal = document.getElementById('modal');
                
                if (modalOverlay && modal) {
                    console.log('🔧 Forzando visibilidad del modal...');
                    modalOverlay.style.display = 'flex';
                    modalOverlay.style.visibility = 'visible';
                    modalOverlay.style.opacity = '1';
                    modalOverlay.style.zIndex = '9999';
                    modal.style.display = 'block';
                    modal.style.visibility = 'visible';
                    modal.style.opacity = '1';
                    console.log('✅ Modal forzado a ser visible');
                } else {
                    console.error('❌ Elementos del modal no encontrados');
                }
            }, 100);
        } else {
            console.error('❌ window.dashboard.openModal no está disponible');
            alert('Error: Sistema de modales no disponible');
        }
        
        // Configurar event listeners del modal
        setTimeout(() => {
            const costInput = document.getElementById('deliveryCostInput');
            const enabledCheckbox = document.getElementById('deliveryEnabled');
            
            if (costInput) {
                costInput.addEventListener('input', function() {
                    const value = parseFloat(this.value) || 0;
                    if (value < 0) this.value = 0;
                });
            }
            
            if (enabledCheckbox) {
                enabledCheckbox.addEventListener('change', function() {
                    const costInput = document.getElementById('deliveryCostInput');
                    if (costInput) {
                        costInput.disabled = !this.checked;
                    }
                });
            }
            
            // Configurar botones del modal
            const modalFooter = document.querySelector('.modal-footer');
            if (modalFooter) {
                modalFooter.innerHTML = `
                    <button type="button" class="btn btn-secondary" onclick="closeDeliveryModal()">
                        Cancelar
                    </button>
                    <button type="button" class="btn btn-primary" onclick="saveDeliveryConfig()">
                        <i class="fas fa-save"></i>
                        Guardar Configuración
                    </button>
                `;
            }
        }, 100);
    }
    
    function closeDeliveryModal() {
        console.log('🚪 Cerrando modal de delivery...');
        
        // Cerrar usando el sistema del dashboard
        if (typeof window.dashboard !== 'undefined' && window.dashboard.closeModal) {
            window.dashboard.closeModal();
        }
        
        // Forzar limpieza del modal
        setTimeout(() => {
            const modalOverlay = document.getElementById('modalOverlay');
            const modal = document.getElementById('modal');
            
            if (modalOverlay && modal) {
                console.log('🧹 Limpiando modal completamente...');
                modalOverlay.classList.remove('active');
                modalOverlay.style.display = 'none';
                modalOverlay.style.visibility = 'hidden';
                modalOverlay.style.opacity = '0';
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
                modal.style.opacity = '0';
                
                // Limpiar contenido
                modal.innerHTML = '';
                
                // Restaurar scroll del body
                document.body.style.overflow = '';
                
                console.log('✅ Modal completamente cerrado y limpiado');
            }
        }, 50);
    }
    
    // Función global para cerrar el modal
    window.closeDeliveryModal = closeDeliveryModal;
    
    function saveDeliveryConfig() {
        const costInput = document.getElementById('deliveryCostInput');
        const enabledCheckbox = document.getElementById('deliveryEnabled');
        
        if (!costInput || !enabledCheckbox) {
            showToast('Error al obtener la configuración', 'error');
            return;
        }
        
        const cost = parseFloat(costInput.value) || 0;
        const enabled = enabledCheckbox.checked;
        
        // Guardar configuración
        localStorage.setItem('deliveryConfig', JSON.stringify({
            enabled: enabled,
            cost: cost,
            lastUpdate: new Date().toISOString()
        }));
        
        showToast('Configuración de delivery guardada correctamente', 'success');
        closeDeliveryModal();
        
        console.log('✅ Configuración de delivery guardada:', { enabled, cost });
    }
    
    function getDeliveryCost() {
        const config = localStorage.getItem('deliveryConfig');
        if (config) {
            const parsed = JSON.parse(config);
            return parsed.cost || 0;
        }
        return 5000; // Valor por defecto
    }
    
    function isDeliveryEnabled() {
        const config = localStorage.getItem('deliveryConfig');
        if (config) {
            const parsed = JSON.parse(config);
            return parsed.enabled !== false; // Por defecto habilitado
        }
        return true; // Por defecto habilitado
    }
    
    // Función pública para obtener el costo de delivery
    window.getDeliveryCost = getDeliveryCost;
    window.isDeliveryEnabled = isDeliveryEnabled;
    
    // ===================================
    // FUNCIONES PÚBLICAS
    // ===================================
    window.loadPedidosModule = function() {
        console.log('🔄 Cargando módulo de pedidos desde dashboard...');
        
        // Re-inicializar elementos del DOM por si no estaban disponibles
        const pedidosGridNew = document.getElementById('pedidosGrid');
        const btnDeliveryConfigNew = document.getElementById('btnDeliveryConfig');
        const btnProcesarVentasNew = document.getElementById('btnProcesarVentas');
        const pedidosSearchNew = document.getElementById('pedidosSearch');
        const estadoFilterSelectNew = document.getElementById('estadoFilter');
        const fechaFilterInputNew = document.getElementById('fechaFilter');
        
        console.log('🔍 Re-verificando elementos del DOM:');
        console.log('- pedidosGrid:', !!pedidosGridNew);
        console.log('- btnDeliveryConfig:', !!btnDeliveryConfigNew);
        console.log('- btnProcesarVentas:', !!btnProcesarVentasNew);
        
        // Actualizar referencias globales
        if (pedidosGridNew) pedidosGrid = pedidosGridNew;
        if (btnDeliveryConfigNew) btnDeliveryConfig = btnDeliveryConfigNew;
        if (btnProcesarVentasNew) btnProcesarVentas = btnProcesarVentasNew;
        if (pedidosSearchNew) pedidosSearch = pedidosSearchNew;
        if (estadoFilterSelectNew) estadoFilterSelect = estadoFilterSelectNew;
        if (fechaFilterInputNew) fechaFilterInput = fechaFilterInputNew;
        
        // Configurar event listeners
        setupEventListeners();
        
        // Cargar y renderizar pedidos
        loadPedidos();
        
        console.log('✅ Módulo de pedidos cargado desde dashboard');
    };
    
    // Listener para actualizaciones en tiempo real
    let isUpdating = false;
    window.addEventListener('storage', function(e) {
        if (isUpdating) return; // Evitar actualizaciones duplicadas
        
        if (e.key === 'dashboardPedidosUpdate') {
            console.log('🔄 Actualización de pedidos detectada en dashboard');
            const updateData = JSON.parse(e.newValue);
            if (updateData && updateData.type === 'newOrder') {
                console.log('📦 Nuevo pedido recibido:', updateData.order);
                isUpdating = true;
                loadPedidos(); // Recargar pedidos
                setTimeout(() => { isUpdating = false; }, 1000);
            }
        }
        
        // También escuchar cambios en userOrders
        if (e.key === 'userOrders') {
            console.log('🔄 Cambio en userOrders detectado en dashboard');
            if (!isUpdating) {
                isUpdating = true;
                loadPedidos(); // Recargar pedidos
                setTimeout(() => { isUpdating = false; }, 1000);
            }
        }
    });
    
    // ===================================
    // FUNCIONES DE UTILIDAD
    // ===================================
    
    function showToast(message, type = 'info', duration = 3000) {
        // Usar el sistema de toast del dashboard si está disponible
        if (window.dashboard && window.dashboard.showToast) {
            window.dashboard.showToast(message, type, duration);
        } else {
            // Fallback: usar alert temporal
            alert(message);
        }
    }
    
    // Funciones globales para los botones
    window.confirmarPago = confirmarPago;
    window.cancelarPedido = cancelarPedido;
    window.verDetallePedido = verDetallePedido;
    window.closePedidoModal = closePedidoModal;
    window.closeManualModal = closeManualModal;
    window.agregarProducto = agregarProducto;
    window.removerProducto = removerProducto;
    window.crearPedido = crearPedido;
    window.procesarVentas = procesarVentas;
    window.cambiarCantidad = cambiarCantidad;
    window.eliminarProducto = eliminarProducto;
    window.toggleCuota = toggleCuota;
    window.createCuotasSectionHTML = createCuotasSectionHTML;
    window.mostrarAgregarProducto = mostrarAgregarProducto;
    window.agregarProductoAPedido = agregarProductoAPedido;
    window.saveDeliveryConfig = saveDeliveryConfig;
    window.openDeliveryConfig = openDeliveryConfig;
    
    // Funciones de renderizado globales
    window.loadPedidos = loadPedidos;
    window.renderPedidos = renderPedidos;
    window.createPedidoCard = createPedidoCard;
    window.createCuotasGestionHTML = createCuotasGestionHTML;
    window.createOriginalModalHTML = createOriginalModalHTML;
    window.createFallbackModalHTML = createFallbackModalHTML;
    window.closeDeliveryModal = closeDeliveryModal;
    window.actualizarPedidosConCredito = actualizarPedidosConCredito;
    
    // Inicializar cuando se carga el módulo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
