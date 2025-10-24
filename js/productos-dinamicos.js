/**
 * PRODUCTOS DINÁMICOS
 * Sistema de Catálogo Multi-Negocio MVP
 */

class ProductosDinamicos {
    constructor() {
        this.productsGrid = document.getElementById('productsGrid');
        this.currentProducts = [];
        this.currentFilters = {
            categoria: null,
            subcategoria: null,
            search: null
        };
    }

    /**
     * CARGAR PRODUCTOS DESDE API
     */
    async cargarProductos(filters = {}) {
        try {
            this.mostrarLoading();
            
            const response = await api.getProductos(filters);
            this.currentProducts = response.productos || [];
            
            this.renderizarProductos();
            this.registrarMetricas();
            
        } catch (error) {
            console.error('Error al cargar productos:', error);
            this.mostrarError('Error al cargar productos');
        }
    }

    /**
     * MOSTRAR LOADING
     */
    mostrarLoading() {
        this.productsGrid.innerHTML = `
            <div class="loading-products">
                <div class="loading-spinner"></div>
                <p>Cargando productos...</p>
            </div>
        `;
    }

    /**
     * MOSTRAR ERROR
     */
    mostrarError(mensaje) {
        this.productsGrid.innerHTML = `
            <div class="error-products">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${mensaje}</p>
                <button class="btn-retry" onclick="productosDinamicos.cargarProductos()">
                    Reintentar
                </button>
            </div>
        `;
    }

    /**
     * RENDERIZAR PRODUCTOS
     */
    renderizarProductos() {
        if (this.currentProducts.length === 0) {
            this.productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open"></i>
                    <p>No se encontraron productos</p>
                </div>
            `;
            return;
        }

        const productosHTML = this.currentProducts.map(producto => this.crearProductoHTML(producto)).join('');
        this.productsGrid.innerHTML = productosHTML;

        // Re-inicializar event listeners
        this.inicializarEventListeners();
    }

    /**
     * CREAR HTML DE PRODUCTO
     */
    crearProductoHTML(producto) {
        const precioOferta = producto.precio_oferta && producto.precio_oferta > 0;
        const descuento = precioOferta ? 
            Math.round(((producto.precio_regular - producto.precio_oferta) / producto.precio_regular) * 100) : 0;
        
        const imagen = producto.imagen_principal || 'img/placeholder.svg';
        const precioActual = precioOferta ? producto.precio_oferta : producto.precio_regular;
        const precioAnterior = precioOferta ? producto.precio_regular : null;
        
        // Verificar que los precios sean números válidos
        const precioActualNum = parseFloat(precioActual) || 0;
        const precioAnteriorNum = precioAnterior ? parseFloat(precioAnterior) : null;

        return `
            <div class="product-card" data-product-id="${producto.id}">
                <div class="product-image-container" data-product="${producto.id}">
                    ${descuento > 0 ? `<span class="discount-badge">-${descuento}%</span>` : ''}
                    <img src="${imagen}" alt="${producto.nombre}" class="product-image" 
                         onerror="this.src='img/placeholder.svg'">
                </div>
                
                <div class="product-info">
                    <div class="product-brand">${producto.marca || 'DAMASCO'}</div>
                    
                    <div class="product-rating">
                        ${this.generarEstrellas(producto.rating || 4)}
                    </div>
                    
                    <h3 class="product-name">${producto.nombre}</h3>
                    <p class="product-description">${producto.descripcion || 'Descripción no disponible'}</p>
                    
                    <div class="product-price-container">
                        <div class="price-info">
                            <span class="price-current">$${precioActualNum.toFixed(2)}</span>
                            ${precioAnteriorNum ? `<span class="price-old">$${precioAnteriorNum.toFixed(2)}</span>` : ''}
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
    }

    /**
     * GENERAR ESTRELLAS DE RATING
     */
    generarEstrellas(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                html += '<i class="fas fa-star star-active"></i>';
            } else if (i - 0.5 <= rating) {
                html += '<i class="fas fa-star-half-alt star-active"></i>';
            } else {
                html += '<i class="far fa-star"></i>';
            }
        }
        return html;
    }

    /**
     * INICIALIZAR EVENT LISTENERS
     */
    inicializarEventListeners() {
        // Botones de like
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleLike(e));
        });

        // Botones de pedir
        document.querySelectorAll('.btn-pedir').forEach(btn => {
            btn.addEventListener('click', (e) => this.handlePedir(e));
        });

        // Botones de WhatsApp
        document.querySelectorAll('.btn-whatsapp').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleWhatsApp(e));
        });

        // Imágenes para quick preview
        document.querySelectorAll('.product-image-container').forEach(container => {
            container.addEventListener('click', (e) => this.handleQuickPreview(e));
        });
    }

    /**
     * MANEJAR LIKE
     */
    async handleLike(e) {
        e.preventDefault();
        const productId = e.currentTarget.getAttribute('data-product');
        
        if (!api.isAuthenticated()) {
            mostrarNotificacion('Debes iniciar sesión para dar like', 'warning');
            return;
        }

        try {
            const response = await api.toggleFavorito(productId);
            
            if (response.success) {
                const btn = e.currentTarget;
                const icon = btn.querySelector('i');
                const count = btn.querySelector('.like-count');
                
                if (response.is_favorito) {
                    icon.className = 'fas fa-heart';
                    btn.classList.add('liked');
                } else {
                    icon.className = 'far fa-heart';
                    btn.classList.remove('liked');
                }
                
                // Actualizar contador
                const currentCount = parseInt(count.textContent) || 0;
                count.textContent = response.is_favorito ? currentCount + 1 : Math.max(0, currentCount - 1);
                
                // Animación
                btn.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                }, 200);
            }
        } catch (error) {
            console.error('Error al manejar like:', error);
            mostrarNotificacion('Error al actualizar favorito', 'error');
        }
    }

    /**
     * MANEJAR PEDIR
     */
    handlePedir(e) {
        e.preventDefault();
        const productId = e.currentTarget.getAttribute('data-product');
        
        // Aquí se implementaría la lógica del carrito
        mostrarNotificacion('Producto agregado al carrito', 'success');
    }

    /**
     * MANEJAR WHATSAPP
     */
    handleWhatsApp(e) {
        e.preventDefault();
        const productId = e.currentTarget.getAttribute('data-product');
        const producto = this.currentProducts.find(p => p.id == productId);
        
        if (producto) {
            const message = `Hola! Me interesa ${producto.nombre}`;
            const whatsappUrl = getWhatsAppLink(message, productId);
            
            if (whatsappUrl !== '#') {
                window.open(whatsappUrl, '_blank');
            } else {
                mostrarNotificacion('Número de WhatsApp no configurado', 'warning');
            }
        }
    }

    /**
     * MANEJAR QUICK PREVIEW
     */
    handleQuickPreview(e) {
        e.preventDefault();
        const productId = e.currentTarget.getAttribute('data-product');
        const producto = this.currentProducts.find(p => p.id == productId);
        
        if (producto) {
            this.mostrarQuickPreview(producto);
        }
    }

    /**
     * MOSTRAR QUICK PREVIEW
     */
    mostrarQuickPreview(producto) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay quick-preview-modal';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Vista Rápida</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="quick-preview-content">
                        <div class="quick-preview-image">
                            <img src="${producto.imagen_principal || 'img/placeholder.svg'}" 
                                 alt="${producto.nombre}" onerror="this.src='img/placeholder.svg'">
                        </div>
                        <div class="quick-preview-info">
                            <h4 id="modalName">${producto.nombre}</h4>
                            <p id="modalDescription">${producto.descripcion || 'Descripción no disponible'}</p>
                            <div class="quick-preview-price">
                                <span class="price-current">$${producto.precio_regular.toFixed(2)}</span>
                                ${producto.precio_oferta && producto.precio_oferta > 0 ? 
                                    `<span class="price-old">$${producto.precio_oferta.toFixed(2)}</span>` : ''}
                            </div>
                            <div class="quick-preview-actions">
                                <button class="btn-pedir modal-btn-pedir" data-product="${producto.id}">
                                    <i class="fas fa-shopping-bag"></i>
                                    Pedir Ya
                                </button>
                                <button class="btn-whatsapp modal-btn-whatsapp" data-product="${producto.id}">
                                    <i class="fab fa-whatsapp"></i>
                                    WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners para el modal
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // Event listeners para botones del modal
        modal.querySelector('.modal-btn-pedir').addEventListener('click', (e) => this.handlePedir(e));
        modal.querySelector('.modal-btn-whatsapp').addEventListener('click', (e) => this.handleWhatsApp(e));
    }

    /**
     * REGISTRAR MÉTRICAS
     */
    async registrarMetricas() {
        if (!api.isAuthenticated()) return;
        
        try {
            // Registrar vista de página de productos
            await api.registrarVista(null, null, 'productos');
        } catch (error) {
            console.error('Error al registrar métricas:', error);
        }
    }

    /**
     * FILTRAR POR CATEGORÍA
     */
    async filtrarPorCategoria(categoriaId) {
        this.currentFilters.categoria = categoriaId;
        this.currentFilters.subcategoria = null;
        await this.cargarProductos(this.currentFilters);
    }

    /**
     * FILTRAR POR SUBCATEGORÍA
     */
    async filtrarPorSubcategoria(subcategoriaId) {
        this.currentFilters.subcategoria = subcategoriaId;
        await this.cargarProductos(this.currentFilters);
    }

    /**
     * BUSCAR PRODUCTOS
     */
    async buscarProductos(termino) {
        this.currentFilters.search = termino;
        await this.cargarProductos(this.currentFilters);
    }

    /**
     * CARGAR FAVORITOS
     */
    async cargarFavoritos() {
        try {
            this.mostrarLoading();
            
            const response = await api.getFavoritos();
            this.currentProducts = response.favoritos || [];
            
            this.renderizarProductos();
            
        } catch (error) {
            console.error('Error al cargar favoritos:', error);
            this.mostrarError('Error al cargar favoritos');
        }
    }
}

// Instancia global
window.productosDinamicos = new ProductosDinamicos();
