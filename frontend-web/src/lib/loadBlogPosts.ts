import matter from 'gray-matter';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author?: string;
  image?: string;
  content: string;
  readingTime: string;
}

// Calculate reading time (browser-friendly version)
function calculateReadingTime(text: string): string {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  
  if (minutes === 1) {
    return '1 dakika okuma';
  }
  return `${minutes} dakika okuma`;
}

// Import all markdown files from the content directory
const blogPostModules = import.meta.glob('../../../src/content/blog/*.md', { 
  query: '?raw',
  import: 'default',
  eager: true
});

export function getAllBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [];

  for (const [path, rawContent] of Object.entries(blogPostModules)) {
    try {
      // rawContent is already a string from the ?raw query
      const { data, content: markdown } = matter(rawContent as string);
      
      const post: BlogPost = {
        slug: data.slug || '',
        title: data.title || 'Untitled',
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        author: data.author,
        image: data.image || '/public/blog/generated/default.jpg',
        content: markdown,
        readingTime: calculateReadingTime(markdown),
      };

      posts.push(post);
    } catch (error) {
      console.error(`Error parsing blog post from ${path}:`, error);
    }
  }

  // Sort by date, newest first
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const posts = getAllBlogPosts();
  return posts.find(post => post.slug === slug);
}

export function generateFallbackThumbnail(title: string): string {
  // For now, return a placeholder. This will be enhanced with sharp later
  const encodedTitle = encodeURIComponent(title);
  return `https://via.placeholder.com/1200x675/0EA5A7/FFFFFF?text=${encodedTitle}`;
}
