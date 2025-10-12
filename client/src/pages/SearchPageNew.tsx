import { useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function SearchPageNew() {
  const searchString = useSearch();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(searchString);
  
  const city = params.get('il') || '';
  const district = params.get('ilce') || '';
  const neighborhood = params.get('mahalle') || '';

  // Fetch search results
  const { data: results, isLoading } = useQuery<any>({
    queryKey: ['/api/search', city, district, neighborhood],
    enabled: !!city && !!district,
  });

  if (!city || !district) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Arama Yapın
              </h2>
              <p className="text-muted-foreground mb-6">
                İlan ve oda arayan aramak için ana sayfadaki arama çubuğunu kullanın
              </p>
              <Button onClick={() => navigate('/')}>
                Ana Sayfaya Dön
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Arama Sonuçları
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {city} / {district}
              {neighborhood && ` / ${neighborhood}`}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Yükleniyor...</div>
        ) : results && results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item: any) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{item.title || 'İlan'}</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {item.description?.substring(0, 100)}...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Bu bölgede sonuç bulunamadı
              </p>
            </CardContent>
          </Card>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
