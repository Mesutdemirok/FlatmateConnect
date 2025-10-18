import { useQueries } from "@tanstack/react-query";
import ListingCard from "@/components/ListingCard";
import SeekerCard from "@/components/SeekerCard";

export default function CombinedFeed() {
  const results = useQueries({
    queries: [
      {
        queryKey: ["/api/listings"],
        queryFn: async () => (await fetch("/api/listings")).json(),
      },
      {
        queryKey: ["/api/seekers/public"],
        queryFn: async () =>
          (await fetch("/api/seekers/public?isActive=true")).json(),
      },
    ],
  });

  const [listingsQ, seekersQ] = results;
  const listings = Array.isArray(listingsQ.data) ? listingsQ.data : [];
  const seekers = Array.isArray(seekersQ.data) ? seekersQ.data : [];

  // Interleave (seeker, listing, seeker, listing…)
  const mixed: Array<{ kind: "listing" | "seeker"; data: any }> = [];
  const maxLen = Math.max(listings.length, seekers.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < seekers.length) mixed.push({ kind: "seeker", data: seekers[i] });
    if (i < listings.length) mixed.push({ kind: "listing", data: listings[i] });
  }

  if (listingsQ.isLoading || seekersQ.isLoading) {
    return <div className="py-8 text-center text-slate-600">Yükleniyor…</div>;
  }

  if (mixed.length === 0) {
    return (
      <div className="py-8 text-center text-slate-600">Henüz ilan yok</div>
    );
  }

  return (
    <section className="py-10 sm:py-12">
      <div className="mx-auto max-w-[1100px] px-3">
        {/* 1 per row on mobile; 2 on md; 3 on lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mixed.map((item, idx) =>
            item.kind === "listing" ? (
              <ListingCard
                key={`l-${item.data.id}-${idx}`}
                listing={item.data}
                /* taller image for room listings */
                imageAspect="4/3"
                /* show address chip inside the photo */
                addressOverlay
              />
            ) : (
              <SeekerCard
                key={`s-${item.data.id}-${idx}`}
                seeker={item.data}
                /* a little shorter than listings */
                imageAspect="16/9"
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
}
