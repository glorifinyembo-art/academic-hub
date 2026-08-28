const CACHE_NAME = 'unidocs-cache-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/custom.css',
  './js/app.js',
  './js/db.js',
  './js/supabase.js',
  './js/pdf-viewer.js',
  './js/data.js',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg'
];

// Installation : Mise en cache des ressources statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Mise en cache des ressources principales pour le mode hors-ligne');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Certains fichiers statiques n\'ont pas pu être pré-mis en cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activation : Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Suppression de l\'ancien cache :', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interception des requêtes réseau : Stratégie Cache-first avec fallback réseau
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignorer les requêtes non GET ou vers chrome-extension
  if (request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // Pour les requêtes d'API Supabase ou dynamiques : Réseau d'abord avec gestion hors-ligne
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ offline: true, message: "Vous êtes actuellement hors-ligne." }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Pour les fichiers de l'application et les PDF : Cache d'abord, puis réseau avec mise en cache dynamique
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // En arrière plan, mettre à jour le cache si connecté
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {/* Hors ligne, ignorer */});
        
        return cachedResponse;
      }

      // Si pas dans le cache, faire la requête réseau
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
          return networkResponse;
        }

        // Mettre en cache la nouvelle ressource (ex: PDF téléchargé, CDN externe)
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Si la ressource est introuvable et hors ligne, renvoyer la page d'accueil si c'est une navigation
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

