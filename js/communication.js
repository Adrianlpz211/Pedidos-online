/* ===================================
   SISTEMA DE COMUNICACIÓN UNIFICADO
   Mejora A2 - Comunicación entre ventanas
   =================================== */

(function() {
    'use strict';
    
    console.log('🔗 Sistema de Comunicación Unificado cargado');
    
    class WindowCommunication {
        constructor() {
            this.channelName = 'pedidos-system';
            this.channel = null;
            this.messageId = 0;
            this.pendingMessages = new Map();
            this.retryAttempts = 3;
            this.retryDelay = 1000;
            
            this.init();
        }
        
        init() {
            try {
                // Intentar crear BroadcastChannel
                this.channel = new BroadcastChannel(this.channelName);
                this.setupChannelListeners();
                console.log('✅ BroadcastChannel inicializado');
            } catch (error) {
                console.log('⚠️ BroadcastChannel no disponible, usando fallbacks');
                this.channel = null;
            }
            
            // Configurar fallbacks
            this.setupFallbacks();
        }
        
        setupChannelListeners() {
            if (!this.channel) return;
            
            this.channel.addEventListener('message', (event) => {
                this.handleMessage(event.data, 'broadcast');
            });
        }
        
        setupFallbacks() {
            // Fallback 1: postMessage
            window.addEventListener('message', (event) => {
                // Validar origen para seguridad
                if (this.isValidOrigin(event.origin)) {
                    this.handleMessage(event.data, 'postmessage');
                }
            });
            
            // Fallback 2: localStorage
            window.addEventListener('storage', (event) => {
                if (event.key === 'pedidos-communication') {
                    try {
                        const data = JSON.parse(event.newValue);
                        this.handleMessage(data, 'localstorage');
                    } catch (error) {
                        console.error('Error parsing localStorage message:', error);
                    }
                }
            });
        }
        
        isValidOrigin(origin) {
            // Permitir localhost y file:// para desarrollo
            const allowedOrigins = [
                'http://localhost',
                'http://127.0.0.1',
                'file://',
                window.location.origin
            ];
            
            return allowedOrigins.some(allowed => origin.startsWith(allowed));
        }
        
        handleMessage(data, source) {
            if (!data || !data.type) return;
            
            console.log(`📨 Mensaje recibido via ${source}:`, data);
            
            // Procesar mensaje según tipo
            switch (data.type) {
                case 'toggleVisibility':
                    this.processToggleVisibility(data);
                    break;
                case 'toggleCartButtons':
                    this.processToggleCartButtons(data);
                    break;
                case 'updateLogo':
                    this.processUpdateLogo(data);
                    break;
                case 'updateHeroPromociones':
                    this.processUpdateHeroPromociones(data);
                    break;
                case 'dashboardPedidosUpdate':
                    this.processDashboardPedidosUpdate(data);
                    break;
                case 'communication_ack':
                    this.handleAcknowledgment(data);
                    break;
                default:
                    console.log('Tipo de mensaje no reconocido:', data.type);
            }
        }
        
        processToggleVisibility(data) {
            const { icon, mostrar, timestamp } = data;
            
            if (icon === 'cart') {
                const btnCarrito = document.getElementById('btnCarrito');
                if (btnCarrito) {
                    btnCarrito.style.display = mostrar ? 'block' : 'none';
                    btnCarrito.style.transition = 'opacity 0.2s ease';
                }
            } else if (icon === 'pedidos') {
                const btnPedidos = document.querySelector('[data-module="pedidos"]');
                if (btnPedidos) {
                    btnPedidos.style.display = mostrar ? 'flex' : 'none';
                    btnPedidos.style.transition = 'opacity 0.2s ease';
                }
            }
            
            console.log(`Toggle ${icon}: ${mostrar ? 'ON' : 'OFF'} - ${timestamp}`);
        }
        
        processToggleCartButtons(data) {
            const { mostrar } = data;
            
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
        
        processUpdateLogo(data) {
            const { logoData } = data;
            
            if (logoData && logoData.logoType) {
                // Aplicar configuración de logo
                if (window.aplicarConfiguracionLogo) {
                    window.aplicarConfiguracionLogo(logoData);
                }
            }
        }
        
        processUpdateHeroPromociones(data) {
            const { config } = data;
            
            if (config && window.actualizarHeroPromociones) {
                window.actualizarHeroPromociones(config);
            }
        }
        
        processDashboardPedidosUpdate(data) {
            if (data.type === 'newOrder' && window.loadPedidos) {
                window.loadPedidos();
            }
        }
        
        handleAcknowledgment(data) {
            const { messageId } = data;
            if (this.pendingMessages.has(messageId)) {
                const resolve = this.pendingMessages.get(messageId);
                resolve();
                this.pendingMessages.delete(messageId);
            }
        }
        
        // Método principal para enviar mensajes
        sendMessage(type, data, options = {}) {
            const message = {
                type,
                data,
                messageId: ++this.messageId,
                timestamp: Date.now(),
                source: 'pedidos-system'
            };
            
            console.log('📤 Enviando mensaje:', message);
            
            // Intentar métodos en orden de preferencia
            const methods = [
                () => this.sendViaBroadcastChannel(message),
                () => this.sendViaPostMessage(message),
                () => this.sendViaLocalStorage(message)
            ];
            
            for (const method of methods) {
                try {
                    if (method()) {
                        console.log('✅ Mensaje enviado exitosamente');
                        return Promise.resolve();
                    }
                } catch (error) {
                    console.log('⚠️ Método falló, intentando siguiente:', error.message);
                }
            }
            
            console.error('❌ Todos los métodos de envío fallaron');
            return Promise.reject(new Error('No se pudo enviar mensaje'));
        }
        
        sendViaBroadcastChannel(message) {
            if (!this.channel) return false;
            
            this.channel.postMessage(message);
            return true;
        }
        
        sendViaPostMessage(message) {
            if (!window.opener || window.opener.closed) return false;
            
            window.opener.postMessage(message, '*');
            return true;
        }
        
        sendViaLocalStorage(message) {
            try {
                localStorage.setItem('pedidos-communication', JSON.stringify(message));
                // Limpiar después de un tiempo para evitar acumulación
                setTimeout(() => {
                    localStorage.removeItem('pedidos-communication');
                }, 5000);
                return true;
            } catch (error) {
                return false;
            }
        }
        
        // Método para enviar con confirmación
        sendMessageWithAck(type, data, timeout = 5000) {
            return new Promise((resolve, reject) => {
                const messageId = ++this.messageId;
                const message = {
                    type,
                    data,
                    messageId,
                    timestamp: Date.now(),
                    source: 'pedidos-system',
                    requiresAck: true
                };
                
                // Configurar timeout
                const timeoutId = setTimeout(() => {
                    this.pendingMessages.delete(messageId);
                    reject(new Error('Timeout esperando confirmación'));
                }, timeout);
                
                // Guardar resolver
                this.pendingMessages.set(messageId, () => {
                    clearTimeout(timeoutId);
                    resolve();
                });
                
                // Enviar mensaje
                this.sendMessage(type, data);
            });
        }
    }
    
    // Inicializar sistema de comunicación
    window.WindowCommunication = new WindowCommunication();
    
    // Exponer métodos útiles globalmente
    window.sendToDashboard = (type, data) => {
        return window.WindowCommunication.sendMessage(type, data);
    };
    
    window.sendToDashboardWithAck = (type, data, timeout) => {
        return window.WindowCommunication.sendMessageWithAck(type, data, timeout);
    };
    
    console.log('✅ Sistema de Comunicación Unificado inicializado');
    
})();
