// Self-destructing service worker — clears all caches, unregisters, and reloads

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(cacheNames.map((name) => caches.delete(name)))
    ).then(() => self.clients.claim())
     .then(() => self.clients.matchAll({ type: 'window' }))
     .then((clients) =>
       Promise.all(clients.map((client) => client.navigate(client.url)))
     ).then(() => self.registration.unregister())
  );
});

// Pass through all fetches to network (no caching)
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
