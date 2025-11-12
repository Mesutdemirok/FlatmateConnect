import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
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

// Dynamic CORS configuration for better cookie handling
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
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list or is a Replit domain
      if (corsOrigins.includes(origin) || 
          origin.includes('.replit.app') || 
          origin.includes('.repl.co') ||
          origin.includes('.replit.dev')) {
        callback(null, true);
      } else {
        console.warn(`CORS: Allowing origin ${origin}`);
        callback(null, true); // Allow for now to avoid issues
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
  }),
);

/* ---------------------------------------------------------
   📁 Static File Serving
--------------------------------------------------------- */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ---------------------------------------------------------
   🧩 API Routes
--------------------------------------------------------- */
app.use("/api/uploads", uploadsRouter);
app.use("/api", proxyRouter);

/* ---------------------------------------------------------
   🌐 SPA Routing (Frontend)
   Ensures non-API routes serve index.html
--------------------------------------------------------- */
const distPath = path.join(__dirname, "../dist/public");
app.use(express.static(distPath));

// All non-API routes go to React SPA
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

/* ---------------------------------------------------------
   🚀 Start Server
--------------------------------------------------------- */
(async () => {
  try {
    const server = await registerRoutes(app);
    const port = parseInt(process.env.PORT || "8081", 10);
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
