// Service Worker for CasFlou PWA
// Provides offline support and caching

const CACHE_NAME = 'casflou-v2';
const STATIC_ASSETS = [
  '/',
  '/login.html',
  '/queue.html',
  '/css/main.css',
  '/js/auth.js',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache assets individually to avoid failing on redirects
      return Promise.all(
        STATIC_ASSETS.map((url) =>
          fetch(url)
            .then((response) => {
              // Only cache successful, non-redirect responses
              if (response.ok && response.status < 300) {
                return cache.put(url, response);
              }
            })
            .catch(() => {})
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache first for static, network first for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and external URLs
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // API requests: network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request, { redirect: 'follow' })
        .then((response) => {
          // Only cache successful, non-redirect responses
          if (response.ok && response.status < 300) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if offline
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets: cache first
  event.respondWith(
    caches.match(request).then((response) => {
      // Skip cached redirects, always fetch fresh
      if (response && response.status < 300) {
        return response;
      }

      return fetch(request, { redirect: 'follow' })
        .then((response) => {
          // Only cache successful, non-redirect responses
          if (response.ok && response.status < 300) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return login page on offline navigation
          if (request.mode === 'navigate') {
            return caches.match('/login.html');
          }
        });
    })
  );
});
