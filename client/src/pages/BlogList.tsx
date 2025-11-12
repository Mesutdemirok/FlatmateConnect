import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Calendar, ArrowRight, BookOpen, Clock } from "lucide-react";
import { getAllBlogPosts } from "@/lib/loadBlogPosts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function BlogList() {
  const posts = getAllBlogPosts();

  return (
    <>
      <Helmet>
        <title>Blog - Odanet | Oda Kiralama ve Ev Arkadaşı Bulma İpuçları</title>
        <meta 
          name="description" 
          content="Oda kiralama, ev arkadaşı bulma ve güvenli yaşam alanı oluşturma hakkında faydalı bilgiler ve ipuçları. Odanet blog sayfası." 
        />
        <meta property="og:title" content="Blog - Odanet | Oda Kiralama İpuçları" />
        <meta 
          property="og:description" 
          content="Oda kiralama, ev arkadaşı bulma ve güvenli yaşam alanı oluşturma hakkında faydalı bilgiler ve ipuçları." 
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.odanet.com.tr/blog" />
        <link rel="canonical" href="https://www.odanet.com.tr/blog" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-primary/10 via-background to-orange-50 py-16 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h1 
                className="text-4xl md:text-5xl font-bold text-foreground mb-4"
                data-testid="blog-title"
              >
                Odanet Blog
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Oda kiralama, ev arkadaşı bulma ve güvenli yaşam alanı oluşturma hakkında 
                faydalı bilgiler ve ipuçları
              </p>
            </div>
          </section>

          {/* Blog Posts Grid */}
          <section className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link 
                    key={post.slug} 
                    href={`/blog/${post.slug}`}
                    data-testid={`blog-card-${post.slug}`}
                  >
                    <article className="group bg-card rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-border h-full flex flex-col hover:-translate-y-1">
                      {/* Image */}
                      {post.image && (
                        <div className="aspect-video overflow-hidden bg-muted">
                          <img 
                            src={post.image} 
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        {/* Date, Author & Reading Time */}
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <time dateTime={post.date}>
                              {format(new Date(post.date), "d MMMM yyyy", { locale: tr })}
                            </time>
                          </div>
                          {post.author && (
                            <span className="text-xs">• {post.author}</span>
                          )}
                          {post.readingTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span className="text-xs">{post.readingTime}</span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h2>

                        {/* Description */}
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                          {post.description}
                        </p>

                        {/* Read More Link */}
                        <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                          <span>Devamını Oku</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {/* Empty State */}
              {posts.length === 0 && (
                <div className="text-center py-16">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Henüz blog yazısı yok
                  </h3>
                  <p className="text-muted-foreground">
                    Yakında faydalı içeriklerle buradayız!
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
