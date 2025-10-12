import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation as useRouterLocation, useSearch } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, X } from "lucide-react";

export default function SearchPage() {
  const searchString = useSearch();
  const [, navigate] = useRouterLocation();
  const params = new URLSearchParams(searchString);
  
  const city = params.get('il') || '';
  const district = params.get('ilce') || '';
  const neighborhood = params.get('mahalle') || '';

  // Fetch location data to display names
  const { data: locations } = useQuery({
    queryKey: ['/api/locations'],
    staleTime: 24 * 60 * 60 * 1000,
  });

  // Fetch search results
  const { data: results, isLoading } = useQuery({
    queryKey: ['/api/search', city, district, neighborhood],
    enabled: !!city && !!district,
  });

  const getLocationNames = () => {
    if (!locations) return null;
    
    const cityData = locations.find((c: any) => c.slug === city);
    if (!cityData) return null;
    
    const districtData = cityData.districts.find((d: any) => d.slug === district);
    const neighborhoodData = neighborhood && districtData?.neighborhoods.find((n: any) => n.slug === neighborhood);
    
    return {
      cityName: cityData.city,
      districtName: districtData?.district,
      neighborhoodName: neighborhoodData?.name
    };
  };

  const locationNames = getLocationNames();

  const handleClearFilter = () => {
    navigate('/arama');
  };

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
        {/* Location Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Arama Sonuçları
              </h1>
              {locationNames && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {locationNames.cityName}
                    {locationNames.districtName && ` / ${locationNames.districtName}`}
                    {locationNames.neighborhoodName && ` / ${locationNames.neighborhoodName}`}
                  </span>
                </div>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={handleClearFilter}
              data-testid="clear-filter-button"
            >
              <X className="h-4 w-4 mr-2" />
              Filtreyi Sıfırla
            </Button>
          </div>
        </div>

        {/* Results Tabs */}
        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="listings" data-testid="tab-listings">
              İlanlar ({results?.listings?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="seekers" data-testid="tab-seekers">
              Oda Arayanlar ({results?.seekers?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : results?.listings && results.listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.listings.map((listing: any) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">
                    Bu konumda ilan bulunamadı.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Seekers Tab */}
          <TabsContent value="seekers" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-64 w-full" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : results?.seekers && results.seekers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {results.seekers.map((seeker: any) => (
                  <Card
                    key={seeker.id}
                    className="rounded-2xl shadow-md overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                    onClick={() => navigate(`/oda-arayan/${seeker.id}`)}
                    data-testid={`seeker-card-${seeker.id}`}
                  >
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100">
                      <img
                        src={seeker.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(seeker.fullName || 'A')}&background=8b5cf6&color=fff&size=400`}
                        alt={seeker.fullName}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {seeker.fullName || 'İsimsiz'}
                      </h3>
                      <p className="text-sm text-slate-600 truncate">
                        {seeker.preferredLocation || 'Lokasyon belirtilmedi'}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">
                    Bu konumda oda arayan profili bulunamadı.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
