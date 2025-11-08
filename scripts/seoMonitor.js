/**
 * seoMonitor.js — Odanet SEO Health Monitor
 * Checks site health, validates SEO elements, and sends alerts
 */

import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import nodemailer from "nodemailer";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Configuration
const SITE_URL = process.env.SITE_URL || "https://www.odanet.com.tr";
const DEV_URL = "http://localhost:5000";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const BASE_URL = IS_PRODUCTION ? SITE_URL : DEV_URL;

// Email configuration (optional)
const ALERT_EMAIL = process.env.ALERT_EMAIL_USER;
const ALERT_EMAIL_PASS = process.env.ALERT_EMAIL_PASS;
const ALERT_TO = process.env.ALERT_TO_EMAIL || "admin@odanet.com.tr";

// URLs to monitor
const CRITICAL_URLS = [
  "/",
  "/sitemap.xml",
  "/robots.txt",
  "/blog",
  "/oda-ilan-ver",
  "/oda-arama-ver",
];

// ───────────────────────────────────────────────
// 1️⃣ Health Check - URL Status Codes
// ───────────────────────────────────────────────
async function checkUrl(url) {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  
  try {
    const res = await fetch(fullUrl, {
      method: "GET",
      headers: { "User-Agent": "Odanet-SEO-Monitor/1.0" },
      redirect: "manual", // Don't auto-follow redirects
    });

    const status = res.status;
    const isOk = status === 200 || status === 304;
    const isRedirect = status >= 300 && status < 400;
    
    let canonical = null;
    let title = null;
    let description = null;
    
    // Parse HTML for SEO elements
    if (res.headers.get("content-type")?.includes("text/html")) {
      const html = await res.text();
      const dom = new JSDOM(html);
      const doc = dom.window.document;

      const canonicalLink = doc.querySelector("link[rel='canonical']");
      canonical = canonicalLink ? canonicalLink.href : null;
      
      const titleTag = doc.querySelector("title");
      title = titleTag ? titleTag.textContent : null;
      
      const metaDesc = doc.querySelector("meta[name='description']");
      description = metaDesc ? metaDesc.getAttribute("content") : null;
    }

    const result = {
      url: fullUrl,
      path: url,
      status,
      isOk,
      isRedirect,
      canonical,
      title,
      description,
      error: null,
    };

    // Log result
    const icon = isOk ? "✅" : isRedirect ? "🔀" : "❌";
    console.log(`${icon} ${url} → ${status}${canonical ? ` | Canonical: ${canonical}` : ""}`);

    return result;
  } catch (err) {
    console.error(`❌ ${url} → Failed: ${err.message}`);
    return {
      url: fullUrl,
      path: url,
      status: 0,
      isOk: false,
      isRedirect: false,
      canonical: null,
      title: null,
      description: null,
      error: err.message,
    };
  }
}

// ───────────────────────────────────────────────
// 2️⃣ Sitemap Validation
// ───────────────────────────────────────────────
async function validateSitemap() {
  console.log("\n🗺️ Validating sitemap...");
  
  try {
    const res = await fetch(`${BASE_URL}/sitemap.xml`);
    
    if (res.status !== 200) {
      return { valid: false, error: `Sitemap returned ${res.status}` };
    }

    const xml = await res.text();
    
    // Basic XML validation
    if (!xml.includes("<urlset") || !xml.includes("</urlset>")) {
      return { valid: false, error: "Invalid sitemap XML structure" };
    }

    // Count URLs
    const urlMatches = xml.match(/<loc>/g);
    const urlCount = urlMatches ? urlMatches.length : 0;

    console.log(`✅ Sitemap valid with ${urlCount} URLs`);
    return { valid: true, urlCount, error: null };
  } catch (err) {
    return { valid: false, urlCount: 0, error: err.message };
  }
}

// ───────────────────────────────────────────────
// 3️⃣ Robots.txt Validation
// ───────────────────────────────────────────────
async function validateRobots() {
  console.log("\n🤖 Validating robots.txt...");
  
  try {
    const res = await fetch(`${BASE_URL}/robots.txt`);
    
    if (res.status !== 200) {
      return { valid: false, error: `Robots.txt returned ${res.status}` };
    }

    const text = await res.text();
    
    // Check for required directives
    const hasUserAgent = text.includes("User-agent:");
    const hasSitemap = text.includes("Sitemap:");
    
    if (!hasUserAgent) {
      return { valid: false, error: "Missing User-agent directive" };
    }

    console.log(`✅ Robots.txt valid${hasSitemap ? " with sitemap reference" : ""}`);
    return { valid: true, hasSitemap, error: null };
  } catch (err) {
    return { valid: false, hasSitemap: false, error: err.message };
  }
}

// ───────────────────────────────────────────────
// 4️⃣ Auto-Regenerate Sitemap
// ───────────────────────────────────────────────
async function regenerateSitemap() {
  console.log("\n🔄 Regenerating sitemap...");
  
  try {
    const { stdout, stderr } = await execAsync("node scripts/generateSitemap.js");
    console.log(stdout);
    
    if (stderr) {
      console.error("Sitemap generation warnings:", stderr);
    }
    
    return { success: true, error: null };
  } catch (err) {
    console.error("❌ Failed to regenerate sitemap:", err.message);
    return { success: false, error: err.message };
  }
}

// ───────────────────────────────────────────────
// 5️⃣ Email Alert System
// ───────────────────────────────────────────────
async function sendAlert(issues) {
  if (!ALERT_EMAIL || !ALERT_EMAIL_PASS) {
    console.log("\n⚠️ Email alerts not configured (missing credentials)");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ALERT_EMAIL,
        pass: ALERT_EMAIL_PASS,
      },
    });

    const issueList = issues.map(i => `• ${i.type}: ${i.message}`).join("\n");

    const message = {
      from: `"Odanet SEO Monitor" <${ALERT_EMAIL}>`,
      to: ALERT_TO,
      subject: "🚨 Odanet SEO Health Alert",
      text: `SEO monitoring detected the following issues:\n\n${issueList}\n\nPlease investigate and resolve these issues.`,
      html: `
        <h2>🚨 SEO Health Alert</h2>
        <p>SEO monitoring detected the following issues:</p>
        <ul>
          ${issues.map(i => `<li><strong>${i.type}:</strong> ${i.message}</li>`).join("")}
        </ul>
        <p>Please investigate and resolve these issues.</p>
        <hr>
        <small>Sent by Odanet SEO Monitor</small>
      `,
    };

    await transporter.sendMail(message);
    console.log("📧 Alert email sent successfully");
    return true;
  } catch (err) {
    console.error("❌ Failed to send alert email:", err.message);
    return false;
  }
}

// ───────────────────────────────────────────────
// 6️⃣ Main Orchestrator
// ───────────────────────────────────────────────
async function runMonitor() {
  console.log("🚀 Odanet SEO Monitor Started");
  console.log(`📍 Checking: ${BASE_URL}`);
  console.log(`⏰ ${new Date().toISOString()}\n`);

  const issues = [];

  // Check all critical URLs
  console.log("🔍 Checking critical URLs...\n");
  const urlResults = await Promise.all(CRITICAL_URLS.map(checkUrl));
  
  urlResults.forEach(result => {
    if (!result.isOk && !result.isRedirect) {
      issues.push({
        type: "URL Error",
        message: `${result.path} returned ${result.status || "failed"}${result.error ? ` (${result.error})` : ""}`,
      });
    }

    // Check canonical tags for HTML pages
    if (result.canonical && !result.canonical.startsWith(SITE_URL)) {
      issues.push({
        type: "Canonical Mismatch",
        message: `${result.path} has wrong canonical: ${result.canonical}`,
      });
    }

    // Check for missing meta tags
    if (result.title && result.path === "/" && !result.title.includes("Odanet")) {
      issues.push({
        type: "Missing Meta",
        message: `Homepage title missing brand name`,
      });
    }
  });

  // Validate sitemap
  const sitemapResult = await validateSitemap();
  if (!sitemapResult.valid) {
    issues.push({
      type: "Sitemap Error",
      message: sitemapResult.error,
    });
  } else if (sitemapResult.urlCount < 10) {
    issues.push({
      type: "Sitemap Warning",
      message: `Only ${sitemapResult.urlCount} URLs in sitemap (expected 40+)`,
    });
  }

  // Validate robots.txt
  const robotsResult = await validateRobots();
  if (!robotsResult.valid) {
    issues.push({
      type: "Robots.txt Error",
      message: robotsResult.error,
    });
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 MONITORING SUMMARY");
  console.log("=".repeat(50));
  console.log(`✅ URLs checked: ${urlResults.length}`);
  console.log(`❌ Issues found: ${issues.length}`);
  
  if (issues.length > 0) {
    console.log("\n🚨 ISSUES:");
    issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. [${issue.type}] ${issue.message}`);
    });

    // Send alert if configured
    await sendAlert(issues);
  } else {
    console.log("\n✨ All checks passed! Site is healthy.");
  }

  console.log("\n" + "=".repeat(50));
  
  return {
    healthy: issues.length === 0,
    issueCount: issues.length,
    issues,
    timestamp: new Date().toISOString(),
  };
}

// ───────────────────────────────────────────────
// 🚀 Execute
// ───────────────────────────────────────────────
const args = process.argv.slice(2);
const shouldRegenerateSitemap = args.includes("--regenerate");

(async () => {
  try {
    // Optionally regenerate sitemap first
    if (shouldRegenerateSitemap) {
      await regenerateSitemap();
      console.log("\n");
    }

    // Run monitoring
    const result = await runMonitor();
    
    // Exit with code 1 if issues found (useful for CI/CD)
    process.exit(result.healthy ? 0 : 1);
  } catch (err) {
    console.error("\n❌ Monitor failed:", err);
    process.exit(1);
  }
})();
