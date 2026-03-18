const CACHE_NAME = 'winchinka-assets-v1';

// 캐싱할 파일 확장자들냥
const ASSET_EXTENSIONS = [
  '.dds', '.png', '.mp4', '.mp3', '.pdf', '.jpg', '.jpeg', '.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
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
          
          // 캐시에 없으면 네트워크에서 가져와서 저장냥
          return fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  }
});
