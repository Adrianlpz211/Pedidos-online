// Script de prueba para forzar la carga de productos

console.log('🚀 INICIANDO PRUEBA DE CARGA DE PRODUCTOS');

// PASO 1: Crear un producto de prueba
const productoPrueba = {
    id: 3001,
    name: "Producto de Prueba",
    description: "Este es un producto de prueba para verificar la carga",
    regularPrice: 100,
    offerPrice: 90,
    stock: 5,
    status: "active",
    featured: false,
    image: "img/placeholder.svg",
    brand: "PRUEBA",
    categories: [1],
    subcategories: [1],
    credito: {
        habilitado: true,
        cuotas: 2
    }
};

console.log('📦 Producto de prueba creado:', productoPrueba);

// PASO 2: Guardar en localStorage
let productos = JSON.parse(localStorage.getItem('productos') || '[]');
productos.push(productoPrueba);
localStorage.setItem('productos', JSON.stringify(productos));

console.log('💾 Producto guardado en localStorage');
console.log('📊 Total productos en localStorage:', productos.length);

// PASO 3: Verificar que se guardó correctamente
const productosVerificacion = JSON.parse(localStorage.getItem('productos') || '[]');
console.log('✅ Verificación - Productos en localStorage:', productosVerificacion.length);

// PASO 4: Forzar la carga de productos dinámicos
console.log('🔄 Forzando carga de productos dinámicos...');

// Verificar si la función existe
if (typeof loadDynamicProducts === 'function') {
    console.log('✅ Función loadDynamicProducts encontrada');
    loadDynamicProducts();
} else {
    console.error('❌ Función loadDynamicProducts NO encontrada');
}

// PASO 5: Verificar el contenedor de productos
const productosGrid = document.getElementById('productsGrid');
if (productosGrid) {
    console.log('✅ Contenedor de productos encontrado');
    console.log('📋 Número de productos en el DOM:', productosGrid.children.length);
    
    // Verificar si hay productos con nuestro ID
    const productoEncontrado = productosGrid.querySelector('[data-product="3001"]');
    if (productoEncontrado) {
        console.log('✅ Producto de prueba encontrado en el DOM');
    } else {
        console.log('❌ Producto de prueba NO encontrado en el DOM');
        console.log('📋 HTML del contenedor:', productosGrid.innerHTML.substring(0, 500));
    }
} else {
    console.error('❌ Contenedor de productos NO encontrado');
}

// PASO 6: Disparar evento de sincronización
console.log('🔄 Disparando evento de sincronización...');
window.dispatchEvent(new StorageEvent('storage', {
    key: 'productos',
    newValue: JSON.stringify(productos),
    url: window.location.href
}));

console.log('🎉 PRUEBA COMPLETADA');
console.log('📋 INSTRUCCIONES:');
console.log('1. Verifica la consola para ver los logs');
console.log('2. Verifica si aparece el producto "Producto de Prueba" en el index');
console.log('3. Verifica si tiene el badge "Crédito"');
console.log('4. Si no aparece, revisa si hay errores en la consola');
