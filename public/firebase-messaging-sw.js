/* firebase-messaging-sw.js — FCM web-push handler
 * ────────────────────────────────────────────────────────────────────────────
 * Required by Firebase JS SDK for background push: must live at the site root
 * so its scope covers the whole app. Shows incoming pushes and focuses/opens
 * the app on click. Uses importScripts (classic worker) as the Firebase docs
 * prescribe — do not convert to a module worker.
 */

importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

// Same config as src/firebaseConfiguration/config.ts
firebase.initializeApp({
  apiKey: "AIzaSyBaxI4_VEzDBrUSnZQM1pHy4bdCBvah7NA",
  authDomain: "exegesis-app.firebaseapp.com",
  projectId: "exegesis-app",
  storageBucket: "exegesis-app.firebasestorage.app",
  messagingSenderId: "270479211517",
  appId: "1:270479211517:web:9e4e18a6a4ef821342b794",
});

try {
  const messaging = firebase.messaging();

  // Background push (page not focused / closed)
  messaging.onBackgroundMessage((payload) => {
    const notification = payload.notification || {};
    const data = payload.data || {};
    const title = notification.title || data.title || "Exegesis";
    const body = notification.body || data.body || "";

    self.registration.showNotification(title, {
      body,
      icon: "/exegesis-icon-192x192.png",
      badge: "/exegesis-icon-96x96.png",
      tag: data.kind || "exegesis-push",
      data,
    });
  });
} catch (error) {
  console.warn("[FCM SW] messaging init failed:", error);
}

// Notification click → focus an existing window or open a new one
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || "/";
  const url = new URL(link, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.navigate(url).catch(() => {});
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
