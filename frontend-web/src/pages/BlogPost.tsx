import { Helmet } from "react-helmet";
import { useParams, Link } from "wouter";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { getBlogPostBySlug } from "@/lib/loadBlogPosts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPostBySlug(slug || "");

  // 404 - Post not found
  if (!post) {
    return (
      <>
        <Helmet>
          <title>Blog Yazısı Bulunamadı - Odanet</title>
        </Helmet>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Blog Yazısı Bulunamadı
              </h2>
              <p className="text-muted-foreground mb-8">
                Aradığınız blog yazısı mevcut değil veya kaldırılmış olabilir.
              </p>
              <Link href="/blog">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Blog Sayfasına Dön
                </Button>
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // Reading time is already calculated in the post object

  return (
    <>
      <Helmet>
        <title>{post.title} - Odanet Blog</title>
        <meta name="description" content={post.description} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={`${post.title} - Odanet Blog`} />
        <meta property="og:description" content={post.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.odanet.com.tr/blog/${post.slug}`} />
        {post.image && <meta property="og:image" content={post.image} />}
        <meta property="article:published_time" content={post.date} />
        {post.author && <meta property="article:author" content={post.author} />}
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} - Odanet Blog`} />
        <meta name="twitter:description" content={post.description} />
        {post.image && <meta name="twitter:image" content={post.image} />}
        
        {/* Canonical Link */}
        <link rel="canonical" href={`https://www.odanet.com.tr/blog/${post.slug}`} />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1">
          {/* Back Button */}
          <div className="max-w-4xl mx-auto px-4 pt-8">
            <Link href="/blog">
              <Button 
                variant="ghost" 
                className="mb-6 -ml-2"
                data-testid="back-to-blog"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Blog'a Geri Dön
              </Button>
            </Link>
          </div>

          {/* Article Header */}
          <article className="max-w-4xl mx-auto px-4 pb-16">
            {/* Featured Image */}
            {post.image && (
              <div className="aspect-video rounded-2xl overflow-hidden mb-8 shadow-lg">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title */}
            <h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight"
              data-testid="blog-post-title"
            >
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.date}>
                  {format(new Date(post.date), "d MMMM yyyy", { locale: tr })}
                </time>
              </div>
              
              {post.author && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.readingTime}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {post.description}
            </p>

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-6
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-strong:font-semibold
                prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                prose-li:text-foreground prose-li:mb-2
                prose-img:rounded-lg prose-img:shadow-md prose-img:my-8
                prose-blockquote:border-l-4 prose-blockquote:border-primary 
                prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
                prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                dark:prose-invert"
              data-testid="blog-post-content"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Share Section */}
            <div className="mt-16 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                Bu yazıyı faydalı buldunuz mu? Arkadaşlarınızla paylaşın! 🏠
              </p>
            </div>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}
