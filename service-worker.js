const CACHE_NAME = 'golf-mbti-v1';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

const SKIP_CACHE_PATTERNS = [
  /^chrome-extension:/,
  /google-analytics\.com/,
  /googletagmanager\.com/,
  /pagead2\.googlesyndication\.com/,
  /googlesyndication\.com/,
  /doubleclick\.net/,
  /unpkg\.com/,
  /cdn\.tailwindcss\.com/,
  /cdn\.jsdelivr\.net/,
  /html2canvas\.hertzen\.com/,
  /clarity\.ms/,
];

function shouldSkip(url) {
  return SKIP_CACHE_PATTERNS.some((pattern) => pattern.test(url));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;
  if (request.url === self.location.href) return;
  if (shouldSkip(request.url)) return;

  // navigation 요청 및 정적 리소스: network-first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
