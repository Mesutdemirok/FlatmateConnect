import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { Client as AppStorage } from "@replit/object-storage";

const app = express();

/* -----------------------------------------------------
   🧱 Persistent Local Dir (used as fallback on Autoscale)
----------------------------------------------------- */
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "shared", "uploads");
fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });

/* -----------------------------------------------------
   🌍 CORS Configuration
----------------------------------------------------- */
const allowedOrigins = [
  "https://www.odanent.com.tr",
  "https://odanent.com.tr",
  "http://localhost:5000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Allow all temporarily (development fallback)
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
   💓 Health Check (verifies static serving)
----------------------------------------------------- */
app.get("/uploads/health.txt", (_req, res) =>
  res.type("text/plain").send("ok"),
);

/* -----------------------------------------------------
   🗂️ Local Static Uploads (fallback)
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
   💾 Replit Object Storage (App Storage)
   Authenticated with internal service token
----------------------------------------------------- */
const bucketName = process.env.REPLIT_APP_STORAGE_BUCKET || "odanent-uploads";
const authToken = process.env.REPLIT_APP_STORAGE_TOKEN;
const bucket = new AppStorage(bucketName, { auth: authToken });

app.get("/uploads/:folder/:filename", async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const key = `${folder}/${filename}`;
    log(`🔎 Fetching from AppStorage [${bucketName}]: ${key}`);

    const file = await bucket.get(key);
    if (!file) {
      log(`⚠️ Not found in AppStorage: ${key}`);
      return res.status(404).send("Not found");
    }

    const ext = path.extname(filename).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".txt": "text/plain",
      ".json": "application/json",
    };

    res.setHeader("Content-Type", mimeMap[ext] || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(file);
  } catch (err: any) {
    log(`❌ Storage error serving ${req.url}: ${err.message}`);
    res
      .status(500)
      .type("text/plain")
      .send(`Internal error: ${err.message || "Unknown error"}`);
  }
});

/* -----------------------------------------------------
   🧾 Request Logger
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
   🚀 Initialize Server
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
    log(`✅ Server running on port ${port}`),
  );
})();
