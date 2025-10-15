import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Persistent dir for Autoscale (used as a fallback cache)
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "shared", "uploads");
fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });

// CORS for all allowed origins
const allowedOrigins = [
  "https://www.odanent.com.tr",
  "https://odanent.com.tr",
  "http://localhost:5000",
  "http://localhost:5173",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* -----------------------------------------------------
   ✅ HEALTH CHECK — to verify /uploads serving
----------------------------------------------------- */
app.get("/uploads/health.txt", (_req, res) =>
  res.type("text/plain").send("ok"),
);

/* -----------------------------------------------------
   ✅ STATIC FILES (LOCAL FALLBACK)
   In production, uploads are stored in Replit App Storage
----------------------------------------------------- */
app.use(
  "/uploads",
  express.static(LOCAL_UPLOAD_DIR, {
    immutable: true,
    maxAge: "1y",
    setHeaders(res) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  }),
);

/* -----------------------------------------------------
   ✅ REQUEST LOGGING
----------------------------------------------------- */
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJson: Record<string, any> | undefined;

  const originalJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJson = bodyJson;
    return originalJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJson) logLine += ` :: ${JSON.stringify(capturedJson)}`;
      if (logLine.length > 120) logLine = logLine.slice(0, 119) + "…";
      log(logLine);
    }
  });

  next();
});

/* -----------------------------------------------------
   ✅ APP STORAGE HELPER (Replit Object Storage)
   Optional: file persistence using @replit/object-storage
----------------------------------------------------- */
import { Client as AppStorage } from "@replit/object-storage";

const bucket = new AppStorage("uploads");

/**
 * This ensures uploaded files are automatically
 * saved to Replit's persistent App Storage.
 */
app.get("/uploads/:type/:filename", async (req, res) => {
  try {
    const { type, filename } = req.params;
    const key = `${type}/${filename}`;
    const stream = await bucket.getStream(key);
    if (!stream) return res.status(404).send("Not found");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    stream.pipe(res);
  } catch (e: any) {
    log(`Error serving ${req.url}: ${e.message}`);
    res.status(404).send("Not found");
  }
});

/* -----------------------------------------------------
   ✅ ERROR HANDLER
----------------------------------------------------- */
(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    res
      .status(status)
      .json({ message: err.message || "Internal Server Error" });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () =>
    log(`Serving on port ${port}`),
  );
})();
