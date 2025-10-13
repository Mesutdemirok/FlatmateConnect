import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { SeekerProfileWithRelations } from "@/lib/seekerApi";
import { ShieldCheck } from "lucide-react";

export default function FeaturedRoomSeekers() {
  const [, navigate] = useLocation();

  const {
    data: seekers,
    isLoading,
    error,
  } = useQuery<SeekerProfileWithRelations[]>({
    queryKey: ["/api/seekers/public"],
    queryFn: async () => {
      const res = await fetch("/api/seekers/public?limit=4");
      if (!res.ok) throw new Error("Failed to fetch seekers");
      const data = await res.json();
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

  const getPreferredLocations = (seeker: SeekerProfileWithRelations) => {
    const locations = [];
    if (seeker.district) locations.push(seeker.district);
    if (seeker.neighborhood && locations.length < 2) locations.push(seeker.neighborhood);
    if (seeker.city && locations.length === 0) locations.push(seeker.city);
    return locations.length > 0 ? locations.join(', ') : 'Lokasyon belirtilmedi';
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
            <Skeleton className="w-full aspect-[4/3] md:aspect-[16/10]" />
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-28" />
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Oda Arayanlar
        </h2>
        {(!seekers || seekers.length === 0) && (
          <p className="text-slate-500 mt-2">Henüz oda arayan profil bulunmuyor</p>
        )}
      </div>

      {seekers && seekers.length > 0 && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          data-testid="featured-seekers-grid"
        >
          {seekers.map((seeker) => (
            <Card
              key={seeker.id}
              className="rounded-2xl bg-white shadow-sm ring-1 ring-black/10 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
              onClick={() => navigate(`/oda-arayan/${seeker.id}`)}
              data-testid={`seeker-card-${seeker.id}`}
            >
              {/* Photo Section - Higher on mobile */}
              <div className="relative h-[220px] md:h-[200px] overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100">
                <img
                  src={getPhotoUrl(seeker)}
                  alt={`${getDisplayName(seeker)} profil fotoğrafı`}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  data-testid={`seeker-photo-${seeker.id}`}
                />
                
                {/* Verified Badge */}
                {seeker.user?.verificationStatus === 'verified' && (
                  <div className="absolute top-3 right-3 bg-emerald-600/95 text-white rounded-full p-1.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Info Section - Simplified */}
              <CardContent className="p-3">
                <div className="text-sm text-slate-800 font-medium truncate" data-testid={`seeker-name-${seeker.id}`}>
                  {getDisplayName(seeker)} – {getPreferredLocations(seeker)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
