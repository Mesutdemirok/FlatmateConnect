import type { Request, Response } from "express";
import { storage } from "./storage";

const BOT_RE = /(facebookexternalhit|whatsapp|twitterbot|slackbot|linkedinbot|telegram|discord|pinterest)/i;
const BASE = "https://www.odanet.com.tr";

// Helper to get absolute image URL
function getAbsoluteImageUrl(path: string | null | undefined): string {
  const FALLBACK = `${BASE}/og/og-home.jpg`;
  
  if (!path) return FALLBACK;
  
  // If already absolute URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    // Normalize R2 URL to use custom domain if configured
    const customDomain = process.env.R2_PUBLIC_URL || '';
    if (customDomain && path.includes('.r2.dev')) {
      const r2Pattern = /https?:\/\/pub-[a-zA-Z0-9]+\.r2\.dev/;
      return path.replace(r2Pattern, customDomain);
    }
    return path;
  }
  
  const publicUrl = process.env.R2_PUBLIC_URL;
  const isProduction = process.env.NODE_ENV?.trim().toLowerCase() === "production";
  
  // Use R2 in production
  if (isProduction && publicUrl) {
    return `${publicUrl}/${path.replace(/^\/+/, "")}`;
  }
  
  // Development: return as relative path (will be served by local server)
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

function ogHtml({ 
  title, 
  description, 
  url, 
  image 
}: { 
  title: string; 
  description: string; 
  url: string; 
  image: string; 
}) {
  return `<!doctype html><html lang="tr"><head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="icon" href="/favicon.ico" /><link rel="canonical" href="${url}" />
<title>${title}</title>
<meta name="description" content="${description}" />
<meta property="og:type" content="article" /><meta property="og:site_name" content="Odanet" />
<meta property="og:url" content="${url}" /><meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" /><meta property="og:image" content="${image}" />
<meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" /><meta name="twitter:image" content="${image}" />
</head><body><script>location.replace("${url}");</script></body></html>`;
}

export async function ogHandler(req: Request, res: Response, next: () => void) {
  const ua = String(req.headers["user-agent"] || "");
  const isBot = BOT_RE.test(ua) || req.query._og === "1"; // allow manual check with ?_og=1
  
  // Non-bots continue to the SPA
  if (!isBot) {
    return next();
  }

  try {
    // Listing detail
    if (req.path.startsWith("/oda-ilani/")) {
      const id = req.params.id || req.path.split("/oda-ilani/")[1]?.split("?")[0];
      if (!id) return next();
      
      const listing = await storage.getListing(id);
      if (!listing) {
        return res.status(404).send("Listing not found");
      }
      
      const title = listing.title || "Oda ilanı";
      const locationParts = [listing.address].filter(Boolean);
      const desc = locationParts.join(" • ") || "Odanet üzerinde yayınlanan oda ilanı";
      const firstImg = listing.images?.find(img => img.isPrimary)?.imagePath || listing.images?.[0]?.imagePath;
      const image = firstImg ? getAbsoluteImageUrl(firstImg) : `${BASE}/og/og-home.jpg`;
      
      return res.send(ogHtml({ 
        title: `${title} – Odanet`, 
        description: desc, 
        url: `${BASE}/oda-ilani/${id}`, 
        image 
      }));
    }

    // Seeker detail
    if (req.path.startsWith("/oda-arayan/")) {
      const id = req.params.id || req.path.split("/oda-arayan/")[1]?.split("?")[0];
      if (!id) return next();
      
      const seeker = await storage.getSeekerProfile(id);
      if (!seeker) {
        return res.status(404).send("Seeker profile not found");
      }
      
      const displayName = seeker.fullName || seeker.user?.firstName || "Kullanıcı";
      const desc = seeker.preferredLocation 
        ? `Tercih edilen bölge: ${seeker.preferredLocation}` 
        : "Odanet üzerinde oda arayan kullanıcı profili";
      const photo = seeker.profilePhotoUrl || seeker.photos?.[0]?.imagePath;
      const image = photo ? getAbsoluteImageUrl(photo) : `${BASE}/og/og-home.jpg`;
      
      return res.send(ogHtml({ 
        title: `${displayName} – Oda arıyor`, 
        description: desc, 
        url: `${BASE}/oda-arayan/${id}`, 
        image 
      }));
    }

    // Homepage fallback
    if (req.path === "/" || req.path === "") {
      return res.send(ogHtml({
        title: "Odanet – Güvenli, kolay ve şeffaf oda & ev arkadaşı bul",
        description: "Doğrulanmış profiller ve gerçek ilanlarla sana en uygun oda ya da ev arkadaşını hemen bul.",
        url: `${BASE}/`,
        image: `${BASE}/og/og-home.jpg`,
      }));
    }

    // For other routes, continue to SPA
    return next();
  } catch (error) {
    console.error("OG handler error:", error);
    return next();
  }
}
