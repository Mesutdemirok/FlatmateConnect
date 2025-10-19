import fs from "fs";
import path from "path";

const BASE_URL = "https://www.odanet.com.tr";

async function generateSitemap() {
  try {
    // Static pages
    const staticPages = [
      "",
      "/giris",
      "/uye-ol",
      "/ilanlar",
      "/oda-arayanlar",
      "/iletisim",
    ];

    // Fetch dynamic listings
    const listings = await fetch(`${BASE_URL}/api/listings`)
      .then((res) => res.json())
      .catch(() => []);

    const seekers = await fetch(`${BASE_URL}/api/seekers/public?isActive=true`)
      .then((res) => res.json())
      .catch(() => []);

    const listingUrls = Array.isArray(listings)
      ? listings.map((l: any) => `/oda-ilani/${l.id}`)
      : [];

    const seekerUrls = Array.isArray(seekers)
      ? seekers.map((s: any) => `/oda-arayan/${s.id}`)
      : [];

    const allUrls = [...staticPages, ...listingUrls, ...seekerUrls];

    // Build sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `
  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${url === "" ? "1.0" : "0.7"}</priority>
  </url>`,
  )
  .join("")}
</urlset>`;

    // Save file into public folder
    const filePath = path.join(
      process.cwd(),
      "client",
      "public",
      "sitemap.xml",
    );
    fs.writeFileSync(filePath, sitemap, "utf8");

    console.log("✅ sitemap.xml generated successfully at:", filePath);
  } catch (err) {
    console.error("❌ Error generating sitemap:", err);
  }
}

generateSitemap();
