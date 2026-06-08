// Minimal Service Worker - Just pass-through for now
// Avoid complex caching that causes redirect loops

self.addEventListener('install', (event) => {
  console.log('SW: Installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW: Activating');
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Just pass through - let network handle everything
  // Don't intercept, don't cache, don't try to be smart
  return;
});
