const CACHE_NAME = "wedding-site-cache-v1";
const STATIC_CACHE = "static-cache-v1";
const API_CACHE = "api-cache-v1";

// Cache these static assets
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/static/js/main.chunk.js",
  "/static/css/main.chunk.css",
  "/manifest.json",
  "/favicon.ico",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName.startsWith("wedding-site-") && cacheName !== CACHE_NAME
            );
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Fetch event - implement cache-first strategy
self.addEventListener("fetch", (event) => {
  // Handle API requests
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            // Return cached response and update cache in background
            fetch(event.request).then((networkResponse) => {
              cache.put(event.request, networkResponse.clone());
            });
            return response;
          }
          return fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else {
    // Handle static assets
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((networkResponse) => {
            return caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
        );
      })
    );
  }
});
