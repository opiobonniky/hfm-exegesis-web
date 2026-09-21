/**
 * pushService.ts — Web push (FCM) for the browser
 * ─────────────────────────────────────────────────────────────────────────────
 * Public API:
 *   isPushSupported()        — feature detection
 *   getPushPermission()      — current Notification.permission
 *   requestPushPermission()  — ask the user, returns "granted" | "denied" | "default"
 *   enableWebPush()          — permission + FCM token + register with backend
 *   disableWebPush()         — unregister token from backend, delete token
 *   isWebPushEnabled()       — token exists in backend (or locally cached)
 *   showLocalNotification()  — test/local notification via the SW registration
 *   onForegroundMessage()    — subscribe to pushes while the tab is focused
 *
 * Requires VITE_FIREBASE_VAPID_KEY in web/.env (Firebase console → Cloud
 * Messaging → Web Push certificates). Without it, enable is a no-op that
 * returns { enabled: false, reason }.
 */

import { getMessaging, getToken, deleteToken, isSupported, onMessage, type MessagePayload } from "firebase/messaging";
import { app } from "@/firebaseConfiguration/config";
import { sendPostRequest } from "./api";

export type PushPermissionState = NotificationPermission | "unsupported";

const TOKEN_CACHE_KEY = "push_token_last";
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

let messagingInstance: ReturnType<typeof getMessaging> | null = null;

const getMessagingInstance = async () => {
  if (!(await isSupported())) return null;
  if (!messagingInstance) messagingInstance = getMessaging(app);
  return messagingInstance;
};

// ── Feature detection / permission ──────────────────────────────────────────

export const isPushSupported = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator) || !("Notification" in window)) return false;
  return isSupported().catch(() => false);
};

export const getPushPermission = (): PushPermissionState =>
  typeof window !== "undefined" && "Notification" in window
    ? Notification.permission
    : "unsupported";

export const requestPushPermission = async (): Promise<NotificationPermission> => {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
};

// ── Token lifecycle ──────────────────────────────────────────────────────────

/** Ensure the FCM service worker is registered (idempotent). */
const ensureMessagingSw = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!("serviceWorker" in navigator)) return null;
  try {
    // register() resolves with the existing registration if already registered.
    return await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  } catch (error) {
    console.warn("[push] messaging SW registration failed:", error);
    return null;
  }
};

/**
 * Full enable flow: request permission → get FCM token (with VAPID key) →
 * register it with the backend. Returns a user-facing result.
 */
export const enableWebPush = async (): Promise<{ enabled: boolean; reason?: string }> => {
  if (!(await isPushSupported())) {
    return { enabled: false, reason: "This browser does not support push notifications" };
  }

  const permission = await requestPushPermission();
  if (permission !== "granted") {
    return { enabled: false, reason: "Notification permission was not granted" };
  }

  if (!VAPID_KEY) {
    console.warn("[push] VITE_FIREBASE_VAPID_KEY missing — cannot obtain a token");
    return { enabled: false, reason: "Push is not configured (missing VAPID key)" };
  }

  const messaging = await getMessagingInstance();
  const registration = await ensureMessagingSw();
  if (!messaging || !registration) {
    return { enabled: false, reason: "Push messaging is unavailable in this browser" };
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) return { enabled: false, reason: "Could not generate a push token" };

    await sendPostRequest("push", "register-token", { token, platform: "web" });
    localStorage.setItem(TOKEN_CACHE_KEY, token);
    return { enabled: true };
  } catch (error) {
    console.error("[push] enable failed:", error);
    return { enabled: false, reason: "Failed to register for push notifications" };
  }
};

/** Unregister the token from the backend and delete it locally. */
export const disableWebPush = async (): Promise<void> => {
  const token = localStorage.getItem(TOKEN_CACHE_KEY);
  if (token) {
    try {
      await sendPostRequest("push", "unregister-token", { token });
    } catch {
      // Backend already lost it or is unreachable — nothing else to do.
    }
  }
  try {
    const messaging = await getMessagingInstance();
    if (messaging) await deleteToken(messaging);
  } catch {
    // Token may already be gone.
  }
  localStorage.removeItem(TOKEN_CACHE_KEY);
};

/** True when the browser has granted permission and we hold a cached token. */
export const isWebPushEnabled = (): boolean =>
  getPushPermission() === "granted" && !!localStorage.getItem(TOKEN_CACHE_KEY);

// ── Local / foreground notifications ────────────────────────────────────────

/** Show a notification immediately through the service worker (test button). */
export const showLocalNotification = async (title: string, body: string) => {
  if (getPushPermission() !== "granted") return false;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return false;
  await registration.showNotification(title, {
    body,
    icon: "/exegesis-icon-192x192.png",
  });
  return true;
};

/** Subscribe to pushes received while the tab is focused. Returns unsubscribe. */
export const onForegroundMessage = (callback: (payload: MessagePayload) => void) => {
  let unsubscribed = false;
  let internalUnsub: (() => void) | null = null;

  (async () => {
    const messaging = await getMessagingInstance();
    if (!messaging || unsubscribed) return;
    internalUnsub = onMessage(messaging, callback);
  })();

  return () => {
    unsubscribed = true;
    internalUnsub?.();
  };
};

/**
 * Silent sync for login/logout flows — never prompts. If permission was
 * already granted, (re-)registers the FCM token with the backend so the
 * token points at the just-logged-in user. Fire-and-forget by design.
 */
export const syncPushTokenIfPermitted = async (): Promise<void> => {
  try {
    if (getPushPermission() !== "granted" || !VAPID_KEY) return;
    const messaging = await getMessagingInstance();
    const registration = await ensureMessagingSw();
    if (!messaging || !registration) return;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) return;
    await sendPostRequest("push", "register-token", { token, platform: "web" });
    localStorage.setItem(TOKEN_CACHE_KEY, token);
  } catch {
    // Push sync must never break login.
  }
};
