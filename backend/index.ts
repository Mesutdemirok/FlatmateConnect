import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { registerRoutes } from "./routes";
import uploadsRouter from "./routes/uploads";
import proxyRouter from "./routes/proxy";
import { pool } from "./db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

/* ---------------------------------------------------------
   🩺 Health Checks
--------------------------------------------------------- */
app.get("/health", (_req, res) => res.status(200).send("ok"));
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    msg: "Backend running ✅",
    time: new Date().toISOString(),
  });
});

/* ---------------------------------------------------------
   ⚙️ Middleware Setup
--------------------------------------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Dynamic CORS configuration
const corsOrigins = [
  "https://www.odanet.com.tr",
  "https://odanet.com.tr",
  "https://preview.odanet.com.tr",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:8081",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        corsOrigins.includes(origin) ||
        origin.includes(".replit.app") ||
        origin.includes(".repl.co") ||
        origin.includes(".replit.dev")
      ) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS: Allowing unexpected origin: ${origin}`);
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

/* ---------------------------------------------------------
   🚀 Start Server
--------------------------------------------------------- */
(async () => {
  try {
    // FIRST: Register all API routes (includes auth, listings, etc.)
    const server = await registerRoutes(app);
    
    // THEN: Register upload and proxy routes
    app.use("/api/uploads", uploadsRouter);
    app.use("/api", proxyRouter);
    
    // In development, let Vite handle frontend serving
    // In production, serve static files
    const isDevelopment = process.env.NODE_ENV === "development";
    
    if (!isDevelopment) {
      // Production: Serve static files
      let publicPath = path.join(__dirname, "public");
      
      // Fallback path logic (handles different build outputs)
      if (!fs.existsSync(path.join(publicPath, "index.html"))) {
        publicPath = path.join(__dirname, "../public");
      }
      if (!fs.existsSync(path.join(publicPath, "index.html"))) {
        publicPath = path.join(__dirname, "../dist/public");
      }
      
      console.log("🗂️ Serving static files from:", publicPath);
      
      app.use(express.static(publicPath));
      
      // ✅ Fallback route for React Router (serves SPA properly - MUST BE LAST)
      app.get("*", (_req, res) => {
        const indexFile = path.join(publicPath, "index.html");
        if (fs.existsSync(indexFile)) {
          res.sendFile(indexFile);
        } else {
          console.error("❌ index.html not found in:", publicPath);
          res.status(500).send("Frontend build not found.");
        }
      });
    }
    // In development, Vite Dev Server handles frontend serving on its own
    
    const port = parseInt(process.env.PORT || "5000", 10);
    const host = "0.0.0.0";
    server.listen(port, host, () => {
      console.log("==========================================");
      console.log("✅ Odanet backend is now running!");
      console.log(`🌐 Listening at: http://localhost:${port}`);
      console.log("🔒 Production domain: https://www.odanet.com.tr");
      console.log("==========================================");
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
})();

/* ---------------------------------------------------------
   🔥 Global Crash Handlers
--------------------------------------------------------- */
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("🔥 Unhandled Promise Rejection:", reason);
});

/* ---------------------------------------------------------
   🛑 Global Error Handler
--------------------------------------------------------- */
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("🔥 Unhandled global error:");
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Beklenmeyen sunucu hatası.",
      error: err?.message || JSON.stringify(err),
      stack: process.env.NODE_ENV !== "production" ? err?.stack : undefined,
    });
  },
);

export default app;
