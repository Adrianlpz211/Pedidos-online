// Script de prueba para el flujo completo de cuotas

console.log('🚀 INICIANDO PRUEBA DE FLUJO COMPLETO DE CUOTAS');

// PASO 1: Crear producto con crédito
const productoCredito = {
    id: 2001,
    name: "Smartphone Premium",
    description: "Smartphone de última generación con cámara profesional",
    regularPrice: 800,
    offerPrice: 750,
    stock: 10,
    status: "active",
    featured: true,
    image: "img/placeholder.svg",
    brand: "MOBILE",
    categories: [1], // Electrodomésticos
    subcategories: [1], // Cocina
    credito: {
        habilitado: true,
        cuotas: 3
    }
};

// Guardar producto
let productos = JSON.parse(localStorage.getItem('productos') || '[]');
productos.push(productoCredito);
localStorage.setItem('productos', JSON.stringify(productos));

console.log('✅ PASO 1: Producto con crédito creado');

// PASO 2: Crear pedido con cuotas
const pedidoCredito = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    items: [
        {
            id: 2001,
            name: "Smartphone Premium",
            price: 750,
            quantity: 1
        }
    ],
    subtotal: 750,
    delivery: false,
    deliveryCost: 0,
    total: 750,
    address: null,
    status: 'por-pagar',
    createdAt: new Date().toISOString(),
    modalidadPago: 'credito',
    cuotas: [
        {
            numero: 1,
            monto: 250,
            fecha: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            pagado: false,
            fechaPago: null
        },
        {
            numero: 2,
            monto: 250,
            fecha: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            pagado: false,
            fechaPago: null
        },
        {
            numero: 3,
            monto: 250,
            fecha: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            pagado: false,
            fechaPago: null
        }
    ]
};

// Guardar pedido
let pedidos = JSON.parse(localStorage.getItem('userOrders') || '[]');
pedidos.push(pedidoCredito);
localStorage.setItem('userOrders', JSON.stringify(pedidos));

console.log('✅ PASO 2: Pedido con cuotas creado');

// PASO 3: Simular pago de primera cuota
pedidoCredito.cuotas[0].pagado = true;
pedidoCredito.cuotas[0].fechaPago = new Date().toISOString();

// Actualizar pedido
const pedidoIndex = pedidos.findIndex(p => p.id === pedidoCredito.id);
if (pedidoIndex !== -1) {
    pedidos[pedidoIndex] = pedidoCredito;
    localStorage.setItem('userOrders', JSON.stringify(pedidos));
}

console.log('✅ PASO 3: Primera cuota pagada');

// PASO 4: Disparar eventos de sincronización
window.dispatchEvent(new StorageEvent('storage', {
    key: 'productos',
    newValue: JSON.stringify(productos),
    url: window.location.href
}));

window.dispatchEvent(new StorageEvent('storage', {
    key: 'userOrders',
    newValue: JSON.stringify(pedidos),
    url: window.location.href
}));

console.log('✅ PASO 4: Eventos de sincronización disparados');

console.log('🎉 FLUJO COMPLETO DE PRUEBA TERMINADO');
console.log('📋 INSTRUCCIONES:');
console.log('1. Ve al index.html y verifica que aparezca el producto "Smartphone Premium"');
console.log('2. Verifica que tenga el badge "Crédito" y la información de cuotas');
console.log('3. Ve al módulo "Pedidos" y verifica que aparezca el pedido con información de cuotas');
console.log('4. Verifica que muestre "1 de 3 cuotas pagadas"');
console.log('5. Ve al dashboard > Pedidos y verifica que aparezca el pedido con gestión de cuotas');
