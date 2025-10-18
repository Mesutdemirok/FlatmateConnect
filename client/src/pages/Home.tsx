// ODANET Revizyon – Ana sayfa: tüm ilanlar karışık "Güncel İlanlar"
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SearchBox from "@/components/SearchBox";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import SeekerCard from "@/components/SeekerCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import type { ListingWithRelations } from "@/lib/listingApi";
import type { SeekerProfileWithRelations } from "@/lib/seekerApi";

// Karışık item tipi
type MixedItem = 
  | { type: 'listing'; data: ListingWithRelations }
  | { type: 'seeker'; data: SeekerProfileWithRelations };

// Rasgele karıştırma fonksiyonu
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Home() {
  // Oda ilanları çek
  const { data: listings, isLoading: listingsLoading } = useQuery<ListingWithRelations[]>({
    queryKey: ["/api/listings"],
  });

  // Oda arayan ilanları çek
  const { data: seekers, isLoading: seekersLoading } = useQuery<SeekerProfileWithRelations[]>({
    queryKey: ["/api/seekers/public"],
  });

  const isLoading = listingsLoading || seekersLoading;

  // İki listeyi birleştir ve karıştır
  const mixedItems: MixedItem[] = [];
  if (listings) {
    listings.forEach(listing => mixedItems.push({ type: 'listing', data: listing }));
  }
  if (seekers) {
    seekers.forEach(seeker => mixedItems.push({ type: 'seeker', data: seeker }));
  }

  // Karıştır ve maksimum 24 kart göster
  const shuffledItems = shuffleArray(mixedItems).slice(0, 24);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-indigo-50 via-violet-50 to-fuchsia-50 flex flex-col"
      data-testid="home-page"
    >
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main id="main" className="flex-grow">
        {/* HERO */}
        <Hero />

        {/* SEARCH */}
        <div className="relative z-10">
          <SearchBox />
        </div>

        {/* GÜNCEL İLANLAR - Karışık (oda + oda arayan) */}
        <section
          aria-labelledby="guncel-ilanlar-heading"
          className="py-10 sm:py-12"
        >
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              id="guncel-ilanlar-heading"
              className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-6 sm:mb-8"
            >
              Güncel İlanlar
            </h2>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-4">
                      <Skeleton className="h-48 w-full mb-4 rounded" />
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Mixed Listings Grid */}
            {!isLoading && shuffledItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {shuffledItems.map((item, index) => (
                  <div key={`${item.type}-${item.data.id}-${index}`}>
                    {item.type === 'listing' ? (
                      <ListingCard listing={item.data} />
                    ) : (
                      <SeekerCard seeker={item.data} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && shuffledItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-600 text-lg">
                  Henüz ilan bulunmamaktadır.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
