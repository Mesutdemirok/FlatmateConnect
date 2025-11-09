import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { registerRoutes } from "./routes";
import uploadsRouter from "./routes/uploads";
import proxyRouter from "./routes/proxy";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

/* ---------------------------------------------------------
   🩺 Health Checks
   Used by Replit autoscaler & manual browser testing
--------------------------------------------------------- */
app.get("/health", (_req, res) => res.status(200).send("ok"));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    message: "Backend running fine ✅",
    timestamp: new Date().toISOString(),
  });
});

/* ---------------------------------------------------------
   ⚙️ Middleware Setup
--------------------------------------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "https://www.odanet.com.tr",
      "https://odanet.com.tr",
      "https://flatmate-connect-1-mesudemirok.replit.app",
      "http://localhost:3000",
      "http://localhost:8081",
    ],
    credentials: true,
  }),
);

/* ---------------------------------------------------------
   📁 Static File Serving
--------------------------------------------------------- */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ---------------------------------------------------------
   🧩 Core API Routes
--------------------------------------------------------- */
app.use("/api/uploads", uploadsRouter);
app.use("/api", proxyRouter);

/* ---------------------------------------------------------
   🚀 Initialize Core Backend Routes
   Includes:
   - /api/listings
   - /api/seekers (public + authenticated)
   - /api/users/*
   - /api/messages
   - /api/auth/*
--------------------------------------------------------- */
(async () => {
  try {
    const server = await registerRoutes(app);

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
    console.error("❌ Server startup error:", err);
    process.exit(1);
  }
})();

/* ---------------------------------------------------------
   🛑 Global Error Handler (Failsafe)
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
