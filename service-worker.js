const CACHE_NAME = "kintai-cache-v3";

const FILES_TO_CACHE = [
  "/kinmu-app/",
  "/kinmu-app/index.html",
  "/kinmu-app/style.css",
  "/kinmu-app/app.js",
  "/kinmu-app/monthly.html",
  "/kinmu-app/monthly.js",
  "/kinmu-app/manifest.json",
  "/kinmu-app/icon-192.png",
  "/kinmu-app/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, cloned);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
