/* ===================================
   JAVASCRIPT PRINCIPAL - INDEX.JS
   Funcionalidades generales de la aplicación
   =================================== */

// Index.js cargado

// Variables globales
let likesData = {};
let currentCategory = 'todas';
let currentSubcategory = 'todas';
let cartItems = [];
let deliveryCost = 5000; // Costo por defecto del delivery

// ===================================
// DATOS DE PRODUCTOS CON CATEGORÍAS
// ===================================
const productosData = [
    {
        id: 1,
        name: 'Microonda Damasco EM720C',
        description: 'Microonda moderna con múltiples funciones',
        price: 150000,
        originalPrice: 158000,
        discount: 5,
        image: 'img/productos/microonda.jpg',
        categories: [1], // Electrodomésticos
        subcategories: [1] // Cocina
    },
    {
        id: 2,
        name: 'Microondas Midea 30L',
        description: 'Microondas de alta capacidad con diseño moderno',
        price: 120000,
        originalPrice: 126000,
        discount: 5,
        image: 'img/placeholder.svg',
        categories: [1], // Electrodomésticos
        subcategories: [1] // Cocina
    },
    {
        id: 3,
        name: 'Refrigeradora Samsung RT50',
        description: 'Refrigeradora de dos puertas con tecnología frost',
        price: 800000,
        originalPrice: 888000,
        discount: 10,
        image: 'img/placeholder.svg',
        categories: [1], // Electrodomésticos
        subcategories: [1] // Cocina
    },
    {
        id: 4,
        name: 'Lavadora LG 15KG',
        description: 'Lavadora automática de alta capacidad',
        price: 600000,
        originalPrice: 705000,
        discount: 15,
        image: 'img/placeholder.svg',
        categories: [1], // Electrodomésticos
        subcategories: [2] // Limpieza
    },
    {
        id: 5,
        name: 'Refrigeradora Samsung 300L',
        description: 'Refrigeradora de dos puertas con tecnología inverter',
        price: 750000,
        originalPrice: 937000,
        discount: 20,
        image: 'img/placeholder.svg',
        categories: [1], // Electrodomésticos
        subcategories: [1] // Cocina
    },
    {
        id: 6,
        name: 'Lavadora LG 15kg',
        description: 'Lavadora de carga frontal con tecnología TurboWash',
        price: 650000,
        originalPrice: 722000,
        discount: 10,
        image: 'img/placeholder.svg',
        categories: [1], // Electrodomésticos
        subcategories: [2] // Limpieza
    },
    {
        id: 7,
        name: 'Televisor Smart 55"',
        description: 'Smart TV 4K con Android TV y HDR',
        price: 1200000,
        originalPrice: 1600000,
        discount: 25,
        image: 'img/placeholder.svg',
        categories: [2], // Tecnología
        subcategories: [4] // Computadoras
    }
];

// Obtener costo de delivery desde el dashboard
function getDeliveryCostFromDashboard() {
    if (typeof window.getDeliveryCost === 'function') {
        return window.getDeliveryCost();
    }
    return 5000; // Valor por defecto
}

// ===================================
// SISTEMA DE TOAST NOTIFICATIONS
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
    
    // Auto remove after 2 seconds
    setTimeout(() => {
        closeToast(toast.querySelector('.toast-close'));
    }, 2000);
}

function closeToast(closeBtn) {
    const toast = closeBtn.closest('.toast');
    if (!toast) return;
    
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// ===================================
// MODAL DE CONFIRMACIÓN DE PEDIDO
// ===================================
function openConfirmModal() {
    // Abriendo modal de confirmación
    
    const modal = document.getElementById('confirmModalOverlay');
    const modalBody = document.getElementById('confirmModalBody');
    
    if (!modal || !modalBody) {
        console.log('❌ No se encontró el modal de confirmación');
        return;
    }
    
    // Generar contenido del modal
    modalBody.innerHTML = generateConfirmModalContent();
    
    // Mostrar modal
    modal.classList.add('active');
    
    // NO mostrar botón de emergencia automáticamente
    // showEmergencyButton();
    
    // Configurar event listeners
    setupConfirmModalListeners();
    
    // Agregar listener para tecla ESC
    document.addEventListener('keydown', handleEscapeKey);
}

function generateConfirmModalContent() {
    // Obtener costo actualizado de delivery
    deliveryCost = getDeliveryCostFromDashboard();
    
    const subtotal = calculateSubtotal();
    const total = subtotal + (document.getElementById('deliverySwitch')?.checked ? deliveryCost : 0);
    
    return `
        <div class="prefactura">
            <h3 class="prefactura-title">Detalle del Pedido</h3>
            <div id="prefacturaItems">
                ${generatePrefacturaItems()}
            </div>
            <div class="prefactura-total">
                <span class="prefactura-total-label">Total:</span>
                <span class="prefactura-total-amount" id="totalAmount">$${total.toLocaleString()}</span>
            </div>
        </div>
        
        <div class="delivery-section">
            <div class="delivery-header">
                <span class="delivery-label">Delivery a Domicilio</span>
                <label class="delivery-switch">
                    <input type="checkbox" id="deliverySwitch">
                    <span class="delivery-slider"></span>
                </label>
            </div>
            <div class="delivery-cost" id="deliveryCostDisplay" style="display: none;">
                Costo adicional: $${deliveryCost.toLocaleString()}
            </div>
            
            <div class="delivery-options" id="deliveryOptions">
                <div class="delivery-option">
                    <label>Tipo de Dirección:</label>
                    <select id="addressType" onchange="handleAddressTypeChange()">
                        <option value="registered">Mi dirección</option>
                        <option value="other">Otra dirección</option>
                    </select>
                </div>
                <div class="delivery-option">
                    <input type="text" id="otherAddress" placeholder="Ingresa la dirección de entrega" style="display: none;">
                </div>
            </div>
        </div>
        
        <div class="modal-actions">
            <button class="modal-btn modal-btn-secondary" onclick="closeConfirmModal()">
                <i class="fas fa-times"></i>
                Cancelar
            </button>
            <button class="modal-btn modal-btn-primary" onclick="confirmOrder()">
                <i class="fas fa-check"></i>
                Realizar Pedido
            </button>
        </div>
    `;
}

function generatePrefacturaItems() {
    if (cartItems.length === 0) {
        return '<p>No hay productos en el carrito</p>';
    }
    
    return cartItems.map(item => `
        <div class="prefactura-item">
            <div>
                <div class="prefactura-item-name">${item.name}</div>
                <div class="prefactura-item-quantity">Cantidad: ${item.quantity}</div>
            </div>
            <div class="prefactura-item-price">$${(item.price * item.quantity).toLocaleString()}</div>
        </div>
    `).join('');
}

function calculateSubtotal() {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function setupConfirmModalListeners() {
    // Delivery switch
    const deliverySwitch = document.getElementById('deliverySwitch');
    const deliveryOptions = document.getElementById('deliveryOptions');
    const deliveryCostDisplay = document.getElementById('deliveryCostDisplay');
    
    if (deliverySwitch) {
        deliverySwitch.addEventListener('change', function() {
            if (this.checked) {
                deliveryOptions.style.display = 'block';
                deliveryOptions.classList.add('active');
                deliveryCostDisplay.style.display = 'block';
            } else {
                deliveryOptions.style.display = 'none';
                deliveryOptions.classList.remove('active');
                deliveryCostDisplay.style.display = 'none';
            }
            updateTotal();
        });
    }
    
    // Close modal
    const closeBtn = document.getElementById('confirmModalClose');
    const modal = document.getElementById('confirmModalOverlay');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeConfirmModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeConfirmModal();
            }
        });
    }
}

function handleAddressTypeChange() {
    const addressType = document.getElementById('addressType');
    const otherAddress = document.getElementById('otherAddress');
    
    if (addressType.value === 'other') {
        otherAddress.style.display = 'block';
        otherAddress.classList.add('active');
        otherAddress.required = true;
    } else {
        otherAddress.style.display = 'none';
        otherAddress.classList.remove('active');
        otherAddress.required = false;
    }
}

function updateTotal() {
    const subtotal = calculateSubtotal();
    const deliveryEnabled = document.getElementById('deliverySwitch')?.checked || false;
    const total = subtotal + (deliveryEnabled ? deliveryCost : 0);
    
    const totalElement = document.getElementById('totalAmount');
    if (totalElement) {
        totalElement.textContent = `$${total.toLocaleString()}`;
    }
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModalOverlay');
    if (modal) {
        modal.classList.remove('active');
        // Limpiar contenido para evitar problemas
        const modalBody = document.getElementById('confirmModalBody');
        if (modalBody) {
            modalBody.innerHTML = '';
        }
        // Remover listener de tecla ESC
        document.removeEventListener('keydown', handleEscapeKey);
        
        // Ocultar botón de emergencia
        hideEmergencyButton();
    }
}

function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        closeConfirmModal();
    }
}

function confirmOrder() {
    const deliveryEnabled = document.getElementById('deliverySwitch')?.checked || false;
    const addressType = document.getElementById('addressType');
    const otherAddress = document.getElementById('otherAddress');
    
    // Validar dirección si delivery está habilitado
    if (deliveryEnabled && addressType?.value === 'other' && !otherAddress?.value.trim()) {
        showToast('Por favor ingresa la dirección de entrega', 'warning', 'Dirección requerida');
        return;
    }
    
    // Verificar si hay productos de crédito en el carrito
    const hasCreditoProducts = checkForCreditoProducts();
    
    console.log('🔍 confirmOrder - hasCreditoProducts:', hasCreditoProducts);
    console.log('🔍 confirmOrder - cartItems:', cartItems);
    
    // Crear pedido en formato para el módulo de pedidos
    const order = {
        id: window.generateId('order').toString(),
        date: new Date().toISOString(),
        items: [...cartItems],
        subtotal: calculateSubtotal(),
        delivery: deliveryEnabled,
        deliveryCost: deliveryEnabled ? deliveryCost : 0,
        total: calculateSubtotal() + (deliveryEnabled ? deliveryCost : 0),
        address: deliveryEnabled ? (addressType?.value === 'registered' ? 'Mi dirección' : otherAddress?.value) : null,
        status: 'por-pagar', // Usar el formato que espera el módulo de pedidos
        createdAt: new Date().toISOString(),
        // Agregar información de crédito si aplica
        modalidadPago: hasCreditoProducts ? 'credito' : 'contado',
        cuotas: hasCreditoProducts ? generateCuotas(calculateSubtotal() + (deliveryEnabled ? deliveryCost : 0)) : null
    };
    
    console.log('🔍 confirmOrder - order creado:', order);
    console.log('🔍 confirmOrder - modalidadPago:', order.modalidadPago);
    console.log('🔍 confirmOrder - cuotas:', order.cuotas);
    
    // Guardar pedido en el formato del módulo de pedidos (único sistema)
    saveOrderForPedidosModule(order);
    
    // Limpiar carrito del sistema existente
    if (typeof window.carritoModule?.vaciarCarrito === 'function') {
        window.carritoModule.vaciarCarrito();
    }
    
    // Limpiar carrito de nuestro sistema
    cartItems = [];
    
    // Cerrar modal
    closeConfirmModal();
    
    // Mostrar confirmación
    const message = hasCreditoProducts ? 'Pedido a crédito realizado exitosamente' : 'Pedido realizado exitosamente';
    showToast(message, 'success', '¡Pedido creado!');
    
    // Actualizar UI del carrito
    updateCartUI();
}

function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    orders.push(order);
    localStorage.setItem('userOrders', JSON.stringify(orders));
}

// ===================================
// FUNCIONES DE PRODUCTOS DINÁMICOS
// ===================================

function loadDynamicProducts() {
    console.log('🔄 Iniciando carga de productos dinámicos...');
    
    // Obtener productos desde localStorage (del dashboard)
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    
    console.log('📦 Productos encontrados en localStorage:', productos.length);
    
    // Obtener el contenedor de productos usando DOM Cache
    const productosGrid = window.DOMCache ? window.DOMCache.get('productsGrid') : document.getElementById('productsGrid');
    if (!productosGrid) {
        console.error('❌ No se encontró el contenedor de productos');
        return;
    }
    
    // Si no hay productos en localStorage, mantener los productos por defecto
    if (productos.length === 0) {
        console.log('📦 No hay productos en localStorage, manteniendo productos por defecto');
        // Solo actualizar badges de crédito para productos existentes
        updateProductCreditoBadges();
        return;
    }
    
    console.log('📦 Cargando productos dinámicos:', productos.length);
    
    // Limpiar productos existentes
    productosGrid.innerHTML = '';
    
    // B3.1 - DocumentFragment para optimización
    const fragment = document.createDocumentFragment();
    
    // Renderizar cada producto en el fragment
    productos.forEach(producto => {
        const productCard = createProductCard(producto);
        fragment.appendChild(productCard);
    });
    
    // Agregar todos los productos de una vez (una sola actualización del DOM)
    productosGrid.appendChild(fragment);
    
    // Reconfigurar event listeners
    initializeProductActions();
    initializeLikes();
    initializeQuickView();
    updateProductCreditoBadges();
    
    console.log('✅ Productos dinámicos cargados correctamente con DocumentFragment');
}

function createProductCard(producto) {
    const hasDiscount = producto.offerPrice && producto.offerPrice < producto.regularPrice;
    const discountPercent = hasDiscount ? Math.round(((producto.regularPrice - producto.offerPrice) / producto.regularPrice) * 100) : 0;
    const displayPrice = producto.offerPrice || producto.regularPrice;
    
    const productCardHTML = `
        <div class="product-card" data-product="${producto.id}">
            <div class="product-image-container" data-product="${producto.id}">
                ${hasDiscount ? `<span class="discount-badge">-${discountPercent}%</span>` : ''}
                <div class="cuotas-badge" id="cuotas-badge-${producto.id}" style="display: none;">
                    <i class="fas fa-credit-card"></i>
                    <span id="cuotas-text-${producto.id}">Crédito</span>
                </div>
                <img src="${producto.image || 'img/placeholder.svg'}" alt="${producto.name}" class="product-image" onerror="this.style.display='none'">
            </div>
            <div class="product-info">
                <div class="product-brand">${producto.brand || 'MARCA'}</div>
                <div class="product-rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <span class="rating-text">(4.5)</span>
                </div>
                <h3 class="product-name">${producto.name}</h3>
                <p class="product-description">${producto.description}</p>
                <div class="product-price-container">
                    <div class="price-info">
                        <span class="price-current">USD ${displayPrice.toFixed(2)}</span>
                        ${hasDiscount ? `<span class="price-old">USD ${producto.regularPrice.toFixed(2)}</span>` : ''}
                    </div>
                    <button class="like-btn" data-product="${producto.id}">
                        <i class="far fa-heart"></i>
                        <span class="like-count">0</span>
                    </button>
                </div>
                <div class="product-actions">
                    <button class="btn-pedir" data-product="${producto.id}">
                        <i class="fas fa-shopping-bag"></i>
                    </button>
                    <button class="btn-whatsapp" data-product="${producto.id}">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Convertir HTML string a elemento DOM
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = productCardHTML;
    return tempDiv.firstElementChild;
}

// ===================================
// FUNCIONES DE CRÉDITO Y CUOTAS
// ===================================

function checkForCreditoProducts() {
    console.log('🔍 checkForCreditoProducts - cartItems:', cartItems);
    
    // Obtener productos con crédito habilitado desde localStorage
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    console.log('🔍 checkForCreditoProducts - productos:', productos.length);
    
    // Verificar si algún producto en el carrito tiene crédito habilitado
    const hasCredito = cartItems.some(item => {
        console.log('🔍 Verificando item:', item);
        const producto = productos.find(p => p.id == item.id);
        console.log('🔍 Producto encontrado:', producto);
        const hasCredito = producto && producto.credito && producto.credito.habilitado;
        console.log('🔍 Tiene crédito:', hasCredito);
        return hasCredito;
    });
    
    console.log('🔍 checkForCreditoProducts resultado:', hasCredito);
    return hasCredito;
}

function generateCuotas(total) {
    // Obtener productos con crédito habilitado desde localStorage
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    
    // Encontrar el producto de crédito en el carrito
    const creditoProduct = cartItems.find(item => {
        const producto = productos.find(p => p.id == item.id);
        return producto && producto.credito && producto.credito.habilitado;
    });
    
    if (!creditoProduct) return null;
    
    const producto = productos.find(p => p.id == creditoProduct.id);
    const numCuotas = producto.credito.cuotas || 3;
    const montoPorCuota = total / numCuotas;
    
    // Generar cuotas
    const cuotas = [];
    const fechaActual = new Date();
    
    for (let i = 1; i <= numCuotas; i++) {
        const fechaVencimiento = new Date(fechaActual);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);
        
        cuotas.push({
            numero: i,
            monto: montoPorCuota,
            fecha: fechaVencimiento.toISOString(),
            pagado: false,
            fechaPago: null
        });
    }
    
    return cuotas;
}

// Función específica para guardar pedidos en el formato del módulo de pedidos
function saveOrderForPedidosModule(order) {
    console.log('💾 Guardando pedido:', order);
    console.log('🔍 ORDER MODALIDAD PAGO:', order.modalidadPago);
    console.log('🔍 ORDER CUOTAS:', order.cuotas);
    
    // Guardar en userOrders (frontend)
    const existingUserOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    existingUserOrders.push(order);
    localStorage.setItem('userOrders', JSON.stringify(existingUserOrders));
    
    // Guardar en pedidos (dashboard) - convertir formato
    const existingPedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    const pedidoDashboard = {
        id: order.id,
        numero: `PED-${order.id.toString().slice(-3)}`,
        cliente: {
            nombre: 'Cliente Online',
            telefono: 'N/A',
            email: 'cliente@online.com'
        },
        productos: order.items.map(item => ({
            id: item.id || item.productId || Date.now() + Math.random(),
            nombre: item.name,
            cantidad: item.quantity,
            precio: item.price
        })),
        subtotal: order.subtotal,
        impuestos: 0,
        descuentos: 0,
        total: order.total,
        estado: order.status === 'por-pagar' ? 'pendiente' : 
                order.status === 'pagado' ? 'pagado' : 
                order.status === 'cancelados' ? 'cancelado' : 'pendiente',
        fechaCreacion: order.date,
        fechaModificacion: new Date().toISOString(),
        notas: '',
        delivery: order.delivery || false,
        deliveryCost: order.deliveryCost || 0,
        deliveryAddress: order.deliveryAddress || order.address || null,
        modalidadPago: order.modalidadPago || 'contado',
        credito: order.modalidadPago === 'credito' && order.cuotas ? {
            habilitado: true,
            cuotas: order.cuotas.length,
            cuotasPagadas: 0,
            montoPorCuota: order.total / order.cuotas.length,
            cuotasDetalle: order.cuotas.map((cuota, index) => ({
                numero: index + 1,
                pagado: false,
                monto: order.total / order.cuotas.length,
                fechaPago: null
            }))
        } : null
    };
    
    console.log('🔍 PEDIDO DASHBOARD CREADO:', pedidoDashboard);
    console.log('🔍 CRÉDITO EN PEDIDO DASHBOARD:', pedidoDashboard.credito);
    
    existingPedidos.push(pedidoDashboard);
    localStorage.setItem('pedidos', JSON.stringify(existingPedidos));
    
    console.log('✅ Pedido guardado en userOrders y pedidos');
    console.log('📊 Total userOrders:', existingUserOrders.length);
    console.log('📊 Total pedidos:', existingPedidos.length);
    
    // Notificar al módulo de pedidos si está abierto
    if (typeof window.refreshPedidosView === 'function') {
        window.refreshPedidosView();
    }
    
    // Notificar al dashboard si está abierto
    if (window.opener && typeof window.opener.loadPedidosModule === 'function') {
        window.opener.loadPedidosModule();
    }
    
    // También usar localStorage como fallback para el dashboard
    localStorage.setItem('dashboardPedidosUpdate', JSON.stringify({
        type: 'newOrder',
        order: order,
        timestamp: Date.now()
    }));
}

// ===================================
// FUNCIONES DEL CARRITO
// ===================================
function addToCart(productName, productPrice, productId = null) {
    // Verificar si el producto ya está en el carrito
    const existingItem = cartItems.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
        // ✅ Asegurar que el ID se añada si el item ya existía sin él
        if (!existingItem.id && productId) {
            existingItem.id = productId;
        }
    } else {
        cartItems.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }
    
    updateCartUI();
}

function removeFromCart(productName) {
    cartItems = cartItems.filter(item => item.name !== productName);
    updateCartUI();
}

function updateCartUI() {
    console.log('🔄 ACTUALIZANDO UI DEL CARRITO');
    console.log('📊 Productos en carrito:', cartItems.length);
    
    // Actualizar contador del carrito usando DOM Cache
    const cartBadge = window.DOMCache ? window.DOMCache.get('cartBadge') : document.getElementById('cartBadge');
    if (cartBadge) {
        cartBadge.textContent = cartItems.length;
        cartBadge.style.display = cartItems.length > 0 ? 'block' : 'none';
        console.log('✅ Contador del carrito actualizado');
    } else {
        console.log('❌ No se encontró #cartBadge');
    }
    
    // Actualizar botón de checkout usando DOM Cache
    const btnCheckout = window.DOMCache ? window.DOMCache.get('btnCheckout') : document.getElementById('btnCheckout');
    if (btnCheckout) {
        if (cartItems.length > 0) {
            btnCheckout.style.display = 'block';
            btnCheckout.innerHTML = `
                <i class="fas fa-shopping-cart"></i>
                Confirmar Pedido
            `;
            btnCheckout.onclick = openConfirmModal;
        } else {
            btnCheckout.style.display = 'none';
        }
        console.log('✅ Botón de checkout actualizado');
    } else {
        console.log('❌ No se encontró #btnCheckout');
    }
    
    // Actualizar contenido del carrito si está abierto
    if (typeof actualizarCarrito === 'function') {
        actualizarCarrito();
        console.log('✅ Carrito actualizado con función existente');
    }
}

// ===================================
// SISTEMA DE CRÉDITO DINÁMICO
// ===================================

function updateProductCreditoBadges() {
    // Obtener productos con crédito habilitado desde localStorage
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    
    productos.forEach(producto => {
        const productId = producto.id;
        const badge = document.getElementById(`cuotas-badge-${productId}`);
        const info = document.getElementById(`cuotas-info-${productId}`);
        const badgeText = document.getElementById(`cuotas-text-${productId}`);
        const precioText = document.getElementById(`cuota-precio-${productId}`);
        const cuotasText = document.getElementById(`cuota-texto-${productId}`);
        
        if (producto.credito && producto.credito.habilitado) {
            // Mostrar badge e info
            if (badge) {
                badge.style.display = 'flex';
                if (badgeText) {
                    badgeText.textContent = 'Crédito';
                }
            }
            
            if (info) {
                info.style.display = 'flex';
                if (precioText && cuotasText) {
                    const precio = producto.regularPrice || producto.offerPrice || 0;
                    const cuotas = producto.credito.cuotas || 2;
                    const montoPorCuota = precio / cuotas;
                    
                    precioText.textContent = `USD ${montoPorCuota.toFixed(2)}/cuota`;
                    cuotasText.textContent = `${cuotas} cuotas sin interés`;
                }
            }
        } else {
            // Ocultar badge e info
            if (badge) badge.style.display = 'none';
            if (info) info.style.display = 'none';
        }
    });
}

// ===================================
// INICIALIZACIÓN
// ===================================
let isInitialized = false;

function initializeApp() {
    if (isInitialized) return;
    isInitialized = true;
    
    // FORZAR CIERRE DE TODOS LOS MODALES AL INICIO
    const quickViewModal = document.getElementById('modalOverlay');
    const confirmModal = document.getElementById('confirmModalOverlay');
    
    // Cerrar modal de quick view
    if (quickViewModal) {
        quickViewModal.classList.remove('active');
        quickViewModal.style.display = 'none';
        quickViewModal.style.visibility = 'hidden';
        quickViewModal.style.opacity = '0';
        console.log('🔧 Modal de quick view cerrado al inicio');
    }
    
    // Cerrar modal de confirmación
    if (confirmModal) {
        confirmModal.classList.remove('active');
        confirmModal.style.display = 'none';
        confirmModal.style.visibility = 'hidden';
        confirmModal.style.opacity = '0';
        console.log('🔧 Modal de confirmación cerrado al inicio');
    }
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.height = '';
    
    initializeLikes();
    initializeQuickView();
    initializeModal();
    initializeProductActions();
    initializeSearch();
    
    // Cargar productos dinámicos desde localStorage
    loadDynamicProducts();
    
    updateProductCreditoBadges();
    
    // Configurar sincronización con dashboard
    setupDashboardSync();
    
    console.log('App inicializada correctamente');
}

function setupDashboardSync() {
    console.log('🔧 Configurando sincronización con dashboard...');
    
    // Escuchar cambios en localStorage para sincronizar productos
    window.addEventListener('storage', function(e) {
        if (e.key === 'productos') {
            console.log('🔄 Productos actualizados desde dashboard (otra pestaña), recargando...');
            loadDynamicProducts();
        }
    });
    
    // También escuchar cambios del mismo tab (para cuando se actualiza desde el mismo navegador)
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        if (key === 'productos') {
            console.log('🔄 Productos actualizados localmente, recargando...');
            setTimeout(() => {
                console.log('🔄 Ejecutando loadDynamicProducts...');
                loadDynamicProducts();
            }, 100);
        }
    };
    
    // Verificar productos cada 2 segundos como fallback (DESACTIVADO TEMPORALMENTE)
    // setInterval(() => {
    //     const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    //     if (productos.length > 0) {
    //         const productosGrid = document.getElementById('productsGrid');
    //         if (productosGrid && productosGrid.children.length === 0) {
    //             console.log('🔄 Fallback: Recargando productos...');
    //             loadDynamicProducts();
    //         }
    //     }
    // }, 2000);
    
    console.log('✅ Sincronización configurada');
}

// Función de debug para forzar la carga de productos
function debugCargarProductos() {
    console.log('🔧 DEBUG: Forzando carga de productos...');
    
    // Verificar productos en localStorage
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    console.log('📦 Productos en localStorage:', productos.length);
    
    // Verificar contenedor
    const productosGrid = document.getElementById('productsGrid');
    console.log('🎯 Contenedor encontrado:', !!productosGrid);
    
    if (productosGrid) {
        console.log('📋 Productos actuales en DOM:', productosGrid.children.length);
    }
    
    // Forzar carga
    loadDynamicProducts();
    
    // Verificar resultado
    if (productosGrid) {
        console.log('📋 Productos después de cargar:', productosGrid.children.length);
    }
}

// Exponer función globalmente para debug
window.debugCargarProductos = debugCargarProductos;

// Solo un listener de DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Cierre forzado adicional después de 5 segundos (solo si hay modales pegados)
setTimeout(() => {
    const quickViewModal = document.getElementById('modalOverlay');
    const confirmModal = document.getElementById('confirmModalOverlay');
    
    // Solo cerrar si hay modales activos que no deberían estarlo
    if (quickViewModal && quickViewModal.classList.contains('active') && 
        (!confirmModal || !confirmModal.classList.contains('active'))) {
        console.log('🔧 Modal de quick view se quedó pegado, mostrando botón de emergencia');
        showEmergencyButton();
    }
}, 5000);

// ===================================
// BARRA DE BÚSQUEDA
// ===================================
function initializeSearch() {
    const btnSearch = document.getElementById('btnSearch');
    const searchBar = document.getElementById('searchBar');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');
    
    // Abrir barra de búsqueda
    btnSearch.addEventListener('click', function() {
        searchBar.style.display = 'block';
        searchInput.focus();
    });
    
    // Cerrar barra de búsqueda
    searchClose.addEventListener('click', function() {
        searchBar.style.display = 'none';
        searchInput.value = '';
    });
    
    // Buscar mientras escribe
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        buscarProductos(searchTerm);
    });
}

function buscarProductos(termino) {
    if (termino === '') {
        // Mostrar todos los productos
        document.querySelectorAll('.product-card').forEach(card => {
            card.style.display = 'block';
        });
        return;
    }
    
    // Obtener productos desde localStorage para búsqueda
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    
    // Filtrar productos
    document.querySelectorAll('.product-card').forEach(card => {
        const productId = parseInt(card.getAttribute('data-product'));
        const producto = productos.find(p => p.id === productId);
        
        if (producto) {
            const nombre = producto.name.toLowerCase();
            const descripcion = producto.description.toLowerCase();
            const marca = (producto.brand || '').toLowerCase();
            
            if (nombre.includes(termino) || descripcion.includes(termino) || marca.includes(termino)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        } else {
            // Fallback para productos hardcodeados
            const nombre = card.querySelector('.product-name').textContent.toLowerCase();
            const descripcion = card.querySelector('.product-description').textContent.toLowerCase();
            const marca = card.querySelector('.product-brand').textContent.toLowerCase();
            
            if (nombre.includes(termino) || descripcion.includes(termino) || marca.includes(termino)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// ===================================
// SISTEMA DE LIKES (Tipo TikTok)
// ===================================
function initializeLikes() {
    // Cargar likes desde localStorage
    const savedLikes = localStorage.getItem('productLikes');
    if (savedLikes) {
        likesData = JSON.parse(savedLikes);
        
        // Aplicar likes guardados
        Object.keys(likesData).forEach(productId => {
            if (likesData[productId].liked) {
                const likeBtn = document.querySelector(`.like-btn[data-product="${productId}"]`);
                if (likeBtn) {
                    likeBtn.classList.add('liked');
                    likeBtn.querySelector('i').classList.remove('far');
                    likeBtn.querySelector('i').classList.add('fas');
                    likeBtn.querySelector('.like-count').textContent = likesData[productId].count;
                }
            }
        });
    }
    
    // Event listeners para botones de like (evitar duplicados)
    document.querySelectorAll('.like-btn').forEach(btn => {
        // Remover listener existente si existe
        btn.removeEventListener('click', handleLikeClick);
        btn.addEventListener('click', handleLikeClick);
    });
}

function handleLikeClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Verificar si el usuario está logueado
    if (!window.authModule || !window.authModule.isLoggedIn()) {
        // Mostrar mensaje y abrir modal de login
        mostrarNotificacionLike('Debes iniciar sesión para dar like', 'warning');
        if (window.authModule) {
            setTimeout(() => {
                window.authModule.abrirModalAuth();
            }, 500);
        }
        return;
    }
    
    const btn = e.currentTarget;
    const productId = btn.getAttribute('data-product');
    const icon = btn.querySelector('i');
    const countSpan = btn.querySelector('.like-count');
    
    console.log('Like click en producto:', productId); // Debug
    
    // Inicializar datos del producto si no existen
    if (!likesData[productId]) {
        likesData[productId] = { liked: false, count: 0 };
    }
    
    // Toggle like
    if (likesData[productId].liked) {
        // Quitar like
        likesData[productId].liked = false;
        likesData[productId].count = Math.max(0, likesData[productId].count - 1);
        btn.classList.remove('liked');
        icon.classList.remove('fas');
        icon.classList.add('far');
    } else {
        // Dar like
        likesData[productId].liked = true;
        likesData[productId].count += 1;
        btn.classList.add('liked');
        icon.classList.remove('far');
        icon.classList.add('fas');
    }
    
    // Actualizar contador
    countSpan.textContent = likesData[productId].count;
    
    console.log('Estado actualizado:', likesData[productId]); // Debug
    
    // Guardar en localStorage
    localStorage.setItem('productLikes', JSON.stringify(likesData));
}

// Función de notificación específica para likes
function mostrarNotificacionLike(mensaje, tipo = 'info') {
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
    }, 2500);
}

// ===================================
// QUICK VIEW MODAL
// ===================================
function initializeQuickView() {
    console.log('🔧 Inicializando Quick View...');
    
    // La imagen completa es clicable (evitar duplicados)
    const containers = document.querySelectorAll('.product-image-container');
    console.log('🔍 Contenedores encontrados:', containers.length);
    
    containers.forEach((container, index) => {
        // Remover listener existente si existe
        container.removeEventListener('click', handleQuickView);
        container.addEventListener('click', handleQuickView);
        console.log(`✅ Listener agregado al contenedor ${index + 1}`);
    });
    
    console.log('✅ Quick View inicializado');
}

function handleQuickView(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔍 handleQuickView ejecutado');
    
    const productId = e.currentTarget.getAttribute('data-product');
    const productCard = e.currentTarget.closest('.product-card');
    
    console.log('🔍 Product ID:', productId);
    console.log('🔍 Product Card:', productCard);
    
    // Extraer información del producto - Solo lo necesario
    const name = productCard.querySelector('.product-name')?.textContent || 'Producto';
    const description = productCard.querySelector('.product-description')?.textContent || 'Descripción no disponible';
    const price = productCard.querySelector('.price-current')?.textContent || 'Precio no disponible';
    const priceOldElement = productCard.querySelector('.price-old');
    const priceOld = priceOldElement ? priceOldElement.textContent : null;
    const image = productCard.querySelector('.product-image')?.src || 'img/placeholder.svg';
    
    console.log('🔍 Datos del producto:', { name, description, price, priceOld, image });
    
    // Verificar que el modal existe
    const modal = document.getElementById('modalOverlay');
    console.log('🔍 Modal encontrado:', !!modal);
    
    if (!modal) {
        console.error('❌ Modal no encontrado');
        return;
    }
    
    // Llenar modal - Solo nombre, descripción, precio y botones
    document.getElementById('modalName').textContent = name;
    document.getElementById('modalDescription').textContent = description;
    document.getElementById('modalPrice').textContent = price;
    document.getElementById('modalPriceOld').textContent = priceOld;
    document.getElementById('modalImage').src = image;
    
    // Mostrar modal
    modal.classList.add('active');
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    document.body.style.overflow = 'hidden';
    
    // NO mostrar botón de emergencia automáticamente
    // showEmergencyButton();
    
    console.log('✅ Modal mostrado');
}

function initializeModal() {
    const modal = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('modalClose');
    
    // Cerrar modal al hacer click en el botón
    closeBtn.addEventListener('click', closeModal);
    
    // Cerrar modal al hacer click fuera del contenido
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Agregar listener para tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

function closeModal() {
    closeQuickViewModal();
}

function closeAllModals() {
    // Cerrar modal de quick view
    const quickViewModal = document.getElementById('modalOverlay');
    if (quickViewModal) {
        quickViewModal.classList.remove('active');
    }
    
    // Cerrar modal de confirmación
    const confirmModal = document.getElementById('confirmModalOverlay');
    if (confirmModal) {
        confirmModal.classList.remove('active');
    }
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
    
    // Ocultar botón de emergencia
    const emergencyBtn = document.getElementById('emergencyCloseBtn');
    if (emergencyBtn) {
        emergencyBtn.style.display = 'none';
    }
    
    console.log('✅ Todos los modales cerrados');
}

function showEmergencyButton() {
    const emergencyBtn = document.getElementById('emergencyCloseBtn');
    if (emergencyBtn) {
        emergencyBtn.style.display = 'block';
    }
}

function hideEmergencyButton() {
    const emergencyBtn = document.getElementById('emergencyCloseBtn');
    if (emergencyBtn) {
        emergencyBtn.style.display = 'none';
    }
}

// Función global para cerrar modales
window.closeAllModals = closeAllModals;
window.closeModal = closeModal;

// Función de emergencia para forzar cierre
function forceCloseModal() {
    console.log('🚨 FORZANDO CIERRE DE MODALES...');
    
    // Solo cerrar el modal de quick view (no el de confirmación)
    const quickViewModal = document.getElementById('modalOverlay');
    if (quickViewModal) {
        quickViewModal.style.display = 'none';
        quickViewModal.style.visibility = 'hidden';
        quickViewModal.style.opacity = '0';
        quickViewModal.classList.remove('active');
        console.log('✅ Modal de quick view cerrado');
    }
    
    // Restaurar scroll del body solo si no hay otros modales abiertos
    const confirmModal = document.getElementById('confirmModalOverlay');
    if (!confirmModal || !confirmModal.classList.contains('active')) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.classList.remove('modal-open');
        
        // Remover cualquier clase que pueda estar bloqueando
        document.documentElement.style.overflow = '';
        document.documentElement.style.position = '';
    }
    
    // Ocultar botón de emergencia solo si no hay modales abiertos
    const emergencyBtn = document.getElementById('emergencyCloseBtn');
    if (emergencyBtn && (!confirmModal || !confirmModal.classList.contains('active'))) {
        emergencyBtn.style.display = 'none';
    }
    
    // Forzar reflow
    document.body.offsetHeight;
    
    console.log('✅ CIERRE FORZADO COMPLETADO');
}

window.forceCloseModal = forceCloseModal;

// Función específica para cerrar solo el modal de quick view
function closeQuickViewModal() {
    const quickViewModal = document.getElementById('modalOverlay');
    if (quickViewModal) {
        quickViewModal.style.display = 'none';
        quickViewModal.style.visibility = 'hidden';
        quickViewModal.style.opacity = '0';
        quickViewModal.classList.remove('active');
        document.body.style.overflow = '';
        hideEmergencyButton();
        console.log('✅ Modal de quick view cerrado');
    }
}

window.closeQuickViewModal = closeQuickViewModal;
window.updateProductCreditoBadges = updateProductCreditoBadges;
window.checkForCreditoProducts = checkForCreditoProducts;
window.generateCuotas = generateCuotas;

// ===================================
// ACCIONES DE PRODUCTOS
// ===================================
function initializeProductActions() {
    // Botones de pedir (evitar duplicados)
    document.querySelectorAll('.btn-pedir').forEach(btn => {
        // Remover listener existente si existe
        btn.removeEventListener('click', btn._pedirHandler);
        btn._pedirHandler = function(e) {
            const productCard = e.target.closest('.product-card');
            const productName = productCard ? productCard.querySelector('.product-name').textContent : 'Producto';
            const productId = productCard ? productCard.getAttribute('data-product') : null;
            
            // Obtener precio desde el elemento correcto
            const productPriceElement = productCard ? productCard.querySelector('.price-current') : null;
            const productPrice = productPriceElement ? parseFloat(productPriceElement.textContent.replace(/[^0-9.]/g, '')) : 0;
            
            // Agregar al carrito
            addToCart(productName, productPrice, productId);
            //showToast(`${productName} agregado al carrito`, 'success', '¡Producto agregado!');
        };
        btn.addEventListener('click', btn._pedirHandler);
    });
    
    // Botones de modal pedir (evitar duplicados)
    document.querySelectorAll('.modal-btn-pedir').forEach(btn => {
        // Remover listener existente si existe
        btn.removeEventListener('click', btn._modalPedirHandler);
        btn._modalPedirHandler = function() {
            const productName = document.getElementById('modalName').textContent;
            const productPrice = parseInt(document.getElementById('modalPrice').textContent.replace(/[^0-9]/g, ''));
            
            // Obtener ID del producto desde el modal (si está disponible)
            const productId = document.querySelector('.product-card[data-product]')?.getAttribute('data-product');
            
            // Agregar al carrito
            addToCart(productName, productPrice, productId);
            //showToast(`${productName} agregado al carrito`, 'success', '¡Producto agregado!');
            closeModal();
        };
        btn.addEventListener('click', btn._modalPedirHandler);
    });
    
    // Botones de WhatsApp (evitar duplicados)
    document.querySelectorAll('.btn-whatsapp, .modal-btn-whatsapp').forEach(btn => {
        // Remover listener existente si existe
        btn.removeEventListener('click', btn._whatsappHandler);
        btn._whatsappHandler = function(e) {
            const productCard = e.target.closest('.product-card');
            let productName = 'este producto';
            let productId = null;
            
            if (productCard) {
                productName = productCard.querySelector('.product-name').textContent;
                
                // Obtener ID del producto si existe
                const productIdAttr = productCard.getAttribute('data-product-id');
                if (productIdAttr) {
                    productId = productIdAttr;
                }
            } else {
                productName = document.getElementById('modalName').textContent;
            }
            
            const message = `Hola! Me interesa ${productName}`;
            const whatsappUrl = getWhatsAppLink(message, productId);
            
            if (whatsappUrl !== '#') {
                window.open(whatsappUrl, '_blank');
            } else {
                mostrarNotificacion('Número de WhatsApp no configurado', 'warning');
            }
        };
        btn.addEventListener('click', btn._whatsappHandler);
    });
}

// ===================================
// SISTEMA DE CALIFICACIÓN POR ESTRELLAS
// ===================================
function initializeRatingSystem() {
    // Esta función se implementará cuando se necesite interactividad en las estrellas
    document.querySelectorAll('.product-rating').forEach(ratingContainer => {
        // Por ahora las estrellas son solo visuales
        // Se implementará funcionalidad de votación más adelante
    });
}

// ===================================
// MENÚ INFERIOR - NAVEGACIÓN
// ===================================
document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        // Remover clase active de todos los botones
        document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
        
        // Agregar clase active al botón clickeado
        this.classList.add('active');
        
        const module = this.getAttribute('data-module');
        console.log(`Navegando a módulo: ${module}`);
        
        // Si es el botón de catálogo, mostrar todos los productos
        if (module === 'catalogo' || module === 'outlet') {
            console.log('🏠 Volviendo al catálogo principal...');
            mostrarTodosLosProductos();
        }
        
        // OCULTAR SUBMENÚ DE SUBCATEGORÍAS AL CAMBIAR A CUALQUIER MÓDULO
        const subcategoryContainer = document.getElementById('subcategoryContainer');
        if (subcategoryContainer && (module === 'pedidos' || module === 'lonuevo' || module === 'deseos')) {
            subcategoryContainer.style.display = 'none';
            console.log('✅ Submenú de subcategorías ocultado al cambiar a módulo:', module);
        }
        
        // La funcionalidad específica se maneja en cada archivo JS del módulo
    });
});

// ===================================
// UTILIDADES
// ===================================

// Función para formatear precios
function formatPrice(price) {
    return `USD ${parseFloat(price).toFixed(2)}`;
}

// Función para animar elementos
function animateElement(element, animationClass) {
    element.classList.add(animationClass);
    setTimeout(() => {
        element.classList.remove(animationClass);
    }, 400);
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Se implementará sistema de notificaciones toast
    console.log(`[${type}] ${message}`);
}

// ===================================
// LISTENER PARA MENSAJES DEL DASHBOARD (MEJORADO A2)
// ===================================
if (!window.dashboardMessageListenerAdded) {
    window.addEventListener('message', function(event) {
        // MEJORA A2: Validar origen para seguridad
        const allowedOrigins = [
            'http://localhost',
            'http://127.0.0.1',
            'file://',
            window.location.origin
        ];
        
        if (!allowedOrigins.some(origin => event.origin.startsWith(origin))) {
            console.log('Mensaje de origen no autorizado ignorado:', event.origin);
            return;
        }
        
        console.log('Mensaje recibido del dashboard:', event.data);
        
        if (event.data.type === 'toggleCartButtons') {
            const mostrar = event.data.mostrar;
            
            function aplicarBotonesCarrito() {
                const cartButtons = document.querySelectorAll('.btn-pedir, .modal-btn-pedir');
                console.log('Aplicando visibilidad a botones:', cartButtons.length, 'botones encontrados');
                
                cartButtons.forEach(btn => {
                    btn.style.display = mostrar ? 'block' : 'none';
                });
                
                console.log('Botones de carrito', mostrar ? 'mostrados' : 'ocultados');
            }
            
            // Aplicar inmediatamente
            aplicarBotonesCarrito();
            
            // Aplicar con delay por si los elementos se cargan después
            setTimeout(aplicarBotonesCarrito, 100);
            setTimeout(aplicarBotonesCarrito, 500);
        }
        
        // También manejar el mensaje de visibilidad general
        if (event.data.type === 'toggleVisibility') {
            const icon = event.data.icon;
            const mostrar = event.data.mostrar;
            
            console.log('🔍 toggleVisibility recibido:', icon, mostrar);
            
            // Función para aplicar visibilidad con retry
            function aplicarVisibilidadConRetry() {
                if (icon === 'cart') {
                    const btnCarrito = document.getElementById('btnCarrito');
                    console.log('🔍 Buscando btnCarrito:', btnCarrito);
                    if (btnCarrito) {
                        btnCarrito.style.display = mostrar ? 'block' : 'none';
                        console.log('✅ Botón de carrito', mostrar ? 'mostrado' : 'ocultado');
                    } else {
                        console.log('❌ No se encontró btnCarrito');
                    }
                    
                    // También ocultar/mostrar botones de agregar al carrito
                    const cartButtons = document.querySelectorAll('.btn-pedir, .modal-btn-pedir');
                    console.log('Botones de carrito encontrados:', cartButtons.length);
                    cartButtons.forEach(btn => {
                        btn.style.display = mostrar ? 'block' : 'none';
                    });
                    console.log('Botones de agregar al carrito', mostrar ? 'mostrados' : 'ocultados');
                }
                
                if (icon === 'pedidos') {
                    const btnPedidos = document.querySelector('[data-module="pedidos"]');
                    if (btnPedidos) {
                        btnPedidos.style.display = mostrar ? 'flex' : 'none';
                        console.log('Botón de pedidos', mostrar ? 'mostrado' : 'ocultado');
                    } else {
                        console.log('Botón de pedidos no encontrado');
                    }
                }
            }
            
            // Aplicar inmediatamente
            aplicarVisibilidadConRetry();
            
            // Aplicar con delay por si los elementos se cargan después
            setTimeout(aplicarVisibilidadConRetry, 100);
            setTimeout(aplicarVisibilidadConRetry, 500);
        }
        
        if (event.data.type === 'updateHeroPromociones') {
            console.log('Actualizando configuración de promociones:', event.data.config);
            actualizarHeroPromociones(event.data.config);
        }
        
        if (event.data.type === 'updateLogo') {
            const { logoText, slogan, logoType, logoImage } = event.data;
            console.log('Actualizando logo:', { logoText, slogan, logoType, logoImage });
            
            // Actualizar logo text
            const logoTextElement = document.querySelector('.logo-text');
            if (logoTextElement && logoText) {
                logoTextElement.textContent = logoText;
            }
            
            // Actualizar slogan
            const logoSubtitleElement = document.querySelector('.logo-subtitle');
            if (logoSubtitleElement && slogan) {
                logoSubtitleElement.textContent = slogan;
            }
            
            // Actualizar logo image
            const logoImageElement = document.getElementById('logoImage');
            const logoTextContainer = document.querySelector('.logo-text-container');
            
            if (logoType === 'image' && logoImage) {
                if (logoImageElement) {
                    logoImageElement.src = logoImage;
                    logoImageElement.style.display = 'block';
                }
                if (logoTextContainer) {
                    logoTextContainer.style.display = 'none';
                }
            } else {
                if (logoImageElement) {
                    logoImageElement.style.display = 'none';
                }
                if (logoTextContainer) {
                    logoTextContainer.style.display = 'flex';
                }
            }
        }
    });
    window.dashboardMessageListenerAdded = true;
}

// ===================================
// APLICAR CONFIGURACIÓN AL CARGAR
// ===================================
function aplicarConfiguracionInicial() {
    const visibilityData = JSON.parse(localStorage.getItem('headerVisibility') || '{}');
    
    // Controlar botón principal del carrito
    if (typeof visibilityData.cart !== 'undefined') {
        const btnCarrito = document.getElementById('btnCarrito');
        if (btnCarrito) {
            btnCarrito.style.display = visibilityData.cart ? 'block' : 'none';
            console.log('Botón principal del carrito aplicado:', visibilityData.cart);
        }
    }
    
    // Controlar botones de agregar al carrito
    if (typeof visibilityData.cart !== 'undefined') {
        const cartButtons = document.querySelectorAll('.btn-pedir, .modal-btn-pedir');
        cartButtons.forEach(btn => {
            btn.style.display = visibilityData.cart ? 'block' : 'none';
        });
        console.log('Configuración de botones de carrito aplicada:', visibilityData.cart);
    }
    
    // Controlar pedidos en menú inferior
    if (typeof visibilityData.pedidos !== 'undefined') {
        const btnPedidos = document.querySelector('[data-module="pedidos"]');
        if (btnPedidos) {
            btnPedidos.style.display = visibilityData.pedidos ? 'flex' : 'none';
        }
        console.log('Configuración de pedidos aplicada:', visibilityData.pedidos);
    }
}

// Aplicar configuración cuando se carga la página
document.addEventListener('DOMContentLoaded', aplicarConfiguracionInicial);

// ===================================
// APLICAR COLORES DEL TEMA
// ===================================
function aplicarColoresTema() {
    const configData = JSON.parse(localStorage.getItem('dashboardConfig') || '{}');
    const colors = configData.design || {};
    
    console.log('Aplicando colores del tema:', colors);
    
    // Aplicar colores a las variables CSS
    if (colors.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', colors.primaryColor);
    }
    if (colors.secondaryColor) {
        document.documentElement.style.setProperty('--secondary-color', colors.secondaryColor);
    }
    if (colors.accentColor) {
        document.documentElement.style.setProperty('--accent-color', colors.accentColor);
    }
    if (colors.successColor) {
        document.documentElement.style.setProperty('--success-color', colors.successColor);
    }
    if (colors.warningColor) {
        document.documentElement.style.setProperty('--warning-color', colors.warningColor);
    }
    if (colors.textPrimaryColor) {
        document.documentElement.style.setProperty('--text-primary-color', colors.textPrimaryColor);
    }
    if (colors.textSecondaryColor) {
        document.documentElement.style.setProperty('--text-secondary-color', colors.textSecondaryColor);
    }
    if (colors.backgroundColor) {
        document.documentElement.style.setProperty('--background-color', colors.backgroundColor);
    }
    if (colors.borderColor) {
        document.documentElement.style.setProperty('--border-color', colors.borderColor);
    }
    
    console.log('Colores del tema aplicados correctamente');
}

// Aplicar colores al cargar la página
document.addEventListener('DOMContentLoaded', aplicarColoresTema);

// Aplicar configuración de logo al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const logoData = JSON.parse(localStorage.getItem('logoConfig') || '{}');
    const configData = JSON.parse(localStorage.getItem('dashboardConfig') || '{}');
    
    // Usar datos del dashboard si no hay logoConfig específico
    const finalLogoData = Object.keys(logoData).length > 0 ? logoData : {
        logoText: configData.design?.logoText || '',
        slogan: configData.design?.businessSlogan || '',
        logoType: configData.design?.logoType || 'text',
        logoImage: configData.design?.logoImage || ''
    };
    
    console.log('Aplicando configuración de logo:', finalLogoData);
    
    // Aplicar logo text si existe
    const logoTextElement = document.querySelector('.logo-text');
    if (logoTextElement && finalLogoData.logoText) {
        logoTextElement.textContent = finalLogoData.logoText;
        console.log('Logo text aplicado:', finalLogoData.logoText);
    }
    
    // Aplicar slogan si existe
    const logoSubtitleElement = document.querySelector('.logo-subtitle');
    if (logoSubtitleElement && finalLogoData.slogan) {
        logoSubtitleElement.textContent = finalLogoData.slogan;
        console.log('Slogan aplicado:', finalLogoData.slogan);
    }
    
    // Aplicar logo image si existe
    const logoImageElement = document.getElementById('logoImage');
    const logoTextContainer = document.querySelector('.logo-text-container');
    
    if (finalLogoData.logoType === 'image' && finalLogoData.logoImage) {
        if (logoImageElement) {
            logoImageElement.src = finalLogoData.logoImage;
            logoImageElement.style.display = 'block';
            console.log('Logo image aplicado:', finalLogoData.logoImage);
        }
        if (logoTextContainer) {
            logoTextContainer.style.display = 'none';
        }
    } else {
        if (logoImageElement) {
            logoImageElement.style.display = 'none';
        }
        if (logoTextContainer) {
            logoTextContainer.style.display = 'flex';
        }
    }
});

// Aplicar configuración de promociones al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        aplicarConfiguracionPromociones();
    }, 1000);
});

// ===================================
// LISTENER PARA CAMBIOS DE LOGO DESDE LOCALSTORAGE
// ===================================
if (!window.logoUpdateListenerAdded) {
    window.addEventListener('storage', function(event) {
        if (event.key === 'logoUpdate') {
            try {
                const logoData = JSON.parse(event.newValue || '{}');
                console.log('🔄 Cambio de logo detectado desde localStorage:', logoData);
                
                if (logoData.type === 'updateLogo') {
                    // Actualizar logo text
                    const logoTextElement = document.querySelector('.logo-text');
                    if (logoTextElement && logoData.logoText) {
                        logoTextElement.textContent = logoData.logoText;
                        console.log('✅ Logo text actualizado:', logoData.logoText);
                    }
                    
                    // Actualizar slogan
                    const logoSubtitleElement = document.querySelector('.logo-subtitle');
                    if (logoSubtitleElement && logoData.slogan) {
                        logoSubtitleElement.textContent = logoData.slogan;
                        console.log('✅ Slogan actualizado:', logoData.slogan);
                    }
                    
                    // Actualizar logo image
                    const logoImageElement = document.getElementById('logoImage');
                    const logoTextContainer = document.querySelector('.logo-text-container');
                    
                    if (logoData.logoType === 'image' && logoData.logoImage) {
                        if (logoImageElement) {
                            logoImageElement.src = logoData.logoImage;
                            logoImageElement.style.display = 'block';
                        }
                        if (logoTextContainer) {
                            logoTextContainer.style.display = 'none';
                        }
                        console.log('✅ Logo image actualizado:', logoData.logoImage);
                    } else {
                        if (logoImageElement) {
                            logoImageElement.style.display = 'none';
                        }
                        if (logoTextContainer) {
                            logoTextContainer.style.display = 'flex';
                        }
                        console.log('✅ Logo text mostrado');
                    }
                }
            } catch (error) {
                console.error('❌ Error al procesar cambio de logo:', error);
            }
        }
    });
    window.logoUpdateListenerAdded = true;
}

// ===================================
// SISTEMA DE FILTRADO DE PRODUCTOS
// ===================================

// Función para filtrar productos por categoría
function filtrarProductosPorCategoria(categoriaId) {
    console.log('🔍 Filtrando productos por categoría:', categoriaId);
    
    const productosGrid = document.getElementById('productsGrid');
    if (!productosGrid) {
        console.error('❌ No se encontró el contenedor de productos');
        return;
    }
    
    const productCards = productosGrid.querySelectorAll('.product-card');
    let productosVisibles = 0;
    
    // Obtener productos desde localStorage
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    
    productCards.forEach((card) => {
        const productId = parseInt(card.getAttribute('data-product'));
        const producto = productos.find(p => p.id === productId);
        
        if (producto && producto.categories && producto.categories.includes(categoriaId)) {
            card.style.display = 'block';
            productosVisibles++;
            console.log(`✅ Producto ${producto.name} mostrado`);
        } else {
            card.style.display = 'none';
            console.log(`❌ Producto ${productId} ocultado`);
        }
    });
    
    console.log(`📊 Total productos visibles: ${productosVisibles}`);
    currentCategory = categoriaId;
    currentSubcategory = 'todas';
}

// Función para filtrar productos por subcategoría
function filtrarProductosPorSubcategoria(subcategoriaId) {
    console.log('🔍 Filtrando productos por subcategoría:', subcategoriaId);
    console.log('🔍 Categoría actual:', currentCategory);
    
    const productosGrid = document.getElementById('productsGrid');
    if (!productosGrid) {
        console.error('❌ No se encontró el contenedor de productos');
        return;
    }
    
    const productCards = productosGrid.querySelectorAll('.product-card');
    let productosVisibles = 0;
    
    // Obtener productos desde localStorage
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    
    productCards.forEach((card) => {
        const productId = parseInt(card.getAttribute('data-product'));
        const producto = productos.find(p => p.id === productId);
        
        // Filtrar por categoría actual Y subcategoría específica
        if (producto && 
            producto.categories && producto.categories.includes(parseInt(currentCategory)) && 
            producto.subcategories && producto.subcategories.includes(parseInt(subcategoriaId))) {
            card.style.display = 'block';
            productosVisibles++;
            console.log(`✅ Producto ${producto.name} mostrado`);
        } else {
            card.style.display = 'none';
            console.log(`❌ Producto ${productId} ocultado`);
        }
    });
    
    console.log(`📊 Total productos visibles: ${productosVisibles}`);
    currentSubcategory = subcategoriaId;
}

// Función para mostrar todos los productos
function mostrarTodosLosProductos() {
    console.log('🔍 Mostrando todos los productos');
    
    const productosGrid = document.getElementById('productsGrid');
    if (!productosGrid) {
        console.error('❌ No se encontró el contenedor de productos');
        return;
    }
    
    const productCards = productosGrid.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.style.display = 'block';
    });
    
    // OCULTAR SUBMENÚ DE SUBCATEGORÍAS
    const subcategoryContainer = document.getElementById('subcategoryContainer');
    if (subcategoryContainer) {
        subcategoryContainer.style.display = 'none';
        console.log('✅ Submenú de subcategorías ocultado');
    }
    
    console.log(`📊 Total productos visibles: ${productCards.length}`);
    currentCategory = 'todas';
    currentSubcategory = 'todas';
}

// Función para mostrar todos los productos de una categoría
function mostrarTodosLosProductosDeCategoria(categoriaId) {
    console.log('🔍 Mostrando todos los productos de la categoría:', categoriaId);
    
    const productosGrid = document.getElementById('productsGrid');
    if (!productosGrid) {
        console.error('❌ No se encontró el contenedor de productos');
        return;
    }
    
    const productCards = productosGrid.querySelectorAll('.product-card');
    let productosVisibles = 0;
    
    productCards.forEach((card, index) => {
        const productoId = index + 1;
        const producto = productosData.find(p => p.id === productoId);
        
        if (producto && producto.categories.includes(categoriaId)) {
            card.style.display = 'block';
            productosVisibles++;
        } else {
            card.style.display = 'none';
        }
    });
    
    console.log(`📊 Total productos visibles: ${productosVisibles}`);
    currentCategory = categoriaId;
    currentSubcategory = 'todas';
}

// Exportar funciones globalmente para que las use categorias-index.js
window.loadProductosPorCategoria = filtrarProductosPorCategoria;
window.loadProductosPorSubcategoria = filtrarProductosPorSubcategoria;
window.onTodosSelected = mostrarTodosLosProductos;
window.onCategoriaSelected = function(categoria) {
    if (categoria === null) {
        mostrarTodosLosProductos();
    } else {
        filtrarProductosPorCategoria(categoria.id);
    }
};

function aplicarConfiguracionPromociones() {
    console.log('🔄 Aplicando configuración inicial de promociones...');
    
    // Cargar configuración desde localStorage
    const heroConfig = localStorage.getItem('heroPromocionesConfig');
    if (heroConfig) {
        try {
            const config = JSON.parse(heroConfig);
            console.log('📋 Configuración de promociones encontrada:', config);
            actualizarHeroPromociones(config);
        } catch (error) {
            console.error('❌ Error al cargar configuración de promociones:', error);
        }
    } else {
        console.log('ℹ️ No hay configuración de promociones guardada, usando defaults');
        // Aplicar configuración por defecto (hero oculto)
        const heroSection = document.getElementById('heroPromociones');
        if (heroSection) {
            heroSection.style.display = 'none';
            console.log('✅ Hero de promociones oculto por defecto');
        }
    }
}

// ===================================
// LISTENER PARA CAMBIOS EN LOCALSTORAGE (OPTIMIZADO)
// ===================================
if (!window.storageListenerAdded) {
    window.addEventListener('storage', function(event) {
        console.log('Cambio detectado en localStorage:', event.key, event.newValue);
        
        if (event.key === 'cartButtonsUpdate') {
            try {
                const data = JSON.parse(event.newValue);
                console.log('Aplicando cambio de botones de carrito desde localStorage:', data);
                
                function aplicarBotonesCarrito() {
                    // Botón principal del carrito
                    const btnCarrito = document.getElementById('btnCarrito');
                    if (btnCarrito) {
                        btnCarrito.style.display = data.mostrar ? 'block' : 'none';
                        console.log('✅ Botón principal del carrito desde localStorage', data.mostrar ? 'mostrado' : 'ocultado');
                    } else {
                        console.log('❌ No se encontró btnCarrito desde localStorage');
                    }
                    
                    // Botones individuales de agregar al carrito
                    const cartButtons = document.querySelectorAll('.btn-pedir, .modal-btn-pedir');
                    console.log('Aplicando visibilidad a botones desde localStorage:', cartButtons.length, 'botones encontrados');
                    
                    cartButtons.forEach(btn => {
                        btn.style.display = data.mostrar ? 'block' : 'none';
                    });
                    
                    console.log('Botones de carrito desde localStorage', data.mostrar ? 'mostrados' : 'ocultados');
                }
                
                // Aplicar inmediatamente
                aplicarBotonesCarrito();
                
                // Aplicar con delay por si los elementos se cargan después
                setTimeout(aplicarBotonesCarrito, 100);
                setTimeout(aplicarBotonesCarrito, 500);
            } catch (error) {
                console.error('Error al procesar cambio de localStorage para botones de carrito:', error);
            }
        }
        
        if (event.key === 'pedidosUpdate') {
            try {
                const data = JSON.parse(event.newValue);
                console.log('Aplicando cambio de pedidos desde localStorage:', data);
                
                function aplicarPedidos() {
                    const btnPedidos = document.querySelector('[data-module="pedidos"]');
                    if (btnPedidos) {
                        btnPedidos.style.display = data.mostrar ? 'flex' : 'none';
                        console.log('Botón de pedidos desde localStorage', data.mostrar ? 'mostrado' : 'ocultado');
                    } else {
                        console.log('Botón de pedidos no encontrado desde localStorage');
                    }
                }
                
                // Aplicar inmediatamente
                aplicarPedidos();
                
                // Aplicar con delay por si los elementos se cargan después
                setTimeout(aplicarPedidos, 100);
                setTimeout(aplicarPedidos, 500);
            } catch (error) {
                console.error('Error al procesar cambio de localStorage para pedidos:', error);
            }
        }
        
        if (event.key === 'dashboardConfig') {
            try {
                const data = JSON.parse(event.newValue);
                console.log('Aplicando cambio de configuración desde localStorage:', data);
                
                // Aplicar colores del tema
                if (data.design) {
                    aplicarColoresTema();
                }
            } catch (error) {
                console.error('Error al procesar cambio de configuración desde localStorage:', error);
            }
        }
        
        if (event.key === 'heroPromocionesUpdate') {
            try {
                const data = JSON.parse(event.newValue);
                console.log('Aplicando cambio de promociones desde localStorage:', data);
                
                if (data.type === 'updateHeroPromociones') {
                    actualizarHeroPromociones(data.config);
                }
            } catch (error) {
                console.error('Error al procesar cambio de promociones desde localStorage:', error);
            }
        }
        
        // Listener para cambios de estado de pedidos
        if (event.key === 'userOrders') {
            try {
                console.log('🔄 Cambio detectado en userOrders desde localStorage');
                if (typeof window.refreshPedidosView === 'function') {
                    console.log('📦 Actualizando vista de pedidos desde localStorage');
                    window.refreshPedidosView();
                }
            } catch (error) {
                console.error('Error al procesar cambio de pedidos desde localStorage:', error);
            }
        }
    });
    window.storageListenerAdded = true;
}

// ===================================
// FUNCIONES DE PROMOCIONES
// ===================================
function actualizarHeroPromociones(config) {
    console.log('🔄 Actualizando hero de promociones con configuración:', config);
    
    const heroSection = document.getElementById('heroPromociones');
    if (!heroSection) {
        console.log('❌ Sección de hero de promociones no encontrada');
        return;
    }
    
    // Mostrar/ocultar la sección
    const shouldShow = config.visible;
    heroSection.style.display = shouldShow ? 'block' : 'none';
    console.log(`✅ Hero de promociones ${shouldShow ? 'mostrado' : 'ocultado'}`);
    
    if (config.visible) {
        console.log('🔄 Hero visible, actualizando slider...');
        // Actualizar el slider con la nueva configuración
        if (window.updateHeroSlider) {
            window.updateHeroSlider(config);
            console.log('✅ Slider actualizado correctamente');
        } else {
            console.log('⚠️ Función updateHeroSlider no disponible, recargando página...');
            // Recargar la página para aplicar cambios
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    } else {
        console.log('✅ Hero oculto, no se actualiza el slider');
    }
}

// ===================================
// EXPORT PARA USO EN OTROS MÓDULOS
// ===================================
window.appUtils = {
    formatPrice,
    animateElement,
    showNotification,
    closeModal
};

