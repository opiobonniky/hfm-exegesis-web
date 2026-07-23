import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  appType: "spa",
  server: {
    host: "0.0.0.0",
    port: 8080,
    hmr: {
      host: "localhost",
      overlay: false,
    },
    headers: {
      "Cross-Origin-Opener-Policy": "unsafe-none",
    },
    allowedHosts: ["localhost", "127.0.0.1", ".exegesisproject.org"],
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "cookie", "set-cookie-parser"],
    exclude: ["react-router-dom", "@react-oauth/google"],
  },
}));
