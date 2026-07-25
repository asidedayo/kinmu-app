const CACHE_NAME = "kintai-cache-v3";  // ← バージョンを変えると確実に更新される

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./monthly.html",
  "./monthly.js",     // ← これが無いと絶対に更新されない
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// インストール（新しいキャッシュを作る）
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting(); // ← 新しいSWを即座に有効化
});

// 有効化（古いキャッシュを削除）
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // ← 古いキャッシュを削除
          }
        })
      );
    })
  );
  self.clients.claim(); // ← 新しいSWを即座に反映
});

// fetch（最新を優先して取得）
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // ネットから取得できたらキャッシュ更新
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, cloned);
        });
        return response;
      })
      .catch(() => {
        // ネットがダメならキャッシュを使う
        return caches.match(event.request);
      })
  );
});
