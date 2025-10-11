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
        {/* No title — compact and clean layout */}

        <div
          className="
            grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
            gap-y-10 gap-x-4 sm:gap-x-6
          "
          data-testid="featured-listings-section"
        >
          {featuredListings.map((listing) => (
            <article
              key={listing.id}
              onClick={() => navigate(`/listing/${listing.id}`)}
              className="
                bg-white rounded-2xl shadow-md border border-slate-200
                overflow-hidden transition-transform duration-300
                hover:shadow-xl hover:-translate-y-[3px] cursor-pointer
              "
            >
              {/* Image - fits edge to edge */}
              <div className="relative w-full h-[230px] sm:h-[220px] overflow-hidden">
                <img
                  src={
                    listing.coverImageUrl ||
                    listing.images?.[0] ||
                    "https://placehold.co/600x400?text=Odanet"
                  }
                  alt={listing.title || "Oda İlanı"}
                  className="
                    w-full h-full object-cover object-center
                    transition-transform duration-500 hover:scale-105
                  "
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              </div>

              {/* Text section */}
              <div className="p-4 flex flex-col">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  {listing.city || "İstanbul"}{" "}
                  {listing.suburb ? `• ${listing.suburb}` : ""}
                </h3>

                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                  Konforlu, merkezi konumda, taşınmaya hazır oda ilanı.
                </p>

                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="text-indigo-600 font-bold text-base">
                    {formatMonthlyPrice(
                      listing.price || listing.rentAmount,
                      "month",
                    )}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/listing/${listing.id}`);
                    }}
                    className="
                      text-xs sm:text-sm font-medium text-indigo-700
                      border border-indigo-200 rounded-xl px-3 py-1.5
                      hover:bg-indigo-50 transition
                    "
                  >
                    Detayları Gör
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
