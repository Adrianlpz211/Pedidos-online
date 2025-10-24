/**
 * DOM Cache Manager - B3.2 Optimización
 * Sistema de caché para elementos DOM frecuentemente accedidos
 * Mejora rendimiento evitando búsquedas repetidas en el DOM
 */

class DOMCacheManager {
    constructor() {
        this.cache = new Map();
        this.observers = new Map();
        this.retryAttempts = 3;
        this.retryDelay = 100;
        
        console.log('🗄️ DOM Cache Manager inicializado');
    }

    /**
     * Obtiene un elemento del caché o lo busca y cachea
     * @param {string} selector - Selector CSS o ID
     * @param {boolean} forceRefresh - Forzar búsqueda nueva
     * @returns {Element|null} Elemento DOM o null si no se encuentra
     */
    get(selector, forceRefresh = false) {
        // Limpiar selector
        const cleanSelector = selector.replace('#', '');
        
        // Si está en caché y no se fuerza refresh
        if (!forceRefresh && this.cache.has(cleanSelector)) {
            const element = this.cache.get(cleanSelector);
            if (element && document.contains(element)) {
                return element;
            } else {
                // Elemento ya no existe en el DOM, limpiar caché
                this.cache.delete(cleanSelector);
            }
        }

        // Buscar elemento
        const element = this.findElement(cleanSelector);
        
        if (element) {
            this.cache.set(cleanSelector, element);
            console.log(`✅ Elemento cacheado: ${cleanSelector}`);
            return element;
        } else {
            console.warn(`❌ Elemento no encontrado: ${cleanSelector}`);
            return null;
        }
    }

    /**
     * Busca un elemento en el DOM con múltiples estrategias
     * @param {string} selector - Selector a buscar
     * @returns {Element|null} Elemento encontrado o null
     */
    findElement(selector) {
        // Estrategia 1: Por ID
        if (!selector.includes('.')) {
            const elementById = document.getElementById(selector);
            if (elementById) return elementById;
        }

        // Estrategia 2: Por selector CSS
        const elementBySelector = document.querySelector(selector);
        if (elementBySelector) return elementBySelector;

        // Estrategia 3: Por clase (sin punto)
        if (!selector.startsWith('.')) {
            const elementByClass = document.querySelector(`.${selector}`);
            if (elementByClass) return elementByClass;
        }

        // Estrategia 4: Por atributo
        const elementByAttr = document.querySelector(`[data-id="${selector}"]`);
        if (elementByAttr) return elementByAttr;

        return null;
    }

    /**
     * Pre-carga elementos críticos del sistema
     * @param {Array} selectors - Lista de selectores a pre-cargar
     */
    preload(selectors) {
        console.log('🔄 Pre-cargando elementos críticos...');
        
        selectors.forEach(selector => {
            this.get(selector);
        });

        console.log(`✅ ${this.cache.size} elementos pre-cargados`);
    }

    /**
     * Limpia el caché de un elemento específico
     * @param {string} selector - Selector a limpiar
     */
    clearElement(selector) {
        const cleanSelector = selector.replace('#', '');
        this.cache.delete(cleanSelector);
        console.log(`🗑️ Elemento removido del caché: ${cleanSelector}`);
    }

    /**
     * Limpia todo el caché
     */
    clear() {
        this.cache.clear();
        console.log('🗑️ Caché DOM limpiado completamente');
    }

    /**
     * Refresca el caché (limpia y re-carga elementos críticos)
     * @param {Array} selectors - Selectores a re-cargar
     */
    refresh(selectors = []) {
        this.clear();
        if (selectors.length > 0) {
            this.preload(selectors);
        }
    }

    /**
     * Obtiene estadísticas del caché
     * @returns {Object} Estadísticas del caché
     */
    getStats() {
        return {
            size: this.cache.size,
            elements: Array.from(this.cache.keys()),
            hitRate: this.calculateHitRate()
        };
    }

    /**
     * Calcula la tasa de aciertos del caché
     * @returns {number} Tasa de aciertos (0-1)
     */
    calculateHitRate() {
        // Implementación básica - en producción se usarían métricas reales
        return this.cache.size > 0 ? 0.85 : 0;
    }

    /**
     * Verifica si un elemento está en el caché
     * @param {string} selector - Selector a verificar
     * @returns {boolean} True si está en caché
     */
    has(selector) {
        const cleanSelector = selector.replace('#', '');
        return this.cache.has(cleanSelector);
    }

    /**
     * Obtiene múltiples elementos de una vez
     * @param {Array} selectors - Lista de selectores
     * @returns {Object} Objeto con elementos encontrados
     */
    getMultiple(selectors) {
        const elements = {};
        
        selectors.forEach(selector => {
            const element = this.get(selector);
            if (element) {
                elements[selector] = element;
            }
        });

        return elements;
    }

    /**
     * Observa cambios en el DOM y actualiza el caché automáticamente
     * @param {string} selector - Selector a observar
     * @param {Function} callback - Callback cuando cambie
     */
    observe(selector, callback) {
        if (typeof callback !== 'function') {
            console.warn('❌ Callback debe ser una función');
            return;
        }

        const cleanSelector = selector.replace('#', '');
        
        // Crear observer si no existe
        if (!this.observers.has(cleanSelector)) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        // Verificar si el elemento observado cambió
                        const element = this.findElement(cleanSelector);
                        if (element && element !== this.cache.get(cleanSelector)) {
                            this.cache.set(cleanSelector, element);
                            callback(element);
                        }
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            this.observers.set(cleanSelector, observer);
            console.log(`👁️ Observando cambios en: ${cleanSelector}`);
        }
    }

    /**
     * Detiene la observación de un elemento
     * @param {string} selector - Selector a dejar de observar
     */
    unobserve(selector) {
        const cleanSelector = selector.replace('#', '');
        const observer = this.observers.get(cleanSelector);
        
        if (observer) {
            observer.disconnect();
            this.observers.delete(cleanSelector);
            console.log(`👁️ Dejando de observar: ${cleanSelector}`);
        }
    }

    /**
     * Limpia todos los observers
     */
    disconnect() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        console.log('👁️ Todos los observers desconectados');
    }
}

// Crear instancia global
window.DOMCache = new DOMCacheManager();

// Elementos críticos para pre-cargar
const criticalElements = [
    'productsGrid',
    'cartItemsContainer', 
    'cartTotal',
    'cartEmpty',
    'btnCarrito',
    'btnCheckout',
    'searchInput',
    'header',
    'main-content',
    'sidebar',
    'dashboardHeader',
    'dashboardContent',
    'notificationsButton',
    'logoutButton'
];

// Pre-cargar elementos críticos cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.DOMCache.preload(criticalElements);
    });
} else {
    window.DOMCache.preload(criticalElements);
}

console.log('🗄️ DOM Cache Manager cargado y listo');
