// Debug simple para identificar el problema

console.log('🔍 DEBUG SIMPLE - IDENTIFICAR PROBLEMA');

// 1. Verificar pedido con cuotas
const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
const pedidoConCuotas = pedidos.find(p => p.modalidadPago === 'credito' && p.cuotas);

if (pedidoConCuotas) {
    console.log('✅ Pedido con cuotas encontrado:', pedidoConCuotas.numero);
    console.log('🔍 modalidadPago:', pedidoConCuotas.modalidadPago);
    console.log('🔍 cuotas:', pedidoConCuotas.cuotas.length);
    
    // 2. Probar createOriginalModalHTML directamente
    if (typeof createOriginalModalHTML === 'function') {
        const modalHTML = createOriginalModalHTML(pedidoConCuotas);
        console.log('📋 HTML generado:', modalHTML.length);
        console.log('🔍 Contiene cuotas:', modalHTML.includes('cuotas-gestion-compacta'));
        
        // Mostrar la parte de cuotas
        const cuotasMatch = modalHTML.match(/<div class="detalle-section">[\s\S]*?<h4>Gestión de Cuotas<\/h4>[\s\S]*?<\/div>/);
        if (cuotasMatch) {
            console.log('✅ Sección de cuotas encontrada en HTML');
            console.log('📄 Contenido:', cuotasMatch[0].substring(0, 200) + '...');
        } else {
            console.log('❌ Sección de cuotas NO encontrada en HTML');
        }
    } else {
        console.log('❌ createOriginalModalHTML no disponible');
    }
    
    // 3. Probar verDetallePedido
    console.log('🧪 Probando verDetallePedido...');
    verDetallePedido(pedidoConCuotas.id);
    
    // 4. Verificar modal después de 1 segundo
    setTimeout(() => {
        const modal = document.querySelector('.modal.show');
        if (modal) {
            console.log('✅ Modal encontrado');
            const modalBody = modal.querySelector('.modal-body');
            if (modalBody) {
                console.log('✅ Modal body encontrado');
                console.log('📏 Contenido del modal:', modalBody.innerHTML.length);
                console.log('🔍 Contiene cuotas:', modalBody.innerHTML.includes('cuotas-gestion-compacta'));
                
                if (!modalBody.innerHTML.includes('cuotas-gestion-compacta')) {
                    console.log('❌ PROBLEMA: Modal no contiene sección de cuotas');
                    console.log('🔍 Buscando "cuotas" en general:', modalBody.innerHTML.includes('cuotas'));
                    console.log('🔍 Buscando "credito" en general:', modalBody.innerHTML.includes('credito'));
                }
            } else {
                console.log('❌ Modal body no encontrado');
            }
        } else {
            console.log('❌ Modal no encontrado');
        }
    }, 1000);
} else {
    console.log('❌ No hay pedido con cuotas');
}

console.log('🎉 DEBUG COMPLETADO');

