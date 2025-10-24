// Script para sincronizar productos existentes del dashboard al index

console.log('🔄 SINCRONIZANDO PRODUCTOS DEL DASHBOARD AL INDEX');

// Obtener productos del dashboard
const productosDashboard = JSON.parse(localStorage.getItem('dashboardProducts') || '[]');
console.log('📦 Productos en dashboard:', productosDashboard.length);

// Obtener productos del index
const productosIndex = JSON.parse(localStorage.getItem('productos') || '[]');
console.log('📦 Productos en index:', productosIndex.length);

// Si hay productos en dashboard pero no en index, sincronizar
if (productosDashboard.length > 0 && productosIndex.length === 0) {
    console.log('🔄 Sincronizando productos del dashboard al index...');
    localStorage.setItem('productos', JSON.stringify(productosDashboard));
    console.log('✅ Productos sincronizados');
} else if (productosDashboard.length > 0 && productosIndex.length > 0) {
    console.log('🔄 Ambos tienen productos, usando los del dashboard...');
    localStorage.setItem('productos', JSON.stringify(productosDashboard));
    console.log('✅ Productos actualizados');
} else {
    console.log('❌ No hay productos en el dashboard para sincronizar');
}

// Verificar resultado
const productosFinales = JSON.parse(localStorage.getItem('productos') || '[]');
console.log('📊 Productos finales en index:', productosFinales.length);

// Forzar recarga en el index
if (typeof loadDynamicProducts === 'function') {
    console.log('🔄 Forzando recarga de productos en el index...');
    loadDynamicProducts();
    console.log('✅ Recarga completada');
} else {
    console.log('❌ Función loadDynamicProducts no encontrada');
}

console.log('🎉 SINCRONIZACIÓN COMPLETADA');
