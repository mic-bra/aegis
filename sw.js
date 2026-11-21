const CACHE_NAME = 'app-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './offline.html',
    './manifest.json'
];
self.addEventListener('install',(event)=>{
event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()));
})
self.addEventListener('activate', (event) =>{
    event.waitUntil(
        caches.keys()
            .then((keys)=>{
                return Promise.all(
                    keys
                        .filter((key)=> key!== CACHE_NAME)
                        .map((key)=> caches.delete(key))
                );
            })
            .then(()=> self.clients.claim())
    );
});
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('./offline.html'))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {

          return cachedResponse || fetch(event.request);
      })
  );
});