// Script de debug para verificar productos en localStorage

console.log('🔍 DIAGNÓSTICO DE PRODUCTOS');

// Verificar productos en localStorage
const productos = JSON.parse(localStorage.getItem('productos') || '[]');
console.log('📦 Productos en localStorage:', productos);
console.log('📊 Cantidad de productos:', productos.length);

// Verificar si hay productos con crédito
const productosCredito = productos.filter(p => p.credito && p.credito.habilitado);
console.log('💳 Productos con crédito:', productosCredito);

// Verificar el contenedor de productos en el index
const productosGrid = document.getElementById('productsGrid');
console.log('🎯 Contenedor de productos encontrado:', !!productosGrid);
if (productosGrid) {
    console.log('📋 Productos en el DOM:', productosGrid.children.length);
    console.log('📋 HTML del contenedor:', productosGrid.innerHTML.substring(0, 200) + '...');
}

// Verificar si la función loadDynamicProducts existe
console.log('🔧 Función loadDynamicProducts existe:', typeof loadDynamicProducts === 'function');

// Verificar si hay errores en la consola
console.log('❌ Verifica si hay errores en la consola del navegador');
