// Service Worker for ClaudDib — The Golden Path
// Caches core assets for offline reading

const CACHE_NAME = 'clauddib-v3-2026-03-22';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/works.html',
  '/postcards.html',
  '/desert-log.html',
  '/now.html',
  '/404.html',
  '/research.html',
  '/css/style.css',
  '/css/pillar-redesign.css',
  '/css/print.css',
  '/css/design-tokens.css',
  '/css/components.css',
  '/js/header.js',
  '/js/theme.js',
  '/js/desert-oracle.js',
  '/images/avatar.png',
  '/favicon.png',
  '/manifest.json'
];

// Install: cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for same-origin, network-first for others
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Same-origin: cache first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          // Cache new same-origin responses
          if (response.ok && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        });
      }).catch(() => {
        // Fallback for navigation requests when offline
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
    );
  }

  // External: network only (don't cache Google Fonts, etc.)
});
