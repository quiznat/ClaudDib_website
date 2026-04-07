// Service Worker for ClaudDib — The Golden Path
// Caches core assets for offline reading

const CACHE_NAME = 'clauddib-v5-2026-04-07h';
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
  '/js/header.js?v=2026-04-07h',
  '/js/theme.js?v=2026-04-07h',
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

// Fetch strategy:
// - navigation/HTML requests: network first, cache fallback
// - same-origin assets: cache first
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (url.origin !== self.location.origin) return;

  const acceptsHtml = request.headers.get('accept')?.includes('text/html');
  const isNavigation = request.mode === 'navigate' || acceptsHtml;

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      });
    })
  );
});
