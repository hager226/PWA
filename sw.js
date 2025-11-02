const CACHE_VERSION = 'v1';
const CACHE_NAME = `our-PWA-${CACHE_VERSION}`;

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/other.html',
  '/below/another.html',
  '/offline.html',
  '/styles/index.css',
  '/styles/other.css',
  '/styles/another.css',
  '/js/main.js',
  '/js/other.js',
  '/js/another.js',
  '/manifest/manifest.webmanifest',
  '/manifest/iti-logo-192.png',
  '/manifest/iti-logo-256.png',
  '/manifest/iti-logo-512.png'
];


self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => k.startsWith('our-PWA-') && k !== CACHE_NAME)
        .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(cached => cached || caches.match('/offline.html'));
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cached => cached || fetch(request))
  );
});
