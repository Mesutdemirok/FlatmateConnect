# SEO Automation Scripts

## Overview
This directory contains scripts for automating SEO tasks including sitemap generation and RSS feed creation for Odanet.

## Scripts

### generateSitemap.js
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

## Automation

For production, consider adding to your deployment pipeline:

```bash
# In your build/deploy script
node scripts/generateSitemap.js
```

Or set up a scheduled task to regenerate periodically:

```bash
# Example cron job (daily at 2 AM)
0 2 * * * cd /path/to/project && node scripts/generateSitemap.js
```

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
