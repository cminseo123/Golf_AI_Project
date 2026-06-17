const CACHE_PREFIX = 'golf-mbti';
const STATIC_CACHE = `${CACHE_PREFIX}-static-v7`;
const PAGE_CACHE = `${CACHE_PREFIX}-pages-v1`;
const MEDIA_CACHE = `${CACHE_PREFIX}-media-v2`;
const ACTIVE_CACHES = [STATIC_CACHE, PAGE_CACHE, MEDIA_CACHE];

const PRECACHE_URLS = [
  '/',
  '/?source=twa',
  '/index.html',
  '/articles.html',
  '/manifest.json',
  '/site-theme.css',
  '/site-theme.js',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/golf-banner.webp',
  '/images/types/party-long-hitter.webp',
  '/images/types/type-mental-risk.webp',
  '/images/types/type-risk-social.webp',
  '/images/types/type-risk-tech.webp',
  '/images/types/type-mental-tech.webp',
  '/images/types/type-social-tech.webp',
  '/images/types/type-all-rounder.webp',
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
  /\.mp4($|\?)/,
];

function shouldSkip(url) {
  return SKIP_CACHE_PATTERNS.some((pattern) => pattern.test(url));
}

function shouldCacheResponse(response) {
  return response && response.ok && (response.type === 'basic' || response.type === 'cors');
}

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isDocumentRequest(request) {
  return request.mode === 'navigate' || request.destination === 'document';
}

function isRangeRequest(request) {
  return request.headers.has('range');
}

function isMediaRequest(request, url) {
  return (
    isSameOrigin(url) &&
    (request.destination === 'image' ||
      url.pathname.startsWith('/images/') ||
      url.pathname.endsWith('.webp'))
  );
}

function isStaticAssetRequest(request, url) {
  return (
    isSameOrigin(url) &&
    (request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'font' ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.json') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.webmanifest'))
  );
}

async function addToCache(cacheName, request, response) {
  if (!shouldCacheResponse(response)) {
    return response;
  }

  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    return addToCache(cacheName, request, response);
  } catch (error) {
    const cached = await caches.match(request, { ignoreSearch: isDocumentRequest(request) });
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  return addToCache(cacheName, request, response);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && !ACTIVE_CACHES.includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return;
  }

  const url = new URL(request.url);
  if (!/^https?:$/.test(url.protocol)) {
    return;
  }

  if (isRangeRequest(request)) {
    return;
  }

  if (shouldSkip(request.url)) {
    return;
  }

  if (isDocumentRequest(request)) {
    event.respondWith(networkFirst(request, PAGE_CACHE));
    return;
  }

  if (!isSameOrigin(url)) {
    return;
  }

  if (isMediaRequest(request, url)) {
    event.respondWith(cacheFirst(request, MEDIA_CACHE));
    return;
  }

  if (isStaticAssetRequest(request, url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  event.respondWith(networkFirst(request, PAGE_CACHE));
});
