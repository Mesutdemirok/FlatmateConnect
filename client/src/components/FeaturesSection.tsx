import { useQuery } from "@tanstack/react-query";
import ListingCard from "@/components/ListingCard"; // <-- use the component here
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export default function FeaturedListings() {
  const { t } = useTranslation();
  const {
    data: listings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/listings"],
    queryFn: async () => {
      const res = await fetch("/api/listings");
      if (!res.ok) throw new Error("Failed to fetch listings");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 px-0 sm:px-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white/80 rounded-2xl shadow-md overflow-hidden border border-slate-200"
          >
            <Skeleton className="w-full h-[230px]" />
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600 font-medium">
        {t("listings.unable_to_load")}
      </div>
    );
  }

  const featuredListings = Array.isArray(listings) ? listings.slice(0, 4) : [];

  if (featuredListings.length === 0) {
    return (
      <div className="text-center py-10 text-slate-600">
        {t("listings.no_listings_available")}
      </div>
    );
  }

  // Use the shared ListingCard so style updates actually apply
  return (
    <section className="py-10 sm:py-12 bg-gradient-to-b from-[#f8faff] via-[#f3f5ff] to-[#e8ebff]">
      <div className="max-w-[1500px] mx-auto px-0 sm:px-2">
        <div
          className="
            grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
            gap-y-8 gap-x-3 sm:gap-x-4
          "
          data-testid="featured-listings-section"
        >
          {featuredListings.map((listing: any) => (
            <ListingCard
              key={`featured-listing-${listing.id}`}
              listing={listing}
              showDistance={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
