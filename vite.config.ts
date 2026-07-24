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
    overlay: false,
    allowedHosts: ["localhost", "127.0.0.1", ".exegesisproject.org"],
    hmr: {
      host: "localhost",
      clientPort: 8080,
    },
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
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@react-oauth/google",
      "cookie",
      "set-cookie-parser",
    ],
  },
}));
