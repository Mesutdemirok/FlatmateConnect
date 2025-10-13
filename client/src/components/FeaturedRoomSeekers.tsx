import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SeekerProfileWithRelations } from "@/lib/seekerApi";
import SeekerCard, { SeekerCardSkeleton } from "@/components/ui/SeekerCard";

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
    if (seeker.profilePhotoUrl) {
      return seeker.profilePhotoUrl;
    }
    const primaryPhoto = seeker.photos?.find((p) => p.sortOrder === 0) || seeker.photos?.[0];
    if (primaryPhoto) {
      return `/uploads/seekers/${primaryPhoto.imagePath}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(seeker))}&background=8b5cf6&color=fff&size=400`;
  };

  if (isLoading) {
    return (
      <div
        className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        data-testid="featured-seekers-loading"
      >
        {[...Array(3)].map((_, i) => (
          <SeekerCardSkeleton key={i} />
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          data-testid="featured-seekers-grid"
        >
          {seekers.map((seeker) => {
            const locations = [];
            if (seeker.district) locations.push(seeker.district);
            if (seeker.neighborhood && locations.length < 2) locations.push(seeker.neighborhood);
            if (seeker.city && locations.length === 0) locations.push(seeker.city);

            const budget = seeker.budgetMonthly 
              ? (typeof seeker.budgetMonthly === 'string' 
                  ? parseInt(seeker.budgetMonthly, 10) 
                  : seeker.budgetMonthly)
              : undefined;

            return (
              <SeekerCard
                key={seeker.id}
                seeker={{
                  id: seeker.id,
                  fullName: getDisplayName(seeker),
                  avatarUrl: getPhotoUrl(seeker),
                  age: seeker.age || undefined,
                  occupation: seeker.occupation || undefined,
                  preferredLocations: locations,
                  budgetMonthly: budget,
                  verified: (seeker.user as any)?.verificationStatus === 'verified',
                }}
                onClick={() => navigate(`/oda-arayan/${seeker.id}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
