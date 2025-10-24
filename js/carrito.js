/* ===================================
   JAVASCRIPT CARRITO DE COMPRAS
   =================================== */

console.log('🛒 CARRITO.JS CARGADO - VERSIÓN 20241220');

(function() {
    'use strict';
    
    console.log('Módulo Carrito cargado');
    
    let carritoData = [];
    
    // Inicialización
    function init() {
        cargarCarrito();
        filtrarItemsValidos(); // Filtrar items inválidos al cargar
        setupEventListeners();
        actualizarBadgeCarrito();
    }
    
    // Event Listeners
    function setupEventListeners() {
        const btnCarrito = document.getElementById('btnCarrito');
        const cartOverlay = document.getElementById('cartOverlay');
        const cartCloseBtn = document.getElementById('cartClose');
        const btnClearCart = document.getElementById('btnClearCart');
        const btnCheckout = document.getElementById('btnCheckout');
        
        // Abrir carrito
        if (btnCarrito) {
            btnCarrito.addEventListener('click', function() {
                abrirCarrito();
            });
        }
        
        // Cerrar carrito
        if (cartCloseBtn) {
            cartCloseBtn.addEventListener('click', cerrarCarrito);
        }
        
        if (cartOverlay) {
            cartOverlay.addEventListener('click', cerrarCarrito);
        }
        
        // Vaciar carrito
        if (btnClearCart) {
            btnClearCart.addEventListener('click', function() {
                vaciarCarrito();
            });
        }
        
        // Checkout - DESACTIVADO para usar nuestro sistema
        // if (btnCheckout) {
        //     btnCheckout.addEventListener('click', function() {
        //         procesarCheckout();
        //     });
        // }
        
        // Event listener para todos los botones "Pedir Ya"
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-pedir') || e.target.closest('.modal-btn-pedir')) {
                e.preventDefault();
                const productCard = e.target.closest('.product-card') || 
                                  document.querySelector('.modal-overlay.active');
                if (productCard) {
                    agregarAlCarrito(productCard);
                }
            }
        });
    }
    
    // Cargar carrito desde localStorage
    function cargarCarrito() {
        const savedCart = localStorage.getItem('carritoCompras');
        if (savedCart) {
            try {
                carritoData = JSON.parse(savedCart);
                
                // Validar que sea un array válido
                if (!Array.isArray(carritoData)) {
                    console.warn('Datos del carrito corruptos, limpiando...');
                    carritoData = [];
                    localStorage.removeItem('carritoCompras');
                }
            } catch (error) {
                console.error('Error al cargar carrito:', error);
                carritoData = [];
                localStorage.removeItem('carritoCompras');
            }
        } else {
            carritoData = [];
        }
    }
    
    // Guardar carrito en localStorage
    function guardarCarrito() {
        localStorage.setItem('carritoCompras', JSON.stringify(carritoData));
        actualizarVistaCarrito();
        actualizarBadgeCarrito();
    }
    
    // Agregar producto al carrito
    function agregarAlCarrito(source) {
        let producto;
        
        // Si viene del modal
        if (source.classList && source.classList.contains('modal-overlay')) {
            producto = {
                id: Date.now().toString(),
                nombre: document.getElementById('modalName').textContent,
                precio: parseFloat(document.getElementById('modalPrice').textContent.replace('USD ', '').replace(',', '')),
                imagen: document.getElementById('modalImage').src,
                cantidad: 1
            };
        } else {
            // Si viene de la tarjeta
            const card = source.closest('.product-card') || source;
            producto = {
                id: Date.now().toString(),
                nombre: card.querySelector('.product-name').textContent,
                precio: parseFloat(card.querySelector('.price-current').textContent.replace('USD ', '').replace(',', '')),
                imagen: card.querySelector('.product-image').src,
                cantidad: 1
            };
        }
        
        // Verificar si el producto ya existe en el carrito
        const productoExistente = carritoData.find(item => 
            item.nombre === producto.nombre && item.precio === producto.precio
        );
        
        if (productoExistente) {
            productoExistente.cantidad++;
        } else {
            carritoData.push(producto);
        }
        
        guardarCarrito();
        mostrarNotificacion('Producto añadido al carrito');
        animarIconoCarrito();
        
        // Cerrar modal si está abierto
        const modal = document.getElementById('modalOverlay');
        if (modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Abrir carrito
    function abrirCarrito() {
        const cartModal = document.getElementById('cartModal');
        const cartOverlay = document.getElementById('cartOverlay');
        
        cargarCarrito();
        actualizarVistaCarrito();
        
        cartModal.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Cerrar carrito
    function cerrarCarrito() {
        const cartModal = document.getElementById('cartModal');
        const cartOverlay = document.getElementById('cartOverlay');
        
        cartModal.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Actualizar vista del carrito
    function actualizarVistaCarrito() {
        // Usar DOM Cache para elementos frecuentemente accedidos
        const cartItemsContainer = window.DOMCache ? window.DOMCache.get('cartItems') : document.getElementById('cartItems');
        const cartEmpty = window.DOMCache ? window.DOMCache.get('cartEmpty') : document.getElementById('cartEmpty');
        const cartFooter = document.querySelector('.cart-footer');
        const cartSubtotal = window.DOMCache ? window.DOMCache.get('cartSubtotal') : document.getElementById('cartSubtotal');
        const cartTotal = window.DOMCache ? window.DOMCache.get('cartTotal') : document.getElementById('cartTotal');
        
        if (carritoData.length === 0) {
            cartItemsContainer.style.display = 'none';
            cartEmpty.style.display = 'flex';
            cartFooter.style.display = 'none';
        } else {
            cartItemsContainer.style.display = 'block';
            cartEmpty.style.display = 'none';
            cartFooter.style.display = 'block';
            
            // B3.1 - DocumentFragment para optimización
            const fragment = document.createDocumentFragment();
            let subtotal = 0;
            
            carritoData.forEach((item, index) => {
                // Validar que el item tenga las propiedades necesarias
                if (!item || 
                    typeof item.precio !== 'number' || 
                    item.precio === null || 
                    item.precio === undefined ||
                    typeof item.cantidad !== 'number' || 
                    item.cantidad <= 0) {
                    console.warn('Item inválido en el carrito:', item);
                    return;
                }
                
                const itemTotal = item.precio * item.cantidad;
                subtotal += itemTotal;
                
                const itemHTML = `
                    <div class="cart-item" data-index="${index}">
                        <img src="${item.imagen || 'img/placeholder.svg'}" alt="${item.nombre}" class="cart-item-image">
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.nombre || 'Producto'}</div>
                            <div class="cart-item-price">USD ${(item.precio || 0).toFixed(2)}</div>
                            <div class="cart-item-controls">
                                <button class="cart-item-quantity-btn" onclick="carritoModule.decrementarCantidad(${index})">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="cart-item-quantity">${item.cantidad}</span>
                                <button class="cart-item-quantity-btn" onclick="carritoModule.incrementarCantidad(${index})">
                                    <i class="fas fa-plus"></i>
                                </button>
                                <button class="cart-item-remove" onclick="carritoModule.eliminarItem(${index})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                // Crear elemento temporal para agregar al fragment
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = itemHTML;
                fragment.appendChild(tempDiv.firstElementChild);
            });
            
            // Limpiar contenedor y agregar todos los items de una vez
            cartItemsContainer.innerHTML = '';
            cartItemsContainer.appendChild(fragment);
            
            // Actualizar totales
            cartSubtotal.textContent = `USD ${subtotal.toFixed(2)}`;
            cartTotal.textContent = `USD ${subtotal.toFixed(2)}`;
        }
    }
    
    // Incrementar cantidad
    function incrementarCantidad(index) {
        if (carritoData[index]) {
            carritoData[index].cantidad++;
            guardarCarrito();
        }
    }
    
    // Decrementar cantidad
    function decrementarCantidad(index) {
        if (carritoData[index]) {
            if (carritoData[index].cantidad > 1) {
                carritoData[index].cantidad--;
                guardarCarrito();
            } else {
                eliminarItem(index);
            }
        }
    }
    
    // Eliminar item
    function eliminarItem(index) {
        carritoData.splice(index, 1);
        guardarCarrito();
        mostrarNotificacion('Producto eliminado', 'info');
    }
    
    // Vaciar carrito
    function vaciarCarrito() {
        carritoData = [];
        guardarCarrito();
        mostrarNotificacion('Carrito vaciado', 'info');
    }
    
    // Actualizar badge del carrito
    function actualizarBadgeCarrito() {
        let badge = document.getElementById('cartBadge');
        
        // Validar que carritoData sea un array válido
        if (!Array.isArray(carritoData)) {
            console.warn('carritoData no es un array válido:', carritoData);
            carritoData = [];
        }
        
        const totalItems = carritoData.reduce((sum, item) => {
            // Validar que el item tenga cantidad válida y precio válido
            if (!item || 
                typeof item.cantidad !== 'number' || 
                item.cantidad <= 0 ||
                typeof item.precio !== 'number' || 
                item.precio === null || 
                item.precio === undefined) {
                return sum;
            }
            return sum + item.cantidad;
        }, 0);
        
        console.log('Total items en carrito:', totalItems, 'Datos:', carritoData);
        
        if (totalItems > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.id = 'cartBadge';
                badge.className = 'cart-badge';
                const btnCarrito = document.getElementById('btnCarrito');
                if (btnCarrito) {
                    btnCarrito.style.position = 'relative';
                    btnCarrito.appendChild(badge);
                }
            }
            badge.textContent = totalItems > 99 ? '99+' : totalItems;
        } else {
            if (badge) {
                badge.remove();
            }
        }
    }
    
    // Animar icono del carrito
    function animarIconoCarrito() {
        const btnCarrito = document.getElementById('btnCarrito');
        btnCarrito.classList.add('cart-animate');
        setTimeout(() => {
            btnCarrito.classList.remove('cart-animate');
        }, 400);
    }
    
    // Procesar checkout
    function procesarCheckout() {
        if (carritoData.length === 0) {
            mostrarNotificacion('El carrito está vacío', 'warning');
            return;
        }
        
        console.log('🛒 CHECKOUT INICIADO - Datos del carrito:', carritoData);
        
        // Convertir datos del carrito al formato de nuestro modal
        cartItems = carritoData.map(item => ({
            id: item.id, // ✅ Preservar el ID del producto
            name: item.nombre,
            price: item.precio,
            quantity: item.cantidad
        }));
        
        console.log('🔄 Datos convertidos para modal:', cartItems);
        
        // Abrir modal de confirmación
        if (typeof openConfirmModal === 'function') {
            openConfirmModal();
        } else {
            console.log('❌ openConfirmModal no está disponible');
            mostrarNotificacion('Error: Modal no disponible', 'error');
        }
    }
    
    // Mostrar notificación toast
    function mostrarNotificacion(mensaje, tipo = 'success') {
        // Definir colores según tipo
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
        
        // Crear notificación toast
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
        
        // Animar entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
        
        // Animar salida
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Función para limpiar carrito corrupto
    function limpiarCarritoCorrupto() {
        console.log('Limpiando carrito corrupto...');
        carritoData = [];
        localStorage.removeItem('carritoCompras');
        actualizarBadgeCarrito();
        actualizarVistaCarrito();
    }

    // Función para filtrar items válidos
    function filtrarItemsValidos() {
        const itemsValidos = carritoData.filter(item => {
            return item && 
                   typeof item.precio === 'number' && 
                   item.precio !== null && 
                   item.precio !== undefined &&
                   item.precio > 0 &&
                   typeof item.cantidad === 'number' && 
                   item.cantidad > 0;
        });
        
        if (itemsValidos.length !== carritoData.length) {
            console.log('Filtrando items inválidos:', carritoData.length - itemsValidos.length, 'items removidos');
            carritoData = itemsValidos;
            guardarCarrito();
        }
    }

    // Función para cargar productos de prueba (solo para testing)
    function cargarProductosPrueba() {
        console.log('🛒 Cargando productos de prueba...');
        
        const productosPrueba = [
            {
                id: 'test-1',
                nombre: 'Refrigeradora Samsung 300L',
                precio: 450.00,
                cantidad: 1,
                imagen: 'img/placeholder.svg',
                categoria: 'Electrodomésticos'
            },
            {
                id: 'test-2', 
                nombre: 'Lavadora LG 15kg',
                precio: 380.50,
                cantidad: 2,
                imagen: 'img/placeholder.svg',
                categoria: 'Electrodomésticos'
            },
            {
                id: 'test-3',
                nombre: 'Televisor Smart 55"',
                precio: 650.75,
                cantidad: 1,
                imagen: 'img/placeholder.svg',
                categoria: 'Electrodomésticos'
            }
        ];
        
        // Agregar productos de prueba al carrito
        productosPrueba.forEach(producto => {
            const itemExistente = carritoData.find(item => item.id === producto.id);
            if (!itemExistente) {
                carritoData.push(producto);
            }
        });
        
        guardarCarrito();
        console.log('✅ Productos de prueba cargados:', carritoData.length, 'items');
    }

    // Exportar funciones
    window.carritoModule = {
        agregarAlCarrito,
        incrementarCantidad,
        decrementarCantidad,
        eliminarItem,
        vaciarCarrito,
        abrirCarrito,
        cerrarCarrito,
        limpiarCarritoCorrupto,
        filtrarItemsValidos,
        cargarProductosPrueba
    };
    
    // Hacer la función de prueba disponible globalmente
    window.cargarProductosPrueba = cargarProductosPrueba;
    
})();

