// Script de prueba para generar productos con crédito y pedidos de prueba

// Crear producto de prueba con crédito
const productoCredito = {
    id: 999,
    name: "Producto de Prueba Crédito",
    description: "Producto para probar el sistema de cuotas",
    regularPrice: 300,
    offerPrice: 300,
    stock: 10,
    status: "active",
    featured: false,
    image: "img/placeholder.svg",
    categories: [1],
    subcategories: [1],
    credito: {
        habilitado: true,
        cuotas: 3
    }
};

// Obtener productos existentes
let productos = JSON.parse(localStorage.getItem('productos') || '[]');

// Agregar producto de prueba
const existingIndex = productos.findIndex(p => p.id === 999);
if (existingIndex !== -1) {
    productos[existingIndex] = productoCredito;
} else {
    productos.push(productoCredito);
}

// Guardar productos
localStorage.setItem('productos', JSON.stringify(productos));

// Crear pedido de prueba con cuotas
const pedidoCredito = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    items: [
        {
            id: 999,
            name: "Producto de Prueba Crédito",
            price: 300,
            quantity: 1
        }
    ],
    subtotal: 300,
    delivery: false,
    deliveryCost: 0,
    total: 300,
    address: null,
    status: 'por-pagar',
    createdAt: new Date().toISOString(),
    modalidadPago: 'credito',
    cuotas: [
        {
            numero: 1,
            monto: 100,
            fecha: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            pagado: false,
            fechaPago: null
        },
        {
            numero: 2,
            monto: 100,
            fecha: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            pagado: false,
            fechaPago: null
        },
        {
            numero: 3,
            monto: 100,
            fecha: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            pagado: false,
            fechaPago: null
        }
    ]
};

// Obtener pedidos existentes
let pedidos = JSON.parse(localStorage.getItem('userOrders') || '[]');

// Agregar pedido de prueba
pedidos.push(pedidoCredito);

// Guardar pedidos
localStorage.setItem('userOrders', JSON.stringify(pedidos));

console.log('✅ Producto de crédito creado:', productoCredito);
console.log('✅ Pedido de crédito creado:', pedidoCredito);
console.log('✅ Datos guardados en localStorage');

// Actualizar badges de crédito en el frontend
if (typeof window.updateProductCreditoBadges === 'function') {
    window.updateProductCreditoBadges();
    console.log('✅ Badges de crédito actualizados');
}
