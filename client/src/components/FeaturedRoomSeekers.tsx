import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { SeekerProfileWithRelations, fetchFeaturedSeekers } from "@/lib/seekerApi";
import { MapPin, Calendar, DollarSign } from "lucide-react";

export default function FeaturedRoomSeekers() {
  const [, navigate] = useLocation();

  const {
    data: seekers,
    isLoading,
    error,
  } = useQuery<SeekerProfileWithRelations[]>({
    queryKey: ["/api/seekers/featured"],
    queryFn: async () => {
      const res = await fetch("/api/seekers/featured?count=4");
      if (!res.ok) throw new Error("Failed to fetch seekers");
      const data = await res.json();
      console.log("Seekers data:", data, "Type:", Array.isArray(data), "Length:", data?.length);
      return data;
    },
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
    // Use profilePhotoUrl if available
    if (seeker.profilePhotoUrl) {
      return seeker.profilePhotoUrl;
    }
    // Fallback to photos array
    const primaryPhoto = seeker.photos?.find((p) => p.sortOrder === 0) || seeker.photos?.[0];
    if (primaryPhoto) {
      return `/uploads/seekers/${primaryPhoto.imagePath}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(seeker))}&background=8b5cf6&color=fff&size=400`;
  };

  const formatBudget = (budget: string | null) => {
    if (!budget) return "Belirtilmemiş";
    const num = parseFloat(budget);
    return `₺${num.toLocaleString('tr-TR')}/ay`;
  };

  if (isLoading) {
    return (
      <div
        className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        data-testid="featured-seekers-loading"
      >
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="rounded-2xl shadow-md overflow-hidden border border-slate-200"
          >
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
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600 font-medium" data-testid="featured-seekers-error">
        Oda arayan profiller yüklenemedi.
      </div>
    );
  }

  if (!seekers || seekers.length === 0) {
    return null;
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Oda Arayanlar
        </h2>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        data-testid="featured-seekers-grid"
      >
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              {seeker.age && (
                <Badge className="absolute top-3 right-3 bg-white/95 text-indigo-700 border-0">
                  {seeker.age} yaş
                </Badge>
              )}
            </div>

            {/* Info Section */}
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1" data-testid={`seeker-name-${seeker.id}`}>
                  {getDisplayName(seeker)}
                </h3>
                {seeker.gender && (
                  <p className="text-sm text-slate-500">
                    {seeker.gender === 'male' ? 'Erkek' : seeker.gender === 'female' ? 'Kadın' : seeker.gender}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                {seeker.budgetMonthly && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-indigo-500" />
                    <span>{formatBudget(seeker.budgetMonthly)}</span>
                  </div>
                )}
                
                {seeker.preferredLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <span className="truncate">{seeker.preferredLocation}</span>
                  </div>
                )}

                {seeker.occupation && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{seeker.occupation}</span>
                  </div>
                )}

                {/* Preference Badges */}
                {(seeker.cleanlinessLevel || seeker.smokingPreference || seeker.genderPreference) && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {seeker.cleanlinessLevel && (
                      <Badge variant="secondary" className="text-xs">
                        {seeker.cleanlinessLevel === 'very-clean' ? 'Çok Temiz' : 
                         seeker.cleanlinessLevel === 'clean' ? 'Temiz' : 
                         seeker.cleanlinessLevel === 'average' ? 'Orta' : 'Rahat'}
                      </Badge>
                    )}
                    {seeker.smokingPreference && seeker.smokingPreference !== 'no-preference' && (
                      <Badge variant="secondary" className="text-xs">
                        {seeker.smokingPreference === 'non-smoker' ? 'İçmiyor' : 
                         seeker.smokingPreference === 'smoker' ? 'İçiyor' : 'Sosyal'}
                      </Badge>
                    )}
                    {seeker.genderPreference && seeker.genderPreference !== 'no-preference' && (
                      <Badge variant="secondary" className="text-xs">
                        {seeker.genderPreference === 'male' ? 'Erkek Tercih' : 'Kadın Tercih'}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
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
    </div>
  );
}
