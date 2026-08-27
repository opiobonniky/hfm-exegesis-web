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
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // React core + router
          if (
            /[/]node_modules[/](react|react-dom|react-router|react-router-dom|scheduler)[/]/.test(id)
          ) {
            return "vendor-react";
          }

          // All Radix UI primitives
          if (/[/]node_modules[/]@radix-ui[/]/.test(id)) {
            return "vendor-radix";
          }

          // Firebase (large, only used in Auth)
          if (/[/]node_modules[/]firebase[/]/.test(id)) {
            return "vendor-firebase";
          }

          // Lucide icons (largest single dep at 1.2MB)
          if (/[/]node_modules[/]lucide-react[/]/.test(id)) {
            return "vendor-icons";
          }

          // Framer Motion + Embla (animation/carousel)
          if (
            /[/]node_modules[/](framer-motion|embla-carousel)[/]/.test(id)
          ) {
            return "vendor-motion";
          }

          // Chart / date / data libs
          if (
            /[/]node_modules[/](date-fns|react-day-picker|recharts|react-resizable-handles?)[/]/.test(
              id
            )
          ) {
            return "vendor-charts";
          }

          // Form / validation / toast
          if (
            /[/]node_modules[/](@hookform|zod|react-hook-form)[/]/.test(id)
          ) {
            return "vendor-forms";
          }

          // Supabase + OAuth + Axios
          if (
            /[/]node_modules[/](@supabase|@react-oauth|axios)[/]/.test(id)
          ) {
            return "vendor-api";
          }

          // cmdk + input-otp (command palette & OTP)
          if (/[/]node_modules[/](cmdk|input-otp)[/]/.test(id)) {
            return "vendor-extra";
          }

          // Remaining node_modules go to vendor-misc
          return "vendor-misc";
        },
      },
    },
  },
}));
