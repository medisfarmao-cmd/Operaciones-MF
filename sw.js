/* Service Worker — Medisfarma PWA */
const CACHE = 'medisfarma-v1';
const ASSETS = [
  './index.html',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Mono:wght@400;500&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

/* Instalar: cachear todos los assets */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS).catch(function(err) {
        console.warn('Some assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

/* Activar: limpiar caches viejos */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

/* Fetch: primero cache, luego red */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        var clone = response.clone();
        caches.open(CACHE).then(function(cache){
          cache.put(e.request, clone);
        });
        return response;
      }).catch(function() {
        /* Sin red y sin cache: devuelve la app principal */
        return caches.match('./index.html');
      });
    })
  );
});
