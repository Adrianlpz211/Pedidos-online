/* ===================================
   GENERADOR DE IDs UNIFICADO
   Mejora A3 - Estandarizar IDs y datos
   =================================== */

(function() {
    'use strict';
    
    console.log('🔑 Generador de IDs Unificado cargado');
    
    class IDGenerator {
        constructor() {
            this.counters = {
                product: 0,
                category: 0,
                subcategory: 0,
                order: 0,
                user: 0,
                client: 0,
                movement: 0,
                location: 0
            };
            
            this.initializeCounters();
        }
        
        initializeCounters() {
            // Inicializar contadores basados en datos existentes
            this.counters.product = this.getMaxId('productos') + 1;
            this.counters.category = this.getMaxId('dashboardCategorias') + 1;
            this.counters.subcategory = this.getMaxId('dashboardSubcategorias') + 1;
            this.counters.order = this.getMaxId('pedidos') + 1;
            this.counters.user = this.getMaxId('dashboardUsers') + 1;
            this.counters.client = this.getMaxId('dashboardClients') + 1;
            this.counters.movement = this.getMaxId('inventoryMovements') + 1;
            this.counters.location = this.getMaxId('inventoryLocations') + 1;
            
            console.log('🔢 Contadores inicializados:', this.counters);
        }
        
        getMaxId(storageKey) {
            try {
                const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
                if (!Array.isArray(data) || data.length === 0) return 0;
                
                const maxId = Math.max(...data.map(item => parseInt(item.id) || 0));
                return isNaN(maxId) ? 0 : maxId;
            } catch (error) {
                console.warn(`Error al obtener max ID de ${storageKey}:`, error);
                return 0;
            }
        }
        
        // Generar ID único para productos
        generateProductId() {
            return ++this.counters.product;
        }
        
        // Generar ID único para categorías
        generateCategoryId() {
            return ++this.counters.category;
        }
        
        // Generar ID único para subcategorías
        generateSubcategoryId() {
            return ++this.counters.subcategory;
        }
        
        // Generar ID único para pedidos
        generateOrderId() {
            return ++this.counters.order;
        }
        
        // Generar ID único para usuarios
        generateUserId() {
            return ++this.counters.user;
        }
        
        // Generar ID único para clientes
        generateClientId() {
            return ++this.counters.client;
        }
        
        // Generar ID único para movimientos de inventario
        generateMovementId() {
            return ++this.counters.movement;
        }
        
        // Generar ID único para ubicaciones
        generateLocationId() {
            return ++this.counters.location;
        }
        
        // Generar UUID v4 (para casos especiales)
        generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        
        // Generar ID con prefijo (para números de pedido, etc.)
        generatePrefixedId(prefix, type = 'order') {
            const id = this[`generate${type.charAt(0).toUpperCase() + type.slice(1)}Id`]();
            return `${prefix}-${String(id).padStart(4, '0')}`;
        }
        
        // Validar ID
        isValidId(id) {
            return id && !isNaN(parseInt(id)) && parseInt(id) > 0;
        }
        
        // Migrar ID antiguo a nuevo formato
        migrateOldId(oldId, type = 'order') {
            if (this.isValidId(oldId)) {
                return parseInt(oldId);
            }
            
            // Si es un ID basado en timestamp, usar el contador
            if (typeof oldId === 'string' && oldId.length > 10) {
                return this[`generate${type.charAt(0).toUpperCase() + type.slice(1)}Id`]();
            }
            
            // Fallback: generar nuevo ID
            return this[`generate${type.charAt(0).toUpperCase() + type.slice(1)}Id`]();
        }
        
        // Obtener estadísticas de IDs
        getStats() {
            return {
                counters: { ...this.counters },
                totalGenerated: Object.values(this.counters).reduce((sum, count) => sum + count, 0)
            };
        }
    }
    
    // Crear instancia global
    window.IDGenerator = new IDGenerator();
    
    // Exponer funciones útiles globalmente
    window.generateId = (type) => {
        const method = `generate${type.charAt(0).toUpperCase() + type.slice(1)}Id`;
        if (window.IDGenerator[method]) {
            return window.IDGenerator[method]();
        }
        throw new Error(`Tipo de ID no soportado: ${type}`);
    };
    
    window.generatePrefixedId = (prefix, type) => {
        return window.IDGenerator.generatePrefixedId(prefix, type);
    };
    
    window.isValidId = (id) => {
        return window.IDGenerator.isValidId(id);
    };
    
    window.migrateOldId = (oldId, type) => {
        return window.IDGenerator.migrateOldId(oldId, type);
    };
    
    console.log('✅ Generador de IDs Unificado inicializado');
    console.log('📊 Estadísticas iniciales:', window.IDGenerator.getStats());
    
})();
