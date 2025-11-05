import express from "express";

const router = express.Router();

router.get("/proxy/*", async (req, res) => {
  try {
    const targetPath = (req.params as any)[0];
    if (!targetPath) {
      return res.status(400).json({ error: "No image path provided" });
    }

    const cdnUrl = `https://cdn.odanet.com.tr/${targetPath}`;
    console.log("🔁 Proxying image:", cdnUrl);

    const response = await fetch(cdnUrl);
    if (!response.ok) {
      console.error("❌ CDN fetch failed:", response.status);
      return res.status(response.status).json({ error: "Failed to load image" });
    }

    res.set("Content-Type", response.headers.get("content-type") || "image/jpeg");
    res.set("Cache-Control", "public, max-age=604800"); // 7 days cache
    
    if (!response.body) {
      return res.status(500).json({ error: "No response body" });
    }

    // Stream the image data
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (err: any) {
    console.error("❌ Proxy error:", err);
    res.status(500).json({ error: "Proxy server error", details: err.message });
  }
});

export default router;
