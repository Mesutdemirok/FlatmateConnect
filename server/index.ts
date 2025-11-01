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

/* ---------------------------------------------------------
   Core server settings
--------------------------------------------------------- */
app.set("trust proxy", 1); // Replit/Proxy friendliness: correct proto & secure cookies

/* ---------------------------------------------------------
   🌐 Force host = www.odanet.com.tr (but allow preview hosts)
--------------------------------------------------------- */
app.use((req, res, next) => {
  const host = req.headers.host || "";
  if (/^odanet\.com\.tr$/i.test(host)) {
    const redirectUrl = `https://www.odanet.com.tr${req.originalUrl}`;
    console.log(`🌐 Redirecting to www: ${redirectUrl}`);
    return res.redirect(301, redirectUrl);
  }
  next();
});

/* ---------------------------------------------------------
   Middleware
--------------------------------------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* ---------------------------------------------------------
   Static uploads (local) + health
--------------------------------------------------------- */
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });

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

app.get("/uploads/health.txt", (_req, res) =>
  res.type("text/plain").send("ok"),
);

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

/* ---------------------------------------------------------
   Optional: Replit Object Storage fallback for /uploads/*
--------------------------------------------------------- */
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

app.get("/uploads/:folder/:filename", async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const key = `${folder}/${filename}`;
    const localPath = path.join(LOCAL_UPLOAD_DIR, folder, filename);

    if (fs.existsSync(localPath)) {
      const ext = path.extname(filename).toLowerCase();
      const contentType = mimeMap[ext] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return fs.createReadStream(localPath).pipe(res);
    }

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

/* ---------------------------------------------------------
   API request logger (after static, before routes)
--------------------------------------------------------- */
app.use((req, res, next) => {
  const start = Date.now();
  const { method, path: p } = req;

  let capturedJson: any;
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    capturedJson = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    if (p.startsWith("/api")) {
      const ms = Date.now() - start;
      let line = `${method} ${p} ${res.statusCode} in ${ms}ms`;
      if (capturedJson) {
        const sample = JSON.stringify(capturedJson);
        line += ` :: ${sample.length > 200 ? sample.slice(0, 200) + "…" : sample}`;
      }
      log(line);
    }
  });

  next();
});

/* ---------------------------------------------------------
   App bootstrap - Register routes FIRST, then 404 handler
--------------------------------------------------------- */
(async () => {
  // 1️⃣ Register all API routes (auth, listings, seekers, etc.)
  const server = await registerRoutes(app);
  
  // 2️⃣ Mount OAuth and Upload routers
  app.use("/api", oauthRouter);
  app.use("/api", uploadsRouter);
  
  // 3️⃣ API 404 guard — MUST come AFTER all /api routers
  // Prevents Vite SPA fallback (HTML) from handling unknown /api paths
  app.use("/api", (req, res) => {
    res.status(404).type("application/json").json({
      success: false,
      message: "API route not found",
      method: req.method,
      path: req.originalUrl,
    });
  });

  // OG (social meta) for bots only or explicit ?_og=1
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

  // Dev vs Prod asset serving
  const isDevelopment =
    (process.env.NODE_ENV || "").trim().toLowerCase() !== "production";
  if (isDevelopment) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  /* -------------------------------------------------------
     Final error boundary — JSON for API, HTML otherwise
  ------------------------------------------------------- */
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";
    if (req.path.startsWith("/api")) {
      // Always JSON for API
      return res
        .status(status)
        .type("application/json")
        .json({ success: false, message });
    }
    // Non-API: allow Vite/static error pages if any
    res.status(status).type("text/plain").send(message);
  });

  // Start server
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () =>
    log(`✅ Server running on port ${port}`),
  );
})();
