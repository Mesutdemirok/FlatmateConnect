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
    if (seeker.preferredLocation) {
      const locations = seeker.preferredLocation.split(',').slice(0, 2);
      return locations.join(', ');
    }
    return 'Lokasyon belirtilmedi';
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
              className="rounded-2xl bg-card shadow-sm ring-1 ring-black/5 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
              onClick={() => navigate(`/oda-arayan/${seeker.id}`)}
              data-testid={`seeker-card-${seeker.id}`}
            >
              {/* Photo Section */}
              <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100">
                <img
                  src={getPhotoUrl(seeker)}
                  alt={`${getDisplayName(seeker)} profil fotoğrafı`}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  data-testid={`seeker-photo-${seeker.id}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                
                {/* Verified Badge */}
                {seeker.user?.verificationStatus === 'verified' && (
                  <div className="absolute bottom-3 left-3 bg-emerald-600/95 text-white rounded-full p-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Info Section */}
              <CardContent className="p-4">
                <h3 className="text-[15.5px] sm:text-[17px] font-semibold text-slate-900 mb-1" data-testid={`seeker-name-${seeker.id}`}>
                  {getDisplayName(seeker)}
                </h3>
                <p className="text-[13px] sm:text-sm text-slate-600 truncate">
                  {getPreferredLocations(seeker)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
