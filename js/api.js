/**
 * API CLIENT
 * Sistema de Catálogo Multi-Negocio MVP
 */

class ApiClient {
    constructor() {
        this.baseUrl = 'http://localhost/pedidos/';
        this.token = localStorage.getItem('auth_token');
    }

    /**
     * CONFIGURAR HEADERS
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    /**
     * REALIZAR PETICIÓN HTTP
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config = {
            method: 'GET',
            headers: this.getHeaders(),
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('Error en API:', error);
            throw error;
        }
    }

    /**
     * AUTENTICACIÓN
     */
    async login(phone, password) {
        return this.request('api/auth/login', {
            method: 'POST',
            body: { phone, password }
        });
    }

    async register(userData) {
        return this.request('api/auth/register', {
            method: 'POST',
            body: userData
        });
    }

    async logout() {
        this.token = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
    }

    /**
     * PRODUCTOS
     */
    async getProductos(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`api/productos?${params}`);
    }

    async getProducto(id) {
        return this.request(`api/productos/${id}`);
    }

    async getProductosDestacados() {
        return this.request('api/productos/destacados');
    }

    async getProductosByCategoria(categoriaId) {
        return this.request(`api/productos/categoria/${categoriaId}`);
    }

    async searchProductos(termino) {
        return this.request(`api/productos/search?q=${encodeURIComponent(termino)}`);
    }

    /**
     * CATEGORÍAS
     */
    async getCategorias() {
        return this.request('api/categorias');
    }

    async getCategoria(id) {
        return this.request(`api/categorias/${id}`);
    }

    async createCategoria(data) {
        return this.request('api/categorias', {
            method: 'POST',
            body: data
        });
    }

    /**
     * SUBCATEGORÍAS
     */
    async getSubcategorias(categoriaId = null) {
        const endpoint = categoriaId ? 
            `api/subcategorias/categoria/${categoriaId}` : 
            'api/subcategorias/activas';
        return this.request(endpoint);
    }

    async createSubcategoria(data) {
        return this.request('api/subcategorias', {
            method: 'POST',
            body: data
        });
    }

    async updateSubcategoria(subcategoriaId, data) {
        return this.request(`api/subcategorias/${subcategoriaId}`, {
            method: 'PUT',
            body: data
        });
    }

    /**
     * RELACIONES CATEGORÍA-SUBCATEGORÍA
     */
    async asignarSubcategoria(categoriaId, subcategoriaId) {
        return this.request('api/relaciones/asignar', {
            method: 'POST',
            body: { categoria_id: categoriaId, subcategoria_id: subcategoriaId }
        });
    }

    async desvincularSubcategoria(categoriaId, subcategoriaId) {
        return this.request('api/relaciones/desvincular', {
            method: 'POST',
            body: { categoria_id: categoriaId, subcategoria_id: subcategoriaId }
        });
    }

    async getSubcategoriasDeCategoria(categoriaId) {
        return this.request(`api/relaciones/subcategorias/${categoriaId}`);
    }

    /**
     * FAVORITOS
     */
    async getFavoritos() {
        return this.request('api/favoritos');
    }

    async toggleFavorito(productoId) {
        return this.request('api/favoritos/toggle', {
            method: 'POST',
            body: { producto_id: productoId }
        });
    }

    async isFavorito(productoId) {
        return this.request(`api/favoritos/is-favorito?producto_id=${productoId}`);
    }

    /**
     * MÉTRICAS
     */
    async registrarLike(productoId) {
        return this.request('api/metricas/like', {
            method: 'POST',
            body: { producto_id: productoId }
        });
    }

    async registrarVista(productoId, tiempoVista = null, pagina = null) {
        return this.request('api/metricas/vista', {
            method: 'POST',
            body: { 
                producto_id: productoId,
                tiempo_vista: tiempoVista,
                pagina: pagina
            }
        });
    }

    async registrarClick(productoId, elemento = null, pagina = null) {
        return this.request('api/metricas/click', {
            method: 'POST',
            body: { 
                producto_id: productoId,
                elemento: elemento,
                pagina: pagina
            }
        });
    }

    async registrarBusqueda(termino, resultados = null) {
        return this.request('api/metricas/busqueda', {
            method: 'POST',
            body: { 
                termino: termino,
                resultados: resultados
            }
        });
    }

    /**
     * CONFIGURACIÓN
     */
    async getConfiguracion() {
        return this.request('api/negocio/1');
    }

    async updateConfiguracion(configData) {
        return this.request('api/negocio/1', {
            method: 'PUT',
            body: configData
        });
    }

    /**
     * PEDIDOS
     */
    async getPedidos() {
        return this.request('api/pedidos');
    }

    async crearPedido(pedidoData) {
        return this.request('api/pedidos', {
            method: 'POST',
            body: pedidoData
        });
    }

    async getPedido(id) {
        return this.request(`api/pedidos/${id}`);
    }

    /**
     * UTILIDADES
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    isAuthenticated() {
        return !!this.token;
    }

    getCurrentUser() {
        const user = localStorage.getItem('current_user');
        return user ? JSON.parse(user) : null;
    }

    setCurrentUser(user) {
        localStorage.setItem('current_user', JSON.stringify(user));
    }
}

// Instancia global
window.api = new ApiClient();
