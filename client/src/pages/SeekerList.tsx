import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search as SearchIcon, MapPin } from "lucide-react";
import { SeekerProfileWithRelations } from "@/lib/seekerApi";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";

export default function SeekerList() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const [queryParams, setQueryParams] = useState({
    location: '',
    minBudget: '',
    maxBudget: '',
  });

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setQueryParams({
      location: urlParams.get('location') || '',
      minBudget: urlParams.get('minBudget') || '',
      maxBudget: urlParams.get('maxBudget') || '',
    });
  }, [location]);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.set('isActive', 'true');
    if (queryParams.location) params.set('location', queryParams.location);
    if (queryParams.minBudget) params.set('minBudget', queryParams.minBudget);
    if (queryParams.maxBudget) params.set('maxBudget', queryParams.maxBudget);
    return params.toString();
  };

  const { data: seekers, isLoading, error } = useQuery<SeekerProfileWithRelations[]>({
    queryKey: ['/api/seekers/public', buildQueryString()],
    queryFn: async () => {
      const response = await fetch(`/api/seekers/public?${buildQueryString()}`);
      if (!response.ok) throw new Error('Failed to fetch seekers');
      return response.json();
    }
  });

  const getDisplayName = (seeker: SeekerProfileWithRelations) => {
    if (seeker.fullName) {
      const parts = seeker.fullName.split(" ");
      return parts.length > 1 ? `${parts[0]} ${parts[1].charAt(0)}.` : parts[0];
    }
    if (seeker.user?.firstName && seeker.user?.lastName) {
      return `${seeker.user.firstName} ${seeker.user.lastName.charAt(0)}.`;
    }
    return "Anonim";
  };

  const getPhotoUrl = (seeker: SeekerProfileWithRelations) => {
    if (seeker.profilePhotoUrl) {
      return getAbsoluteImageUrl(seeker.profilePhotoUrl);
    }
    const primaryPhoto = seeker.photos?.find((p) => p.sortOrder === 0) || seeker.photos?.[0];
    if (primaryPhoto?.imagePath) {
      return getAbsoluteImageUrl(primaryPhoto.imagePath);
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(seeker))}&background=8b5cf6&color=fff&size=400`;
  };

  const formatBudget = (budget: string | null) => {
    if (!budget) return "Belirtilmemiş";
    const num = parseFloat(budget);
    return `₺${num.toLocaleString('tr-TR')}/ay`;
  };

  return (
    <div className="min-h-screen bg-background" data-testid="seeker-list-page">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8" data-testid="seeker-list-header">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <SearchIcon className="h-8 w-8" />
            Oda Arayanlar
          </h1>
          {!isLoading && seekers && (
            <p className="text-muted-foreground" data-testid="seekers-count">
              {seekers.length} profil bulundu
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="seekers-loading">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="rounded-2xl shadow-md overflow-hidden">
                <Skeleton className="w-full h-[280px]" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert className="mb-6" data-testid="seekers-error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Profiller yüklenemedi. Lütfen daha sonra tekrar deneyiniz.
            </AlertDescription>
          </Alert>
        )}

        {/* No Results */}
        {!isLoading && !error && seekers && seekers.length === 0 && (
          <div className="text-center py-12" data-testid="no-seekers">
            <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Sonuç Bulunamadı</h3>
            <p className="text-muted-foreground mb-4">
              Arama kriterlerinize uygun oda arayan profil bulunamadı.
            </p>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && !error && seekers && seekers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="seekers-grid">
            {seekers.map((seeker) => (
              <Card
                key={seeker.id}
                className="rounded-2xl shadow-md overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                onClick={() => navigate(`/oda-arayan/${seeker.id}`)}
                data-testid={`seeker-card-${seeker.id}`}
              >
                {/* Photo Section */}
                <div className="relative h-[280px] overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100">
                  <img
                    src={getPhotoUrl(seeker)}
                    alt={getDisplayName(seeker)}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                    data-testid={`seeker-photo-${seeker.id}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Price Badge - Prominent at top */}
                  {seeker.budgetMonthly && (
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 rounded-full shadow-lg font-bold text-sm">
                        {formatBudget(seeker.budgetMonthly)}
                      </div>
                      {seeker.age && (
                        <div className="bg-white/95 text-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                          {seeker.age} yaş
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Name at bottom overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-bold text-white drop-shadow-lg mb-0.5" data-testid={`seeker-name-${seeker.id}`}>
                      {getDisplayName(seeker)}
                    </h3>
                    {seeker.gender && (
                      <p className="text-sm text-white/90 drop-shadow">
                        {seeker.gender === 'male' ? 'Erkek' : seeker.gender === 'female' ? 'Kadın' : seeker.gender}
                      </p>
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <CardContent className="p-4 space-y-2.5">
                  <div className="space-y-1.5 text-sm text-slate-700">
                    {seeker.preferredLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-violet-500 flex-shrink-0" />
                        <span className="truncate font-medium">{seeker.preferredLocation}</span>
                      </div>
                    )}

                    {seeker.occupation && (
                      <div className="text-slate-600 text-xs">
                        {seeker.occupation}
                      </div>
                    )}

                    {/* Preference Badges */}
                    {(seeker.cleanlinessLevel || seeker.smokingPreference || seeker.genderPreference) && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {seeker.cleanlinessLevel && (
                          <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-700 border-0">
                            {seeker.cleanlinessLevel === 'very-clean' ? 'Çok Temiz' : 
                             seeker.cleanlinessLevel === 'clean' ? 'Temiz' : 
                             seeker.cleanlinessLevel === 'average' ? 'Orta' : 'Rahat'}
                          </Badge>
                        )}
                        {seeker.smokingPreference && seeker.smokingPreference !== 'no-preference' && (
                          <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-700 border-0">
                            {seeker.smokingPreference === 'non-smoker' ? 'İçmiyor' : 
                             seeker.smokingPreference === 'smoker' ? 'İçiyor' : 'Sosyal'}
                          </Badge>
                        )}
                        {seeker.genderPreference && seeker.genderPreference !== 'no-preference' && (
                          <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700 border-0">
                            {seeker.genderPreference === 'male' ? 'Erkek Tercih' : 'Kadın Tercih'}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-3 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/oda-arayan/${seeker.id}`);
                    }}
                    data-testid={`seeker-details-btn-${seeker.id}`}
                  >
                    Profili Görüntüle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
