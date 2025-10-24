/* ===================================
   SISTEMA DE CUOTAS - JAVASCRIPT
   =================================== */

(function() {
    'use strict';
    
    console.log('Sistema de Cuotas cargado');
    
    // Variables del sistema de cuotas
    let cuotasConfig = {
        habilitado: true,
        cuotasDisponibles: [2, 3, 6, 12],
        interesPorDefecto: 0
    };
    
    // ===================================
    // FUNCIONES DE CUOTAS
    // ===================================
    
    function calcularCuotas(monto, numeroCuotas) {
        const cuotaMensual = monto / numeroCuotas;
        const cuotas = [];
        const fechaActual = new Date();
        
        for (let i = 0; i < numeroCuotas; i++) {
            const fechaCuota = new Date(fechaActual);
            fechaCuota.setMonth(fechaCuota.getMonth() + i);
            
            cuotas.push({
                numero: i + 1,
                monto: cuotaMensual,
                fecha: fechaCuota.toISOString().split('T')[0],
                pagado: false,
                fechaPago: null
            });
        }
        
        return cuotas;
    }
    
    function agregarCuotasAPedido(pedido, numeroCuotas) {
        if (!cuotasConfig.habilitado) return pedido;
        
        const total = pedido.total || 0;
        const cuotas = calcularCuotas(total, numeroCuotas);
        
        pedido.modalidadPago = 'credito';
        pedido.cuotas = cuotas;
        pedido.totalCuotas = numeroCuotas;
        pedido.cuotaActual = 1;
        pedido.fechaCreacion = new Date().toISOString();
        
        return pedido;
    }
    
    function marcarCuotaComoPagada(pedidoId, numeroCuota) {
        const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
        const pedido = pedidos.find(p => p.id == pedidoId);
        
        if (!pedido || !pedido.cuotas) return false;
        
        const cuota = pedido.cuotas.find(c => c.numero == numeroCuota);
        if (cuota) {
            cuota.pagado = true;
            cuota.fechaPago = new Date().toISOString();
            
            // Actualizar cuota actual
            const cuotasPagadas = pedido.cuotas.filter(c => c.pagado).length;
            pedido.cuotaActual = cuotasPagadas + 1;
            
            // Si todas las cuotas están pagadas, marcar pedido como pagado
            if (cuotasPagadas === pedido.totalCuotas) {
                pedido.estado = 'pagado';
            }
            
            localStorage.setItem('pedidos', JSON.stringify(pedidos));
            return true;
        }
        
        return false;
    }
    
    function obtenerPedidosConCuotas() {
        const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
        return pedidos.filter(p => p.modalidadPago === 'credito' && p.cuotas);
    }
    
    function obtenerCuotasPendientes() {
        const pedidosConCuotas = obtenerPedidosConCuotas();
        const cuotasPendientes = [];
        
        pedidosConCuotas.forEach(pedido => {
            pedido.cuotas.forEach(cuota => {
                if (!cuota.pagado) {
                    cuotasPendientes.push({
                        pedidoId: pedido.id,
                        numeroPedido: pedido.numero,
                        cuota: cuota,
                        cliente: pedido.cliente || 'Cliente'
                    });
                }
            });
        });
        
        return cuotasPendientes;
    }
    
    // ===================================
    // FUNCIONES DE UI
    // ===================================
    
    function crearIndicadorCuotas(numeroCuotas) {
        return `
            <div class="cuotas-badge">
                <i class="fas fa-credit-card"></i>
                <span>${numeroCuotas} Cuotas</span>
            </div>
        `;
    }
    
    function crearInfoCuotas(monto, numeroCuotas) {
        const cuotaMensual = monto / numeroCuotas;
        return `
            <div class="cuotas-info">
                <span class="cuota-precio">$${cuotaMensual.toLocaleString()}/cuota</span>
                <span class="cuota-texto">${numeroCuotas} cuotas sin interés</span>
            </div>
        `;
    }
    
    function crearProgresoCuotas(pedido) {
        if (!pedido.cuotas) return '';
        
        const cuotasPagadas = pedido.cuotas.filter(c => c.pagado).length;
        const porcentaje = (cuotasPagadas / pedido.totalCuotas) * 100;
        
        return `
            <div class="cuotas-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${porcentaje}%"></div>
                </div>
                <span class="progress-text">${cuotasPagadas} de ${pedido.totalCuotas} cuotas pagadas</span>
            </div>
        `;
    }
    
    function crearDetalleCuotas(pedido) {
        if (!pedido.cuotas) return '';
        
        let html = '<div class="cuotas-detalle">';
        
        pedido.cuotas.forEach(cuota => {
            const estadoClass = cuota.pagado ? 'pagada' : 'pendiente';
            const icono = cuota.pagado ? 'fas fa-check-circle' : 'fas fa-clock';
            const fecha = new Date(cuota.fecha).toLocaleDateString('es-ES');
            
            html += `
                <div class="cuota-item ${estadoClass}">
                    <i class="${icono}"></i>
                    <span>Cuota ${cuota.numero} - $${cuota.monto.toLocaleString()}</span>
                    <span class="fecha">${fecha}</span>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    // ===================================
    // FUNCIONES GLOBALES
    // ===================================
    
    window.CuotasSystem = {
        calcularCuotas,
        agregarCuotasAPedido,
        marcarCuotaComoPagada,
        obtenerPedidosConCuotas,
        obtenerCuotasPendientes,
        crearIndicadorCuotas,
        crearInfoCuotas,
        crearProgresoCuotas,
        crearDetalleCuotas,
        config: cuotasConfig
    };
    
    // Exponer funciones individuales para compatibilidad
    window.calcularCuotas = calcularCuotas;
    window.agregarCuotasAPedido = agregarCuotasAPedido;
    window.marcarCuotaComoPagada = marcarCuotaComoPagada;
    
    console.log('✅ Sistema de Cuotas inicializado correctamente');
    
})();
