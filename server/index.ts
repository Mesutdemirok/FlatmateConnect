import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { ogHandler } from "./og";
import uploadsRouter from "./routes/uploads";
import oauthRouter from "./routes/oauth";
import path from "path";
import fs from "fs";
import { Client as AppStorage } from "@replit/object-storage";

const app = express();

// 🧩 Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 🔐 OAuth routes (must be before general API routes)
app.use("/api", oauthRouter);

// 📦 Upload routes (for multipart/form-data)
app.use("/api", uploadsRouter);

// 🔧 Local upload directory setup
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });

// 🧠 MIME types map
const mimeMap: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".json": "application/json",
};

// ✅ Health check endpoint
app.get("/uploads/health.txt", (_req, res) =>
  res.type("text/plain").send("ok"),
);

// ✅ Serve local uploads (priority 1)
app.use(
  "/uploads",
  express.static(LOCAL_UPLOAD_DIR, {
    immutable: true,
    maxAge: "1y",
    setHeaders(res, filePath) {
      const ext = path.extname(filePath).toLowerCase();
      if (mimeMap[ext]) res.setHeader("Content-Type", mimeMap[ext]);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  }),
);

// ✅ Optional: Replit Object Storage fallback
const OBJECT_STORAGE_ENABLED =
  process.env.ENABLE_REPLIT_OBJECT_STORAGE === "true";
let bucket: AppStorage | null = null;

if (OBJECT_STORAGE_ENABLED) {
  try {
    bucket = new AppStorage();
    log("✅ Replit Object Storage initialized");
  } catch (err: any) {
    log(`⚠️ Object Storage initialization failed: ${err.message}`);
    bucket = null;
  }
} else {
  log(
    "⚠️ Replit Object Storage disabled - using Cloudflare R2 and local storage",
  );
}

// ✅ Serve uploaded files (with fallback)
app.get("/uploads/:folder/:filename", async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const key = `${folder}/${filename}`;
    const localPath = path.join(LOCAL_UPLOAD_DIR, folder, filename);

    // Try local first
    if (fs.existsSync(localPath)) {
      const ext = path.extname(filename).toLowerCase();
      const contentType = mimeMap[ext] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return fs.createReadStream(localPath).pipe(res);
    }

    // Then try Object Storage
    if (OBJECT_STORAGE_ENABLED && bucket) {
      const result = await bucket.downloadAsBytes(key);
      if (!result.ok || !result.value) {
        log(`⚠️ Not found in Object Storage: ${key}`);
        return res.status(404).send("Not found");
      }

      const fileData = Buffer.isBuffer(result.value)
        ? result.value
        : Array.isArray(result.value)
          ? Buffer.from(result.value as unknown as number[])
          : Buffer.from(result.value);

      const ext = path.extname(filename).toLowerCase();
      const contentType = mimeMap[ext] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Content-Length", fileData.length);

      return res.end(fileData);
    }

    return res.status(404).send("Not found");
  } catch (err: any) {
    log(`❌ Error serving upload: ${err.message}`);
    res
      .status(500)
      .type("text/plain")
      .send(`Internal error: ${err.message || "Unknown error"}`);
  }
});

// ✅ Request logger for API routes
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 120) logLine = logLine.slice(0, 119) + "…";
      log(logLine);
    }
  });

  next();
});

// 🚀 App startup
(async () => {
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // 🧭 OG (social meta preview) handlers
  app.get("/oda-ilani/:id", (req, res, next) => ogHandler(req, res, next));
  app.get("/oda-arayan/:id", (req, res, next) => ogHandler(req, res, next));
  app.get("/", (req, res, next) => {
    const ua = String(req.headers["user-agent"] || "");
    const isBot =
      /(facebookexternalhit|whatsapp|twitterbot|slackbot|linkedinbot|telegram|discord|pinterest)/i.test(
        ua,
      ) || req.query._og === "1";
    if (isBot) return ogHandler(req, res, next);
    next();
  });

  // ⚙️ Setup Vite or serve static build
  const isDevelopment =
    process.env.NODE_ENV?.trim().toLowerCase() !== "production";
  if (isDevelopment) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // 🟢 Start server
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () =>
    log(`✅ Server running on port ${port}`),
  );
})();
