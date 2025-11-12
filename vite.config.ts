import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// Detect environment
const isReplit = process.env.REPL_ID !== undefined;
const isProduction = process.env.NODE_ENV === "production";

// Determine backend URL
const backendUrl = isReplit
  ? "http://localhost:5000" // 🧩 Dev / Replit
  : "https://api.odanet.com.tr"; // 🌐 Production

export default defineConfig(async () => ({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),

    // Replit-specific Dev Plugins
    ...(isReplit && !isProduction
      ? [
          (await import("@replit/vite-plugin-cartographer")).cartographer(),
          (await import("@replit/vite-plugin-dev-banner")).devBanner(),
        ]
      : []),

    // 🔹 Custom banner plugin
    {
      name: "show-environment-banner",
      configureServer() {
        console.log(
          `\n🚀 Odanet Frontend running in ${
            isReplit ? "Replit Dev" : isProduction ? "Production" : "Local Dev"
          } mode`,
        );
        console.log(`🔗 Connected to API: ${backendUrl}\n`);
      },
      closeBundle() {
        console.log(
          `\n✅ Build completed for ${
            isProduction ? "production" : "development"
          }`,
        );
        console.log(`🔗 API base: ${backendUrl}\n`);
      },
    },
  ],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  root: path.resolve(import.meta.dirname, "client"),

  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },

  server: {
    port: 5173,
    open: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      "/api": {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
}));
