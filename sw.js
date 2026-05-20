const CACHE_NAME = 'winchinka-assets-v3';

// 캐싱할 파일 확장자들냥
const ASSET_EXTENSIONS = [
  '.dds', '.png', '.mp4', '.mp3', '.pdf', '.jpg', '.jpeg', '.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 같은 도메인의 정적 에셋 요청인지 확인냥
  const isStaticAsset = ASSET_EXTENSIONS.some(ext => url.pathname.endsWith(ext));
  
  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            // 캐시된 데이터가 있으면 반환냥
            return response;
          }
          
          // 캐시에 없으면 네트워크에서 가져와서 저장냥 (정상일때만)
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
  }
});
