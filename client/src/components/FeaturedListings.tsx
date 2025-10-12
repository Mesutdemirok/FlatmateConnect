import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { formatMonthlyPrice } from "@/lib/formatters";

export default function FeaturedListings() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 px-3 sm:px-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden border border-slate-200"
          >
            <Skeleton className="w-full h-[230px]" />
            <div className="p-4">
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-full" />
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

  return (
    <section
      className="
        pt-6 sm:pt-8 pb-14 
        bg-gradient-to-b from-[#f7f8ff] via-[#f2f4ff] to-[#edefff]
      "
    >
      <div className="max-w-[1500px] mx-auto px-2 sm:px-4">
        {/* Section Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8 text-center">
          Güncel İlanlar
        </h2>

        <div
          className="
            grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
            gap-4
          "
          data-testid="featured-listings-section"
        >
          {featuredListings.map((listing) => {
            // Compact title to max 4 words
            const words = (listing.title || "Oda İlanı").trim().split(/\s+/);
            const compactTitle = words.slice(0, 4).join(" ") + (words.length > 4 ? "…" : "");
            
            return (
              <article
                key={listing.id}
                onClick={() => navigate(`/oda-ilani/${listing.id}`)}
                className="
                  bg-white rounded-2xl shadow-md border border-slate-200
                  overflow-hidden transition-transform duration-300
                  hover:shadow-xl hover:-translate-y-[3px] cursor-pointer
                "
              >
                {/* Image with price pill overlay */}
                <div className="relative w-full h-[200px] overflow-hidden">
                  <img
                    src={
                      listing.images?.find((img) => img.isPrimary)?.imagePath ||
                      listing.images?.[0]?.imagePath ||
                      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop"
                    }
                    alt={compactTitle}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    data-testid={`listing-image-${listing.id}`}
                  />
                  {/* Price pill - single badge */}
                  <div className="absolute bottom-3 left-3 bg-indigo-600 text-white px-3 py-1.5 rounded-full font-semibold text-sm shadow-lg">
                    {formatMonthlyPrice(listing.rentAmount, "month")}
                  </div>
                </div>

                {/* Compact text section - tighter spacing */}
                <div className="p-3">
                  <h3 className="text-base font-semibold text-slate-900 mb-1">
                    {compactTitle}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {listing.address || "Konum bilgisi mevcut değil"}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
