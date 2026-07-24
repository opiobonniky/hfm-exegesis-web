import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

const GOOGLE_CLIENT_ID = "270479211517-kinap7kv1bcd3dlpuodt5fkju361fdqb.apps.googleusercontent.com";

// ── Service worker management ────────────────────────────────────────────────
// In development: unregister any previously-installed SW and clear all caches.
// Old SWs cache stale Vite chunks which break HMR and cause duplicate React
// instances (→ "Invalid hook call" errors).
if ("serviceWorker" in navigator) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) {
        reg.unregister();
        console.log("[SW] Unregistered:", reg.scope);
      }
    });
    if ("caches" in window) {
      caches.keys().then((keys) =>
        Promise.all(keys.map((k) => caches.delete(k))),
      );
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
}

createRoot(document.getElementById("root")!).render(
  <RouteErrorBoundary onReset={() => window.location.reload()}>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </RouteErrorBoundary>
);