import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import ListingCard from "@/components/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { getApiUrl } from "@/lib/apiConfig";

export default function FeaturedListings() {
  const { t } = useTranslation();

  const {
    data: featuredListings,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["/api/listings"],
    // Keeps the same API + shape, but adds abort + sensible timeouts/retries.
    queryFn: async ({ signal }) => {
      // Fallback timeout to guard against hung requests
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);

      try {
        const res = await fetch(getApiUrl("/api/listings"), {
          // prefer react-query's signal, else our controller
          signal: signal ?? controller.signal,
          headers: { accept: "application/json" },
        });
        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || "Failed to fetch listings");
        }
        return res.json();
      } finally {
        clearTimeout(timeout);
      }
    },
    // Keep stale data visible during background refresh for smoother UX
    placeholderData: (prev) => prev,
    staleTime: 60_000, // 1 min fresh
    gcTime: 5 * 60_000, // cache for 5 min
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    // Only take the first 4 for "featured" here to avoid extra renders below
    select: (data) => (Array.isArray(data) ? data.slice(0, 4) : []),
  });

  // Loading state (mobile-first grid, smooth skeletons)
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 px-0 sm:px-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`listing-skel-${i}`}
            className="bg-white/80 rounded-2xl shadow-md overflow-hidden border border-slate-200"
          >
            <Skeleton className="w-full h-[230px] animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state with a lightweight retry
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 font-medium mb-4">
          {t("listings.unable_to_load")}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 active:scale-[.99] transition"
        >
          {t("common.try_again") || "Tekrar dene"}
        </button>
      </div>
    );
  }

  if (!featuredListings || featuredListings.length === 0) {
    return (
      <div className="text-center py-10 text-slate-600">
        {t("listings.no_listings_available")}
      </div>
    );
  }

  // Main render — uses the shared ListingCard so design changes propagate everywhere
  return (
    <section
      className="py-10 sm:py-12 bg-gradient-to-b from-[#f8faff] via-[#f3f5ff] to-[#e8ebff]"
      aria-busy={isFetching ? "true" : "false"}
      aria-live="polite"
    >
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
