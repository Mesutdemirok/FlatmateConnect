const PORT = process.env.PORT || 5000;
app
  .listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`⚠️ Port ${PORT} already in use. Trying another...`);
      app.listen(0); // random free port
    } else {
      throw err;
    }
  });
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Statik dosyaları (build, public) serve et
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.static(path.join(__dirname, "public")));

// ✅ Sitemap ve RSS dosyaları için özel yönlendirme
app.get(["/sitemap.xml", "/rss.xml"], (req, res) => {
  res.sendFile(path.join(__dirname, "public", req.path));
});

// ✅ Vite React SPA için fallback route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Odanet server running on http://localhost:${PORT}`);
});
