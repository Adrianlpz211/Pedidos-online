/* ===================================
   SISTEMA DE DEVOLUCIONES - JAVASCRIPT
   =================================== */

(function() {
    'use strict';
    
    console.log('Sistema de Devoluciones cargado');
    
    // Variables del sistema de devoluciones
    let devolucionesConfig = {
        habilitado: true,
        motivosDisponibles: [
            { value: 'defectuoso', label: 'Producto Defectuoso' },
            { value: 'no_satisfecho', label: 'No me gustó' },
            { value: 'error_talla', label: 'Error de Talla/Modelo' },
            { value: 'otro', label: 'Otro' }
        ],
        whatsappNumber: '+573001234567' // Número de WhatsApp del negocio
    };
    
    // ===================================
    // FUNCIONES DE DEVOLUCIONES
    // ===================================
    
    function crearSolicitudDevolucion(pedidoId, productoId, motivo, descripcion) {
        const solicitud = {
            id: 'DEV-' + Date.now(),
            pedidoId: pedidoId,
            productoId: productoId,
            motivo: motivo,
            descripcion: descripcion,
            estado: 'pendiente',
            fechaSolicitud: new Date().toISOString(),
            fechaResolucion: null,
            administrador: null
        };
        
        // Guardar en localStorage
        const devoluciones = JSON.parse(localStorage.getItem('devoluciones') || '[]');
        devoluciones.push(solicitud);
        localStorage.setItem('devoluciones', JSON.stringify(devoluciones));
        
        return solicitud;
    }
    
    function procesarDevolucion(devolucionId, accion, administrador) {
        const devoluciones = JSON.parse(localStorage.getItem('devoluciones') || '[]');
        const devolucion = devoluciones.find(d => d.id === devolucionId);
        
        if (!devolucion) return false;
        
        devolucion.estado = accion; // 'aprobada' o 'rechazada'
        devolucion.fechaResolucion = new Date().toISOString();
        devolucion.administrador = administrador;
        
        localStorage.setItem('devoluciones', JSON.stringify(devoluciones));
        
        // Si se aprueba, actualizar el pedido
        if (accion === 'aprobada') {
            actualizarPedidoDevuelto(devolucion.pedidoId);
            restaurarStock(devolucion.productoId, devolucion.cantidad || 1);
        }
        
        return true;
    }
    
    function actualizarPedidoDevuelto(pedidoId) {
        const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
        const pedido = pedidos.find(p => p.id == pedidoId);
        
        if (pedido) {
            pedido.estado = 'devuelto';
            pedido.fechaModificacion = new Date().toISOString();
            localStorage.setItem('pedidos', JSON.stringify(pedidos));
        }
    }
    
    function restaurarStock(productoId, cantidad) {
        const productos = JSON.parse(localStorage.getItem('productos') || '[]');
        const producto = productos.find(p => p.id == productoId);
        
        if (producto) {
            producto.stock = (producto.stock || 0) + cantidad;
            producto.lastUpdate = new Date().toISOString();
            localStorage.setItem('productos', JSON.stringify(productos));
        }
    }
    
    function obtenerDevoluciones(estado = null) {
        const devoluciones = JSON.parse(localStorage.getItem('devoluciones') || '[]');
        
        if (estado) {
            return devoluciones.filter(d => d.estado === estado);
        }
        
        return devoluciones;
    }
    
    function obtenerDevolucionesPendientes() {
        return obtenerDevoluciones('pendiente');
    }
    
    // ===================================
    // FUNCIONES DE UI
    // ===================================
    
    function crearModalSolicitudDevolucion(pedidoId, productoId) {
        const motivos = devolucionesConfig.motivosDisponibles.map(motivo => 
            `<option value="${motivo.value}">${motivo.label}</option>`
        ).join('');
        
        return `
            <div class="devolucion-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-undo"></i> Solicitar Devolución</h3>
                    <button class="btn-close" onclick="cerrarModalDevolucion()">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="form-group">
                        <label>Motivo de la Devolución</label>
                        <select id="motivoDevolucion" class="form-control">
                            <option value="">Selecciona un motivo</option>
                            ${motivos}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Descripción Adicional</label>
                        <textarea id="descripcionDevolucion" class="form-control" 
                                  placeholder="Describe el problema o razón de la devolución..."></textarea>
                    </div>
                    
                    <div class="devolucion-info">
                        <p><strong>Pedido:</strong> #${pedidoId}</p>
                        <p><strong>Producto:</strong> ${obtenerNombreProducto(productoId)}</p>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="cerrarModalDevolucion()">
                        Cancelar
                    </button>
                    <button class="btn btn-danger" onclick="enviarSolicitudDevolucion('${pedidoId}', '${productoId}')">
                        <i class="fas fa-paper-plane"></i>
                        Enviar por WhatsApp
                    </button>
                </div>
            </div>
        `;
    }
    
    function crearCardDevolucion(devolucion) {
        const estadoClass = devolucion.estado;
        const estadoIcon = {
            'pendiente': 'fas fa-clock',
            'aprobada': 'fas fa-check-circle',
            'rechazada': 'fas fa-times-circle'
        }[devolucion.estado] || 'fas fa-question-circle';
        
        const fechaSolicitud = new Date(devolucion.fechaSolicitud).toLocaleDateString('es-ES');
        
        return `
            <div class="devolucion-card ${estadoClass}">
                <div class="devolucion-header">
                    <h4>${devolucion.id}</h4>
                    <span class="estado-badge ${estadoClass}">
                        <i class="${estadoIcon}"></i>
                        ${devolucion.estado.charAt(0).toUpperCase() + devolucion.estado.slice(1)}
                    </span>
                </div>
                
                <div class="devolucion-info">
                    <p><strong>Pedido:</strong> #${devolucion.pedidoId}</p>
                    <p><strong>Producto:</strong> ${obtenerNombreProducto(devolucion.productoId)}</p>
                    <p><strong>Motivo:</strong> ${obtenerMotivoLabel(devolucion.motivo)}</p>
                    <p><strong>Fecha:</strong> ${fechaSolicitud}</p>
                    ${devolucion.descripcion ? `<p><strong>Descripción:</strong> ${devolucion.descripcion}</p>` : ''}
                </div>
                
                ${devolucion.estado === 'pendiente' ? `
                    <div class="devolucion-actions">
                        <button class="btn btn-success" onclick="aprobarDevolucion('${devolucion.id}')">
                            <i class="fas fa-check"></i>
                            Aprobar
                        </button>
                        <button class="btn btn-danger" onclick="rechazarDevolucion('${devolucion.id}')">
                            <i class="fas fa-times"></i>
                            Rechazar
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    function obtenerNombreProducto(productoId) {
        const productos = JSON.parse(localStorage.getItem('productos') || '[]');
        const producto = productos.find(p => p.id == productoId);
        return producto ? producto.name : 'Producto no encontrado';
    }
    
    function obtenerMotivoLabel(motivo) {
        const motivoObj = devolucionesConfig.motivosDisponibles.find(m => m.value === motivo);
        return motivoObj ? motivoObj.label : motivo;
    }
    
    function generarMensajeWhatsApp(devolucion) {
        const mensaje = `Hola, solicito una devolución para mi pedido #${devolucion.pedidoId}

Motivo: ${obtenerMotivoLabel(devolucion.motivo)}
${devolucion.descripcion ? `Descripción: ${devolucion.descripcion}` : ''}

Gracias.`;
        
        return encodeURIComponent(mensaje);
    }
    
    // ===================================
    // FUNCIONES GLOBALES
    // ===================================
    
    window.DevolucionesSystem = {
        crearSolicitudDevolucion,
        procesarDevolucion,
        obtenerDevoluciones,
        obtenerDevolucionesPendientes,
        crearModalSolicitudDevolucion,
        crearCardDevolucion,
        generarMensajeWhatsApp,
        config: devolucionesConfig
    };
    
    // Exponer funciones individuales para compatibilidad
    window.crearSolicitudDevolucion = crearSolicitudDevolucion;
    window.procesarDevolucion = procesarDevolucion;
    window.crearModalSolicitudDevolucion = crearModalSolicitudDevolucion;
    window.cerrarModalDevolucion = function() {
        const modal = document.getElementById('devolucionModal');
        if (modal) modal.remove();
    };
    
    window.enviarSolicitudDevolucion = function(pedidoId, productoId) {
        const motivo = document.getElementById('motivoDevolucion').value;
        const descripcion = document.getElementById('descripcionDevolucion').value;
        
        if (!motivo) {
            alert('Por favor selecciona un motivo para la devolución');
            return;
        }
        
        const solicitud = crearSolicitudDevolucion(pedidoId, productoId, motivo, descripcion);
        const mensaje = generarMensajeWhatsApp(solicitud);
        const whatsappUrl = `https://wa.me/${devolucionesConfig.whatsappNumber}?text=${mensaje}`;
        
        window.open(whatsappUrl, '_blank');
        cerrarModalDevolucion();
        
        showToast('Solicitud de devolución enviada por WhatsApp', 'success');
    };
    
    window.solicitarDevolucion = function(pedidoId, productoId) {
        const modalHTML = crearModalSolicitudDevolucion(pedidoId, productoId);
        
        // Crear modal
        const modal = document.createElement('div');
        modal.id = 'devolucionModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = modalHTML;
        
        document.body.appendChild(modal);
    };
    
    window.aprobarDevolucion = function(devolucionId) {
        if (confirm('¿Estás seguro de aprobar esta devolución?')) {
            procesarDevolucion(devolucionId, 'aprobada', 'Administrador');
            showToast('Devolución aprobada', 'success');
            // Recargar vista si es necesario
            if (typeof loadDevoluciones === 'function') {
                loadDevoluciones();
            }
        }
    };
    
    window.rechazarDevolucion = function(devolucionId) {
        if (confirm('¿Estás seguro de rechazar esta devolución?')) {
            procesarDevolucion(devolucionId, 'rechazada', 'Administrador');
            showToast('Devolución rechazada', 'warning');
            // Recargar vista si es necesario
            if (typeof loadDevoluciones === 'function') {
                loadDevoluciones();
            }
        }
    };
    
    console.log('✅ Sistema de Devoluciones inicializado correctamente');
    
})();
