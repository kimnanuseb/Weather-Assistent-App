const CACHE_NAME = 'weather-assistant-v1';
const ASSETS = [
  './',
  './index.html',
  './index.tsx',
  './style.css',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  // Simple cache-first strategy for static assets, network-first for API
  if (e.request.url.includes('api.openweathermap.org')) {
    e.respondWith(fetch(e.request));
  } else {
    e.respondWith(
      caches.match(e.request).then((response) => response || fetch(e.request))
    );
  }
});