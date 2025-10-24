/* Script de utilidades para depuración */

// Función para limpiar localStorage
function limpiarDatos() {
    localStorage.removeItem('productLikes');
    localStorage.removeItem('carritoCompras');
    console.log('✓ Datos limpiados. Recarga la página.');
    window.location.reload();
}

// Función para ver datos guardados
function verDatos() {
    console.log('=== DATOS GUARDADOS ===');
    console.log('Likes:', JSON.parse(localStorage.getItem('productLikes') || '{}'));
    console.log('Carrito:', JSON.parse(localStorage.getItem('carritoCompras') || '[]'));
}

// Exportar para uso en consola
window.debug = {
    limpiar: limpiarDatos,
    ver: verDatos
};

console.log('Debug tools cargadas. Usa: debug.limpiar() o debug.ver()');

