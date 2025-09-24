// キャッシュ名（更新時はバージョン番号を変える）
const CACHE_NAME = "study-materials-v1";

// プリキャッシュする最低限のファイル
const PRECACHE_URLS = [
  "/HOME.html",
  "/styles.css",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// Service Worker のインストール時にプリキャッシュ
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

// fetch イベントでキャッシュ対応
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // キャッシュがあれば返す
      if (response) {
        return response;
      }

      // なければネットワークから取得してキャッシュに保存
      return fetch(event.request).then((resp) => {
        // 失敗したリクエストやブラウザ拡張のリクエストはキャッシュしない
        if (!resp || resp.status !== 200 || resp.type !== "basic") {
          return resp;
        }

        const respClone = resp.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, respClone);
        });
        return resp;
      });
    })
  );
});

// 古いキャッシュを削除（更新時に走る）
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});


