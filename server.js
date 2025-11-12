// ─────────────────────────────────────────────
// 🌐 Odanet Server — Serves built frontend + API proxy
// ─────────────────────────────────────────────

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Serve static files from /dist and /public
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.static(path.join(__dirname, "public")));

// ✅ Sitemap / RSS special routes
app.get(["/sitemap.xml", "/rss.xml"], (req, res) => {
  res.sendFile(path.join(__dirname, "public", req.path));
});

// ✅ Health check for uptime monitors
app.get("/health", (req, res) => res.status(200).send("ok"));

// ✅ SPA fallback logic
app.get("*", (req, res) => {
  const distIndex = path.join(__dirname, "dist", "index.html");
  const publicIndex = path.join(__dirname, "public", "index.html");

  if (fs.existsSync(distIndex)) {
    res.sendFile(distIndex);
  } else if (fs.existsSync(publicIndex)) {
    res.sendFile(publicIndex);
  } else {
    res
      .status(404)
      .send(
        "❌ Frontend not found. Run `npm run build` first or start Vite with `npm run dev`.",
      );
  }
});

// ✅ Start server and auto-handle port conflicts
app
  .listen(PORT, () => {
    console.log(`✅ Odanet backend is running on http://localhost:${PORT}`);
    console.log(`🌍 Accessible at: https://www.odanet.com.tr`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`⚠️ Port ${PORT} already in use. Trying another...`);
      app.listen(0);
    } else {
      throw err;
    }
  });
