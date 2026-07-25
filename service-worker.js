const CACHE_NAME = "kintai-cache-v3";

const FILES_TO_CACHE = [
  "/kintai-app/",
  "/kintai-app/index.html",
  "/kintai-app/style.css",
  "/kintai-app/app.js",
  "/kintai-app/monthly.html",
  "/kintai-app/monthly.js",
  "/kintai-app/manifest.json",
  "/kintai-app/icon-192.png",
  "/kintai-app/icon-512.png"
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
