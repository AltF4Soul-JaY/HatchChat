const CACHE_NAME = 'hatchchat-v1';
const ASSETS = [
  '/',
  'index.html',
  'styles/style.css',
  'scripts/main.js',
  'assets/icons/favicon-192.png',
  'assets/icons/favicon-512.png',
  'assets/images/HatchChatBG.jpg',
  // add more assets you want cached for offline
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
