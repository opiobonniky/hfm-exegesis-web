import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { installDomStabilityGuards } from "@/lib/domStability";

// Must run before React mounts: Google Translate deletes React-owned text nodes
// and replaces them with <font> wrappers, which breaks every later commit that
// removes them. See @/lib/domStability.
installDomStabilityGuards();

const GOOGLE_CLIENT_ID = "270479211517-kinap7kv1bcd3dlpuodt5fkju361fdqb.apps.googleusercontent.com";

// ── Service worker management ────────────────────────────────────────────────
// In development: unregister any previously-installed SW and clear all caches.
// Old SWs cache stale Vite chunks which break HMR and cause duplicate React
// instances (→ "Invalid hook call" errors).
async function prepareServiceWorker() {
  if (!("serviceWorker" in navigator)) return true;

  if (import.meta.env.DEV) {
    const isAppWorker = (worker?: ServiceWorker | null) =>
      Boolean(worker && new URL(worker.scriptURL).pathname === "/sw.js");
    const wasControlled = isAppWorker(navigator.serviceWorker.controller);
    const registrations = (await navigator.serviceWorker.getRegistrations()).filter(
      (registration) =>
        isAppWorker(registration.active) ||
        isAppWorker(registration.installing) ||
        isAppWorker(registration.waiting),
    );
    const removals = await Promise.all(
      registrations.map(async (registration) => {
        const removed = await registration.unregister();
        if (removed) console.log("[SW] Unregistered:", registration.scope);
        return removed;
      }),
    );

    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }

    // A removed worker controls this document until the next navigation. Do not
    // mount against its stale module graph; reload once after unregistering it.
    if (wasControlled && removals.some(Boolean)) {
      window.location.reload();
      return false;
    }
  } else {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("🔁 SW registered:", registration.scope);
        })
        .catch((err) => {
          console.error("❌ SW registration failed:", err);
        });
    });
  }

  return true;
}

void prepareServiceWorker()
  .catch((error) => {
    console.warn("[SW] Cleanup failed; continuing without cleanup", error);
    return true;
  })
  .then((shouldMount) => {
    if (!shouldMount) return;

    createRoot(document.getElementById("root")!).render(
      <RouteErrorBoundary onReset={() => window.location.reload()}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      </RouteErrorBoundary>,
    );
  });
