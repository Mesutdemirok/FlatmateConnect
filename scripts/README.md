# SEO Automation Scripts

## Overview
This directory contains scripts for automating SEO tasks including sitemap generation, RSS feeds, and health monitoring for Odanet.

## Scripts

### 1. generateSitemap.js
Generates comprehensive sitemap.xml and rss.xml files for the entire Odanet platform.

**What it does:**
- Fetches all active listings from `/api/listings`
- Fetches all published seeker profiles from `/api/seekers/public`
- Loads all blog posts from Markdown files in `src/content/blog/`
- Generates `sitemap.xml` with all URLs (static pages, listings, seekers, blog posts)
- Generates `rss.xml` feed for blog content
- Outputs files to `client/public/` directory

**Usage:**
```bash
# Run manually whenever content changes
node scripts/generateSitemap.js
```

**Output:**
- `client/public/sitemap.xml` - Comprehensive sitemap with 40+ URLs
- `client/public/rss.xml` - RSS feed for blog posts

**When to regenerate:**
- After adding new listings
- After publishing new seeker profiles
- After adding new blog posts
- Before deploying to production
- Periodically (e.g., weekly) via cron job

**Current coverage:**
- 7 static pages (homepage, forms, etc.)
- 25 room listings
- 11 seeker profiles
- 3 blog posts
- **Total: 46 URLs**

## SEO Files

### sitemap.xml
Located at: `https://www.odanet.com.tr/sitemap.xml`

Contains all public URLs with:
- Change frequency (daily, weekly, monthly, yearly)
- Priority (0.5 - 1.0)
- Last modification date

### robots.txt
Located at: `https://www.odanet.com.tr/robots.txt`

Instructs search engines to:
- Crawl all pages (Allow: /)
- Avoid API endpoints (Disallow: /api/)
- Avoid admin routes (Disallow: /admin/)
- Use sitemap at specified URL

### rss.xml
Located at: `https://www.odanet.com.tr/rss.xml`

RSS feed for blog content with:
- Post title, description, author
- Publication date
- Featured image
- Full post URL

### 2. seoMonitor.js
Monitors site health, validates SEO elements, and sends optional email alerts.

**What it does:**
- Checks critical URLs return proper status codes (200/304)
- Validates canonical tags point to correct domain
- Checks sitemap.xml accessibility and URL count
- Validates robots.txt format
- Optionally sends email alerts when issues are detected
- Can auto-regenerate sitemap before monitoring

**Usage:**
```bash
# Run basic health check
node scripts/seoMonitor.js

# Regenerate sitemap, then monitor
node scripts/seoMonitor.js --regenerate
```

**Exit codes:**
- `0` - All checks passed
- `1` - Issues found (useful for CI/CD pipelines)

**Email alerts:**
See `scripts/EMAIL_SETUP.md` for configuration instructions.

**What it checks:**
- ✅ Homepage, blog, and form pages accessible
- ✅ Sitemap.xml has 40+ URLs
- ✅ Robots.txt properly formatted
- ✅ Canonical tags use production domain
- ✅ Meta tags present on key pages

## Automation

### Option 1: Manual Workflow

Run before each deployment:
```bash
# Regenerate sitemap
node scripts/generateSitemap.js

# Monitor site health
node scripts/seoMonitor.js
```

### Option 2: Deployment Pipeline

Add to your build/deploy script:
```bash
#!/bin/bash
# Build app
npm run build

# Regenerate SEO files
node scripts/generateSitemap.js

# Monitor and alert
node scripts/seoMonitor.js --regenerate || echo "SEO issues detected"

# Deploy...
```

### Option 3: Scheduled Monitoring (Recommended)

Set up periodic health checks:

```bash
# Example cron jobs

# Regenerate sitemap daily at 2 AM
0 2 * * * cd /path/to/odanet && node scripts/generateSitemap.js

# Monitor site health every 6 hours
0 */6 * * * cd /path/to/odanet && node scripts/seoMonitor.js

# Combined: regenerate + monitor weekly
0 3 * * 0 cd /path/to/odanet && node scripts/seoMonitor.js --regenerate
```

**For Replit:**
Replit doesn't support traditional cron, but you can use:
1. **Replit Cron** (if available in your plan)
2. **External services** like cron-job.org or EasyCron
3. **GitHub Actions** for scheduled workflows

## Google Search Console

After regenerating sitemap:
1. Visit Google Search Console
2. Go to Sitemaps section
3. Submit: `https://www.odanet.com.tr/sitemap.xml`
4. Monitor indexing status

## Dependencies

- `sitemap` - Sitemap XML generation
- `rss` - RSS feed generation
- `gray-matter` - Markdown frontmatter parsing
- `node-fetch` - HTTP requests to API endpoints
