import { useQueries } from "@tanstack/react-query";
import ListingCard from "@/components/ListingCard";
import SeekerCard from "@/components/SeekerCard";
import { getApiUrl } from "@/lib/apiConfig";

export default function CombinedFeed() {
  const results = useQueries({
    queries: [
      {
        queryKey: ["/api/listings"],
        queryFn: async () => {
          const url = getApiUrl("/api/listings");
          const response = await fetch(url);
          const data = await response.json();
          return data;
        },
      },
      {
        queryKey: ["/api/seekers/public"],
        queryFn: async () => {
          const url = getApiUrl("/api/seekers/public?isActive=true");
          const response = await fetch(url);
          const data = await response.json();
          return data;
        },
      },
    ],
  });

  const [listingsQ, seekersQ] = results;
  const listings = Array.isArray(listingsQ.data) ? listingsQ.data : [];
  const seekers = Array.isArray(seekersQ.data) ? seekersQ.data : [];

  if (listingsQ.isLoading || seekersQ.isLoading) {
    return <div className="py-8 text-center text-slate-600">Yükleniyor…</div>;
  }

  // Interleave (seeker, listing, seeker, listing…)
  const mixed: Array<{ kind: "listing" | "seeker"; data: any }> = [];
  const maxLen = Math.max(listings.length, seekers.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < seekers.length) mixed.push({ kind: "seeker", data: seekers[i] });
    if (i < listings.length) mixed.push({ kind: "listing", data: listings[i] });
  }

  if (mixed.length === 0) {
    return (
      <div className="py-8 text-center text-slate-600">Henüz ilan yok</div>
    );
  }

  return (
    <section className="py-10 sm:py-12" data-testid="combined-feed-section">
      <div className="mx-auto max-w-[1100px] px-3">
        <h2 className="text-2xl font-bold mb-6 text-center" data-testid="feed-title">
          {mixed.length} ilan bulundu
        </h2>
        {/* 1 per row on mobile; 2 on md; 3 on lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="feed-grid">
          {mixed.map((item, idx) =>
            item.kind === "listing" ? (
              <ListingCard
                key={`l-${item.data.id}-${idx}`}
                listing={item.data}
              />
            ) : (
              <SeekerCard
                key={`s-${item.data.id}-${idx}`}
                seeker={item.data}
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
}
