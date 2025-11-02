import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { registerRoutes } from "./routes";
import { log } from "./vite";
import path from "path";

const app = express();

/* ---------------------------------------------------------
   🩺 Health Checks (for Replit Autoscale + Manual Check)
--------------------------------------------------------- */
// Replit uses this one for readiness probes
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
   🔗 Register All Routes
--------------------------------------------------------- */
(async () => {
  try {
    const server = await registerRoutes(app);
    const port = parseInt(process.env.PORT || "5000", 10);
    const host = "0.0.0.0";

    server.listen(port, host, () => {
      console.log(`✅ Odanet backend running on port ${port}`);
    });
  } catch (err) {
    console.error("❌ Server startup error:", err);
    process.exit(1);
  }
})();
