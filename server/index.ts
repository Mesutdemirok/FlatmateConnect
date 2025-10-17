import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";
import { Client as AppStorage } from "@replit/object-storage";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 🔧 Local upload path
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });

// 🧠 MIME type map
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

// ✅ Health check
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
      if (mimeMap[ext]) {
        res.setHeader("Content-Type", mimeMap[ext]);
      }
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  }),
);

// ✅ Fallback: Object Storage (priority 2) - Only if not disabled
const DISABLE_REPLIT_OBJECT_STORAGE = process.env.DISABLE_REPLIT_OBJECT_STORAGE === "true";
const bucket = DISABLE_REPLIT_OBJECT_STORAGE ? null : new AppStorage();

app.get("/uploads/:folder/:filename", async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const key = `${folder}/${filename}`;
    log(`🔎 Fetching from storage: ${key}`);

    // First: check if file exists locally
    const localPath = path.join(LOCAL_UPLOAD_DIR, folder, filename);
    if (fs.existsSync(localPath)) {
      const ext = path.extname(filename).toLowerCase();
      const contentType = mimeMap[ext] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return fs.createReadStream(localPath).pipe(res);
    }

    // Otherwise: fetch from Object Storage (if enabled)
    if (!DISABLE_REPLIT_OBJECT_STORAGE && bucket) {
      const result = await bucket.downloadAsBytes(key);
      if (!result.ok || !result.value) {
        log(`⚠️ Not found in Object Storage: ${key}`);
        return res.status(404).send("Not found");
      }

      // Fix: handle Array and Buffer types properly
      let fileData: Buffer;
      if (Buffer.isBuffer(result.value)) {
        fileData = result.value;
      } else if (Array.isArray(result.value)) {
        fileData = Buffer.from(result.value as unknown as number[]);
      } else {
        fileData = Buffer.from(result.value);
      }

      const ext = path.extname(filename).toLowerCase();
      const contentType = mimeMap[ext] || "application/octet-stream";

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Content-Length", fileData.length);

      return res.end(fileData);
    }

    log(`⚠️ Not found locally and object storage disabled: ${key}`);
    return res.status(404).send("Not found");
  } catch (err: any) {
    log(`❌ Error serving upload: ${err.message}`);
    res
      .status(500)
      .type("text/plain")
      .send(`Internal error: ${err.message || "Unknown error"}`);
  }
});

// ✅ API request logger
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
      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// 🚀 App startup
(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Use process.env.NODE_ENV directly for reliable environment detection
  const isDevelopment = process.env.NODE_ENV?.trim().toLowerCase() !== "production";
  
  if (isDevelopment) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () =>
    log(`✅ Server running on port ${port}`),
  );
})();
