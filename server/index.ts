import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { registerRoutes } from "./routes";
import { log } from "./og"; // optional
import uploadsRouter from "./routes/uploads";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

/* ---------------------------------------------------------
   🩺 Health Checks (for Replit Autoscale + Manual Check)
--------------------------------------------------------- */
// Replit uses this for readiness probes
app.get("/health", (_req, res) => res.status(200).send("ok"));

// Manual / internal API check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Backend running fine ✅" });
});

/* ---------------------------------------------------------
   🌍 Middleware
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
    ],
    credentials: true,
  }),
);

/* ---------------------------------------------------------
   📁 Static Uploads Directory
--------------------------------------------------------- */
// Serve files from the local /uploads folder (so uploaded images are visible)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ---------------------------------------------------------
   🧩 API Routes
--------------------------------------------------------- */
// Register uploads endpoints under /api/uploads
app.use("/api/uploads", uploadsRouter);

// Register all other routes (seekers, listings, etc.)
(async () => {
  try {
    const server = await registerRoutes(app);

    const port = parseInt(process.env.PORT || "5000", 10);
    const host = "0.0.0.0";

    server.listen(port, host, () => {
      console.log(`✅ Odanet backend running on port ${port}`);
      console.log(`🌐 Accessible at: http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Server startup error:", err);
    process.exit(1);
  }
})();

/* ---------------------------------------------------------
   🛑 Global Error Handler
--------------------------------------------------------- */
app.use(
  (err: any, _req: express.Request, res: express.Response, _next: any) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      success: false,
      message: "Beklenmeyen sunucu hatası.",
      error: err?.message || err,
    });
  },
);
