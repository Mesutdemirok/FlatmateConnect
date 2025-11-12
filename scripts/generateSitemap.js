/**
 * generateSitemap.js — Odanet SEO automation
 * Generates sitemap.xml + rss.xml for production builds
 * Supports blog posts (Markdown), listings, and seekers (from API)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { SitemapStream, streamToPromise } from "sitemap";
import RSS from "rss";
import matter from "gray-matter";
import fetch from "node-fetch";

// ------------------------------
// ✅ Core Directories + Paths
// ------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = "https://www.odanet.com.tr";
const BLOG_DIR = path.join(__dirname, "../src/content/blog");
const PUBLIC_DIR = path.join(__dirname, "../client/public");

// ------------------------------
// 🧩 BLOG POSTS (Markdown)
// ------------------------------
function getAllBlogPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  const posts = [];

  for (const file of files) {
    try {
      const filePath = path.join(BLOG_DIR, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(fileContent);
      if (!data.slug || !data.title) continue;

      posts.push({
        slug: data.slug,
        title: data.title,
        description: data.description || "",
        date: data.date || new Date().toISOString(),
        author: data.author || "Odanet Ekibi",
        image: data.image || `${SITE_URL}/default-thumbnail.jpg`,
      });
    } catch (err) {
      console.warn(`⚠️ Could not parse ${file}:`, err.message);
    }
  }

  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ------------------------------
// 🧩 API LISTINGS + SEEKERS
// ------------------------------
async function getListingsAndSeekers() {
  console.log("📦 Fetching listings and seekers from API...");
  
  // Use localhost in development, production domain otherwise
  const API_BASE = process.env.NODE_ENV === "production" 
    ? "https://www.odanet.com.tr" 
    : "http://localhost:5000";
  
  try {
    const [listingsRes, seekersRes] = await Promise.all([
      fetch(`${API_BASE}/api/listings?isActive=true`).catch(err => {
        console.warn("⚠️ Could not fetch listings:", err.message);
        return { ok: false };
      }),
      fetch(`${API_BASE}/api/seekers/public?isActive=true&isPublished=true`).catch(err => {
        console.warn("⚠️ Could not fetch seekers:", err.message);
        return { ok: false };
      })
    ]);

    const listings = listingsRes.ok ? await listingsRes.json() : [];
    const seekers = seekersRes.ok ? await seekersRes.json() : [];

    return {
      listings: (Array.isArray(listings) ? listings : [])
        .filter((x) => x.slug)
        .map((x) => ({ slug: x.slug, updatedAt: x.updatedAt })),
      seekers: (Array.isArray(seekers) ? seekers : [])
        .filter((x) => x.slug)
        .map((x) => ({ slug: x.slug, updatedAt: x.updatedAt })),
    };
  } catch (err) {
    console.warn("⚠️ Could not fetch API content:", err.message);
    return { listings: [], seekers: [] };
  }
}

// ------------------------------
// 🧭 SITEMAP GENERATION
// ------------------------------
async function generateSitemap() {
  console.log("🗺️ Generating sitemap.xml...");

  const posts = getAllBlogPosts();
  const { listings, seekers } = await getListingsAndSeekers();

  const smStream = new SitemapStream({ hostname: SITE_URL });

  // ✅ Static pages
  const staticPages = [
    { url: "/", changefreq: "daily", priority: 1.0 },
    { url: "/blog", changefreq: "daily", priority: 0.9 },
    { url: "/oda-ilan-ver", changefreq: "monthly", priority: 0.8 },
    { url: "/oda-arama-ver", changefreq: "monthly", priority: 0.8 },
    { url: "/hakkimizda", changefreq: "monthly", priority: 0.6 },
    { url: "/iletisim", changefreq: "monthly", priority: 0.6 },
    { url: "/guvenli-ilan-rehberi", changefreq: "yearly", priority: 0.5 },
  ];
  staticPages.forEach((p) => smStream.write(p));

  // ✅ Blog posts
  for (const post of posts) {
    smStream.write({
      url: `/blog/${post.slug}`,
      lastmod: post.date,
      changefreq: "monthly",
      priority: 0.7,
    });
  }

  // ✅ Listings
  for (const item of listings) {
    smStream.write({
      url: `/oda-ilani/${item.slug}`,
      lastmod: item.updatedAt || new Date().toISOString(),
      changefreq: "daily",
      priority: 0.9,
    });
  }

  // ✅ Seekers
  for (const item of seekers) {
    smStream.write({
      url: `/oda-arayan/${item.slug}`,
      lastmod: item.updatedAt || new Date().toISOString(),
      changefreq: "daily",
      priority: 0.8,
    });
  }

  smStream.end();
  const sitemapXML = await streamToPromise(smStream);

  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), sitemapXML.toString());
  console.log(
    `✅ Sitemap created successfully with: ${posts.length} blog posts, ${listings.length} listings, ${seekers.length} seekers.`,
  );
}

// ------------------------------
// 📡 RSS GENERATION (Blog Only)
// ------------------------------
function generateRSS() {
  console.log("📡 Generating rss.xml...");
  const posts = getAllBlogPosts();

  const feed = new RSS({
    title: "Odanet Blog",
    description:
      "Oda kiralama, ev arkadaşı bulma ve güvenli yaşam rehberleri hakkında güncel bilgiler.",
    feed_url: `${SITE_URL}/rss.xml`,
    site_url: SITE_URL,
    language: "tr",
    pubDate: new Date().toUTCString(),
    ttl: 60,
  });

  for (const post of posts) {
    feed.item({
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
      date: post.date,
      author: post.author,
      enclosure: post.image ? { url: post.image } : undefined,
    });
  }

  fs.writeFileSync(
    path.join(PUBLIC_DIR, "rss.xml"),
    feed.xml({ indent: true }),
  );
  console.log(`✅ RSS feed created successfully with ${posts.length} posts.`);
}

// ------------------------------
// 🚀 MAIN EXECUTION
// ------------------------------
async function main() {
  console.log("🚀 Starting sitemap + RSS generation...\n");

  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  try {
    await generateSitemap();
    generateRSS();
    console.log("\n✨ All done! SEO files generated successfully.");
    console.log(`📍 ${SITE_URL}/sitemap.xml`);
    console.log(`📍 ${SITE_URL}/rss.xml`);
  } catch (err) {
    console.error("❌ Error generating SEO files:", err);
    process.exit(1);
  }
}

main();
