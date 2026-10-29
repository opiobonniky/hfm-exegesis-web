// ── Exegesis Bible — Service Worker ──────────────────────────────────────────
// Public static assets and SPA-shell fallback only. API/private data is never cached.
// In development (?dev=true), bypasses all caching to avoid stale HMR bundles.

importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

const CACHE_NAME = "exegesis-v7";
const STATIC_CACHE = "exegesis-static-v7";

// Detect development mode: localhost or 127.0.0.1 → no caching.
const IS_DEV = self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1";

firebase.initializeApp({
  apiKey: "AIzaSyDb7YnYD4e-yGpUr8yXrR4ayIswk-A0QCQ",
  authDomain: "exegesis-bd116.firebaseapp.com",
  projectId: "exegesis-bd116",
  storageBucket: "exegesis-bd116.firebasestorage.app",
  messagingSenderId: "683836491679",
  appId: "1:683836491679:web:709b41503c6e2a8ef11faa",
});

// Register before Firebase messaging so app navigation wins for all payload shapes.
self.addEventListener("notificationclick", (event) => {
  event.stopImmediatePropagation();
  event.notification.close();
  const notificationData = event.notification.data || {};
  const fcmMessage = notificationData.FCM_MSG || {};
  const data = { ...(fcmMessage.data || {}), ...notificationData };
  let url = new URL('/', self.location.origin);
  if (data.kind === 'support-message' && /^[1-9]\d*$/.test(String(data.ticketId || ''))) {
    url = new URL(data.audience === 'admin' || data.screen === 'AdminSupport' ? '/admin/support' : '/support', self.location.origin);
    url.searchParams.set('ticketId', String(data.ticketId));
    if (/^[1-9]\d*$/.test(String(data.messageId || ''))) url.searchParams.set('messageId', String(data.messageId));
  } else {
    try {
      const candidate = new URL(data.link || (fcmMessage.fcmOptions && fcmMessage.fcmOptions.link) || '/', self.location.origin);
      if (candidate.origin === self.location.origin) url = candidate;
    } catch { /* Malformed/external payloads open the app origin only. */ }
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clientList) => {
      for (const client of clientList) {
        if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
          try { await client.navigate(url.href); return await client.focus(); }
          catch { /* Try another app window, then open a new one. */ }
        }
      }
      return self.clients.openWindow(url.href);
    }),
  );
});

try {
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(async (payload) => {
    // Firebase already displays notification payloads before invoking this
    // callback. Display only data-only messages ourselves, never duplicates.
    if (payload.notification) return;
    const notification = payload.notification || {};
    const data = payload.data || {};
    const title = notification.title || data.notificationTitle || data.title || "Exegesis";
    const body = notification.body || data.notificationBody || data.body || "";
    const tag = data.notificationId || (data.kind === 'support-message' && data.messageId ? `support-message-${data.messageId}` : data.kind || 'exegesis-push');
    if ((await self.registration.getNotifications({ tag })).length) return;

    return self.registration.showNotification(title, {
      body,
      icon: "/exegesis-icon-192x192.png",
      badge: "/exegesis-icon-96x96.png",
      tag,
      ...(data.imageUrl && { image: data.imageUrl }),
      data: { ...data, link: data.link || (payload.fcmOptions && payload.fcmOptions.link) },
    });
  });
} catch (error) {
  console.warn("[FCM SW] messaging init failed:", error);
}

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

// Never store API responses here. Public, checksum-validated reading packs are
// installed by the application, not by a generic URL-only response cache.

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
              key.startsWith('exegesis-') &&
              key !== 'exegesis-public-packs-v1' &&
              key !== CACHE_NAME &&
              key !== STATIC_CACHE,
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

  // Authenticated requests and signed/private media are network-only, including
  // same-origin images. Do not fall back to a previous account's cached result.
  if (url.origin !== self.location.origin || request.headers.has('Authorization') ||
      /^\/(auth|admin|journal|subscriptions|support|push|media|uploads)(\/|$)/.test(url.pathname) ||
      url.searchParams.has('sig')) return;

  // ── Executable assets (network-first) ──
  // Never let an old application chunk create a second React/context graph.
  if (
    url.origin === self.location.origin &&
    (request.destination === "style" ||
      request.destination === "script" ||
      url.pathname.match(/\.(css|js)$/))
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && !/private|no-store/i.test(response.headers.get('Cache-Control') || '')) {
            const cloned = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, cloned));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached || new Response("Offline", { status: 503 }),
          ),
        ),
    );
    return;
  }

  // ── Static media (cache-first) ──
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/assets/') || PRECACHE_URLS.includes(url.pathname)) &&
    (request.destination === "font" ||
      request.destination === "image" ||
      url.pathname.match(/\.(woff2?|ttf|png|jpg|jpeg|svg|ico|json)$/))
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          // Cache the fetched response for next time
          if (response.ok && !/private|no-store/i.test(response.headers.get('Cache-Control') || '')) {
            const cloned = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, cloned));
          }
          return response;
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
