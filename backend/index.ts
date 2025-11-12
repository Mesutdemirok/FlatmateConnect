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
   Health checks
--------------------------------------------------------- */
app.get("/health", (_req, res) => res.status(200).send("ok"));
app.get("/api/health", (_req, res) =>
  res.json({
    ok: true,
    msg: "Backend running ✅",
    time: new Date().toISOString(),
  }),
);

/* ---------------------------------------------------------
   Middleware
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
   Static + API routes
--------------------------------------------------------- */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/uploads", uploadsRouter);
app.use("/api", proxyRouter);

/* ---------------------------------------------------------
   SPA serving (critical fix)
--------------------------------------------------------- */
const distPath = path.join(__dirname, "../dist/public");
app.use(express.static(distPath));
app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));

/* ---------------------------------------------------------
   Start server
--------------------------------------------------------- */
(async () => {
  try {
    const server = await registerRoutes(app);
    const port = parseInt(process.env.PORT || "8081", 10);
    const host = "0.0.0.0";
    server.listen(port, host, () => {
      console.log("✅ Backend running on", port);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
})();

export default app;
