const CACHE_NAME = 'kurt-ops-v4';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png',
  './icons/briefings.png',
  './icons/centralelogs.png',
  './icons/chatgpt.png',
  './icons/claude.png',
  './icons/copilot.png',
  './icons/copilotwerk.png',
  './icons/drive.png',
  './icons/dsm.png',
  './icons/filestation.png',
  './icons/gemini.png',
  './icons/gezondheid.png',
  './icons/homepage.png',
  './icons/jellyfin.png',
  './icons/mistral.png',
  './icons/permanentie.png',
  './icons/photos.png',
  './icons/reizen.png',
  './icons/uptimekuma.png',
  './icons/vault.png',
  './icons/workhub.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for our own shell only. Reachability probes to the NAS and any
// other cross-origin request pass straight through, untouched, so live status
// checks always reflect reality instead of a cached answer.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Logo's van de icoon-CDN worden bewaard zodra ze één keer geladen zijn,
  // zodat de tegels ook zonder verbinding herkenbaar blijven.
  if (url.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(e.request).then((hit) =>
          hit || fetch(e.request).then((res) => {
            if (res && res.status === 200) cache.put(e.request, res.clone());
            return res;
          })
        )
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
