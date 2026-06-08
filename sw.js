// Service Worker for CasFlou PWA
// Provides offline support and caching

const CACHE_NAME = 'casflou-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/queue.html',
  '/dashboard.html',
  '/settings.html',
  '/css/main.css',
  '/js/config.js',
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

// Fetch event - simple cache-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // API requests: network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).then((response) => {
        // Cache successful responses
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone).catch((err) => {
              console.warn('Cache put failed:', err);
            });
          });
        }
        return response;
      }).catch(async (err) => {
        console.warn('API fetch failed:', url.pathname, err);
        // Try cached version
        const cached = await caches.match(request).catch(() => null);
        if (cached) return cached;

        // Return error response
        throw err;
      })
    );
    return;
  }

  // Static assets and pages: cache first, network fallback
  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) {
        return cached;
      }

      try {
        const response = await fetch(request);

        if (!response || !response.ok) {
          return response;
        }

        // Cache successful responses
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, clone).catch((err) => {
            console.warn('Cache put failed:', err);
          });
        });

        return response;
      } catch (err) {
        console.warn('Fetch failed:', request.url, err);

        // Navigation requests: fallback to login
        if (request.mode === 'navigate') {
          const login = await caches.match('/login.html').catch(() => null);
          if (login) return login;
        }

        // For API errors, let it fail
        throw err;
      }
    })
  );
});
