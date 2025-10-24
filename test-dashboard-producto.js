// Script de prueba para crear un producto con crédito desde el dashboard

// Crear producto de prueba con crédito
const productoCredito = {
    id: 1001,
    name: "Laptop Gaming Pro",
    description: "Laptop para gaming con tarjeta gráfica dedicada",
    regularPrice: 1200,
    offerPrice: 1000,
    stock: 5,
    status: "active",
    featured: true,
    image: "img/placeholder.svg",
    brand: "TECHNO",
    categories: [1], // Electrodomésticos
    subcategories: [1], // Cocina (aunque sea laptop, usamos la categoría existente)
    credito: {
        habilitado: true,
        cuotas: 4
    }
};

// Obtener productos existentes
let productos = JSON.parse(localStorage.getItem('productos') || '[]');

// Agregar producto de prueba
const existingIndex = productos.findIndex(p => p.id === 1001);
if (existingIndex !== -1) {
    productos[existingIndex] = productoCredito;
} else {
    productos.push(productoCredito);
}

// Guardar productos
localStorage.setItem('productos', JSON.stringify(productos));

console.log('✅ Producto de crédito creado desde dashboard:', productoCredito);
console.log('✅ Total productos en localStorage:', productos.length);

// Disparar evento de storage para sincronizar con index
window.dispatchEvent(new StorageEvent('storage', {
    key: 'productos',
    newValue: JSON.stringify(productos),
    url: window.location.href
}));

console.log('✅ Evento de sincronización disparado');
