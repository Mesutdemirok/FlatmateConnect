import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Serve static files from the correct build directory
app.use(express.static(path.join(__dirname, "dist", "public")));

// ✅ Sitemap and RSS files
app.get(["/sitemap.xml", "/rss.xml"], (req, res) => {
  const filePath = path.join(__dirname, "dist", "public", req.path);
  if (require('fs').existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    // Fallback to public directory
    res.sendFile(path.join(__dirname, "public", req.path));
  }
});

// ✅ SPA fallback - serve index.html for all non-static routes
app.get("*", (req, res) => {
  // Skip API routes
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return res.status(404).send("Not Found");
  }
  res.sendFile(path.join(__dirname, "dist", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Odanet server running on http://localhost:${PORT}`);
})
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`⚠️ Port ${PORT} already in use. Trying another...`);
      app.listen(0); // random free port
    } else {
      throw err;
    }
  });
