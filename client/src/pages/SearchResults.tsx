import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Home, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SearchResults() {
  const [location] = useLocation();
  const params = new URLSearchParams(window.location.search);
  
  const type = params.get('type') || 'listing';
  const citySlug = params.get('il') || '';
  const districtSlug = params.get('ilce') || '';
  const neighborhoodSlug = params.get('mahalle') || '';
  const queryText = params.get('q') || '';

  const { data, isLoading } = useQuery<any>({
    queryKey: ['/api/search', { type, il: citySlug, ilce: districtSlug, mahalle: neighborhoodSlug, q: queryText }],
    enabled: !!(citySlug || queryText),
  });

  const results = type === 'listing' ? (data?.listings || []) : (data?.seekers || []);

  const getLocationDisplay = () => {
    const parts = [];
    if (citySlug) parts.push(citySlug.charAt(0).toUpperCase() + citySlug.slice(1));
    if (districtSlug) parts.push(districtSlug.charAt(0).toUpperCase() + districtSlug.slice(1));
    if (neighborhoodSlug) parts.push(neighborhoodSlug.charAt(0).toUpperCase() + neighborhoodSlug.slice(1));
    return parts.join(' / ') || 'Türkiye';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <MapPin className="h-4 w-4" />
          <span data-testid="breadcrumb-location">{getLocationDisplay()}</span>
          {queryText && <span> • "{queryText}"</span>}
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-results">
            {type === 'listing' ? 'Oda İlanları' : 'Oda Arayanlar'}
          </h1>
          <p className="text-muted-foreground">
            {isLoading ? 'Aranıyor...' : `${results.length} sonuç bulundu`}
          </p>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : results.length === 0 ? (
          <Card data-testid="empty-state">
            <CardContent className="p-12 text-center">
              {type === 'listing' ? <Home className="h-16 w-16 mx-auto mb-4 text-muted-foreground" /> : <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />}
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Bu bölgede sonuç bulunamadı
              </h2>
              <p className="text-muted-foreground mb-6">
                {type === 'listing' 
                  ? 'Bu bölgede henüz ilan bulunmuyor. Farklı bir bölge deneyin.' 
                  : 'Bu bölgede oda arayan bulunamadı. Farklı bir bölge deneyin.'}
              </p>
              <Button onClick={() => window.location.href = '/'} data-testid="button-home">
                Ana Sayfaya Dön
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item: any, index: number) => (
              <Card key={item.id} data-testid={`result-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                {type === 'listing' ? (
                  <>
                    <div className="h-48 bg-muted relative">
                      {item.images?.[0] && (
                        <img 
                          src={item.images[0].imagePath} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-1 line-clamp-1" data-testid={`title-${index}`}>
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.district || item.city}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {item.rentAmount} ₺/ay
                      </p>
                      <Button 
                        className="w-full mt-3" 
                        onClick={() => window.location.href = `/oda-ilani/${item.id}`}
                        data-testid={`button-view-${index}`}
                      >
                        İlanı Gör
                      </Button>
                    </CardContent>
                  </>
                ) : (
                  <>
                    <div className="h-56 bg-muted relative">
                      {item.profilePhotoUrl && (
                        <img 
                          src={item.profilePhotoUrl} 
                          alt={item.fullName}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-1" data-testid={`name-${index}`}>
                        {item.fullName || 'İsimsiz'}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.district ? `${item.city} / ${item.district}` : item.city}
                      </p>
                      {item.budgetMonthly && (
                        <p className="text-sm font-medium mb-3">
                          Bütçe: {item.budgetMonthly}
                        </p>
                      )}
                      <Button 
                        className="w-full" 
                        onClick={() => window.location.href = `/oda-arayan/${item.id}`}
                        data-testid={`button-view-${index}`}
                      >
                        Profili Gör
                      </Button>
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
