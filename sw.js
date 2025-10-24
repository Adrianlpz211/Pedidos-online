/* ===================================
   SERVICE WORKER - PWA
   =================================== */

const CACHE_NAME = 'pedidos-pwa-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/dashboard.html',
    '/css/index.css',
    '/css/dashboard.css',
    '/css/productos.css',
    '/css/pedidos.css',
    '/css/cuotas.css',
    '/css/devoluciones.css',
    '/js/index.js',
    '/js/dashboard.js',
    '/js/productos.js',
    '/js/pedidos.js',
    '/js/cuotas.js',
    '/js/devoluciones.js',
    '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', function(event) {
    console.log('Service Worker instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activar Service Worker
self.addEventListener('activate', function(event) {
    console.log('Service Worker activado');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptar requests
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - devolver respuesta
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});