self.addEventListener('push', (event) => {
    const data = event.data.json();
    self.registration.showNotification(data.title, data.options);
    async function chainPromise() {
      await self.registration.showNotification(data.title, data.options);
    }
   
    event.waitUntil(chainPromise());
  });
  
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
});

const CACHE_NAME = 'offline-cache-v1';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/scripts/index.js',
  '/styles/styles.css',
  '/@vite/client', 
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('Precaching failed:', err))
  );
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

  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            let responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch(err => console.error('Cache put error:', err));
            
            return networkResponse;
          })
          .catch((err) => {
            console.error('Fetch failed:', err);
            
            if (event.request.headers.get('accept') && 
                event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            
            return new Response('Network error occurred', {
              status: 200,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'update-cache') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          return Promise.all(ASSETS_TO_CACHE.map(url => {
            return fetch(url)
              .then(response => cache.put(url, response))
              .catch(err => console.warn(`Failed to update cache for ${url}:`, err));
          }));
        })
    );
  }
});


