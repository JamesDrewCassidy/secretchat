'use strict';

const CACHE_NAME = 'secret-chat-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html'
  // Add additional assets (CSS, images, etc.) as needed
];

// Install event: cache the app shell assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(err => console.error('Error caching assets', err))
  );
  self.skipWaiting();
});

// Activate event: remove old caches and take control immediately
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: network-first strategy with cache fallback and dynamic updating
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Optional: Push event listener for notifications (if you add push support later)
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Received.');
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  const title = data.title || 'Secret Chat Notification';
  const options = {
    body: data.body || 'You have a new message.',
    icon: data.icon || '/icon.png'
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
