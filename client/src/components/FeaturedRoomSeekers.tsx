// ODANET Revizyon – FeaturedRoomSeekers yeni SeekerCard ile
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SeekerProfileWithRelations } from "@/lib/seekerApi";
import { fetchFeaturedSeekers } from "@/lib/seekerApi";
import SeekerCard from "@/components/SeekerCard";

export default function FeaturedRoomSeekers() {
  const { data: seekers, isLoading, error } = useQuery<SeekerProfileWithRelations[]>({
    queryKey: ["featured-seekers"],
    queryFn: () => fetchFeaturedSeekers(4),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Oda arayan profilleri yüklenirken bir hata oluştu.
        </p>
      </div>
    );
  }

  if (!seekers || seekers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Henüz oda arayan profili bulunmamaktadır.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {seekers.filter(s => s != null).map((seeker) => (
        <SeekerCard key={seeker.id} seeker={seeker} />
      ))}
    </div>
  );
}
