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
    setHeaders(res, filePath) {
      // Ensure correct Content-Type for images and text
      const ext = path.extname(filePath).toLowerCase();
      const mimeMap: Record<string, string> = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".avif": "image/avif",
        ".txt": "text/plain",
        ".json": "application/json",
        ".pdf": "application/pdf",
      };

      if (mimeMap[ext]) {
        res.setHeader("Content-Type", mimeMap[ext]);
      }

      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  }),
);

/* -----------------------------------------------------
   💾 Object Storage File Fetch (with local fallback)
----------------------------------------------------- */
app.get("/uploads/:folder/:filename", async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const key = `${folder}/${filename}`;
    log(`🔎 Fetching from AppStorage: ${key}`);

    // 1️⃣ Check local persistent dir (faster)
    const localPath = path.join(LOCAL_UPLOAD_DIR, folder, filename);
    if (fs.existsSync(localPath)) {
      const ext = path.extname(filename).toLowerCase();
      const mimeMap: Record<string, string> = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".avif": "image/avif",
        ".txt": "text/plain",
        ".json": "application/json",
        ".pdf": "application/pdf",
      };
      const contentType = mimeMap[ext] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return fs.createReadStream(localPath).pipe(res);
    }

    // 2️⃣ Otherwise, fetch from Replit Object Storage
    const bucket = new AppStorage();
    const fileBytes = await bucket.downloadAsBytes(key);

    if (!fileBytes?.value || !fileBytes.value.length) {
      log(`⚠️ Not found in Object Storage: ${key}`);
      return res.status(404).send("Not found");
    }

    const ext = path.extname(filename).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".avif": "image/avif",
      ".txt": "text/plain",
      ".json": "application/json",
      ".pdf": "application/pdf",
    };
    const contentType = mimeMap[ext] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Content-Length", fileBytes.value.length);

    // ✅ Convert to Buffer before sending (fixes "chunk must be Buffer" error)
    res.end(Buffer.from(fileBytes.value));
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
  const pathUrl = req.path;
  let capturedJson: Record<string, any> | undefined;

  const originalJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJson = bodyJson;
    return originalJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    if (pathUrl.startsWith("/api")) {
      const duration = Date.now() - start;
      let logLine = `${req.method} ${pathUrl} ${res.statusCode} in ${duration}ms`;
      if (capturedJson) logLine += ` :: ${JSON.stringify(capturedJson)}`;
      if (logLine.length > 120) logLine = logLine.slice(0, 119) + "…";
      log(logLine);
    }
  });

  next();
});

/* -----------------------------------------------------
   🚀 Start Server (wrapped safely)
----------------------------------------------------- */
async function startServer() {
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
}

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
});

export default app;
