import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

const GOOGLE_CLIENT_ID = "270479211517-kinap7kv1bcd3dlpuodt5fkju361fdqb.apps.googleusercontent.com";

// ── Register service worker for PWA support (production only) ──
// In development, skip registration to avoid disrupting Vite's HMR WebSocket.
// The SW's self.clients.claim() in dev mode can break module hot-reloading.
if ("serviceWorker" in navigator && !import.meta.env.DEV) {
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

createRoot(document.getElementById("root")!).render(
  <RouteErrorBoundary onReset={() => window.location.reload()}>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </RouteErrorBoundary>
);