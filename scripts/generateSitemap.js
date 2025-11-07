import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SitemapStream, streamToPromise } from 'sitemap';
import RSS from 'rss';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://www.odanet.com.tr';
const BLOG_DIR = path.join(__dirname, '../src/content/blog');
const PUBLIC_DIR = path.join(__dirname, '../public');

// Read all blog posts
function getAllBlogPosts() {
  const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.md'));
  const posts = [];

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);

    posts.push({
      slug: data.slug,
      title: data.title,
      description: data.description,
      date: data.date,
      author: data.author,
      image: data.image
    });
  }

  // Sort by date, newest first
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Generate sitemap.xml
async function generateSitemap() {
  console.log('🗺️  Generating sitemap.xml...');
  
  const posts = getAllBlogPosts();
  const smStream = new SitemapStream({ hostname: SITE_URL });

  // Static pages
  const staticPages = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/blog', changefreq: 'daily', priority: 0.9 },
    { url: '/oda-ilanlari', changefreq: 'hourly', priority: 0.9 },
    { url: '/oda-aramalari', changefreq: 'hourly', priority: 0.9 },
    { url: '/hakkimizda', changefreq: 'monthly', priority: 0.6 },
    { url: '/iletisim', changefreq: 'monthly', priority: 0.6 },
    { url: '/kullanim-kosullari', changefreq: 'yearly', priority: 0.4 },
    { url: '/gizlilik-politikasi', changefreq: 'yearly', priority: 0.4 },
  ];

  // Add static pages
  staticPages.forEach(page => {
    smStream.write(page);
  });

  // Add blog posts
  posts.forEach(post => {
    smStream.write({
      url: `/blog/${post.slug}`,
      changefreq: 'monthly',
      priority: 0.7,
      lastmod: post.date
    });
  });

  smStream.end();

  const sitemapXML = await streamToPromise(smStream);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapXML.toString());
  
  console.log('✅ sitemap.xml generated successfully!');
}

// Generate RSS feed
function generateRSS() {
  console.log('📡 Generating rss.xml...');
  
  const posts = getAllBlogPosts();

  const feed = new RSS({
    title: 'Odanet Blog',
    description: 'Oda kiralama, ev arkadaşı bulma ve güvenli yaşam alanı oluşturma hakkında faydalı bilgiler ve ipuçları',
    feed_url: `${SITE_URL}/rss.xml`,
    site_url: SITE_URL,
    language: 'tr',
    pubDate: new Date().toUTCString(),
    ttl: 60,
  });

  posts.forEach(post => {
    feed.item({
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
      date: post.date,
      author: post.author || 'Odanet Ekibi',
      enclosure: post.image ? { url: post.image } : undefined,
    });
  });

  const rssXML = feed.xml({ indent: true });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'rss.xml'), rssXML);
  
  console.log('✅ rss.xml generated successfully!');
}

// Main execution
async function main() {
  console.log('🚀 Starting sitemap and RSS generation...\n');
  
  // Ensure public directory exists
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  try {
    await generateSitemap();
    generateRSS();
    
    console.log('\n✨ All done! Sitemap and RSS feed generated successfully.');
    console.log(`📍 Sitemap: ${SITE_URL}/sitemap.xml`);
    console.log(`📍 RSS Feed: ${SITE_URL}/rss.xml`);
  } catch (error) {
    console.error('❌ Error generating files:', error);
    process.exit(1);
  }
}

main();
