// ── Exegesis Bible — Service Worker ──────────────────────────────────────────
// Cache-first for static assets, network-first for API calls, offline fallback.
// In development (?dev=true), bypasses all caching to avoid stale HMR bundles.

const CACHE_NAME = "exegesis-v3";
const STATIC_CACHE = "exegesis-static-v3";
const API_CACHE = "exegesis-api-v3";

// Detect development mode: localhost or 127.0.0.1 → no caching.
const IS_DEV = self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1";

// Assets to pre-cache on install
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/exegesis-icon-16x16.png",
  "/exegesis-icon-32x32.png",
  "/exegesis-icon-48x48.png",
  "/exegesis-icon-64x64.png",
  "/exegesis-icon-128x128.png",
  "/exegesis-icon-180x180.png",
  "/exegesis-icon-192x192.png",
  "/exegesis-icon-256x256.png",
  "/exegesis-icon-512x512.png",
  "/exegesis-logo.png",
  "/exegesis-icon.ico",
  "/placeholder.svg",
];

// API patterns to cache (network-first, cache fallback)
const API_PATTERNS = [
  /\/translations\//,
  /\/bible\//,
  /\/journal\//,
  /\/auth\//,
  /\/reading-plans\//,
  /\/subscriptions\//,
  /\/daily\//,
  /\/strongs\//,
  /\/exegesis\//,
];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  if (IS_DEV) {
    // In dev mode, skip pre-caching (assets may not exist or change frequently)
    console.log("[SW] Dev mode detected — skipping pre-cache");
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }),
  );
  // Activate immediately without waiting for old SW to close
  self.skipWaiting();
});

// ── Activate ────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  if (IS_DEV) {
    // In dev mode, clear ALL caches and take control without caching anything
    console.log("[SW] Dev mode — clearing all caches");
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
    );
    self.clients.claim();
    return;
  }

  // Clean up old caches
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter(
            (key) =>
              key !== CACHE_NAME &&
              key !== STATIC_CACHE &&
              key !== API_CACHE,
          )
          .map((key) => caches.delete(key)),
      );
    }),
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ── Fetch ───────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension and other internal protocols
  if (url.protocol === "chrome-extension:" || url.protocol === "chrome:") return;

  // ── Development mode: bypass all caching ──────────────────────────────────
  // This avoids serving stale JS/CSS bundles that break Vite HMR
  if (IS_DEV) {
    return; // Don't intercept — let the browser handle all requests normally
  }

  // ── Static assets (cache-first) ──
  if (
    url.origin === self.location.origin &&
    (request.destination === "style" ||
      request.destination === "script" ||
      request.destination === "font" ||
      request.destination === "image" ||
      url.pathname.match(/\.(css|js|woff2?|ttf|png|jpg|jpeg|svg|ico|json)$/))
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          // Cache the fetched response for next time
          const cloned = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, cloned);
          });
          return response;
        });
      }),
    );
    return;
  }

  // ── API requests (network-first, cache fallback) ──
  if (url.origin === self.location.origin || API_PATTERNS.some((p) => p.test(url.pathname))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET responses
          if (response.ok || response.type === "opaque") {
            const cloned = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, cloned);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline: serve from cache
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Return offline fallback for HTML navigation
            if (request.destination === "document") {
              return caches.match("/");
            }
            return new Response("Offline", { status: 503 });
          });
        }),
    );
    return;
  }

  // ── Navigation requests (network-first with offline SPA fallback) ──
  if (request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the HTML page
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cloned);
          });
          return response;
        })
        .catch(() => {
          // Offline: serve cached version or root
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return caches.match("/");
          });
        }),
    );
    return;
  }
});
