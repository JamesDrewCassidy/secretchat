// sw.js
'use strict';

// Version string: increment to force a service worker update
const APP_VERSION = 'v1.0.0';

// Immediately activate new service worker to prevent stale caches
self.addEventListener('install', event => {
  console.log(`[ServiceWorker ${APP_VERSION}] Installed`);
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log(`[ServiceWorker ${APP_VERSION}] Activated`);
  // Take control of clients immediately
  event.waitUntil(clients.claim());
});

// Minimal fetch handler: network-first approach (or do nothing, letting the browser fetch fresh)
self.addEventListener('fetch', event => {
  // If you'd like custom caching, implement here. For now, pass through to network:
  event.respondWith(fetch(event.request).catch(() => {
    // If offline, could fallback to some offline page.
    // Return a custom offline response or an empty fallback.
    return new Response('Offline – no cached version available.', { status: 503 });
  }));
});
