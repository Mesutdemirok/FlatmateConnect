import { useQuery } from "@tanstack/react-query";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";
import { MapPin, Wallet, MessageCircle } from "lucide-react";

type FeedItem =
  | { 
      type: 'listing'; 
      id: string;
      slug?: string | null;
      title: string; 
      suburb: string | null; 
      rentAmount: string | null;
      totalOccupants?: number | null;
      roommatePreference?: string | null;
      furnishingStatus?: string | null;
      images: { imagePath: string; isPrimary?: boolean }[] 
    }
  | { 
      type: 'seeker'; 
      id: string;
      slug?: string | null;
      displayName: string; 
      budgetMonthly: number | null; 
      preferredLocation: string | null; 
      photoUrl: string | null;
      age: number | null;
      occupation: string | null;
    };

function formatOccupation(occupation: string | null | undefined): string {
  if (!occupation) return "";
  const map: Record<string, string> = {
    "Öğrenci": "öğrenci",
    "Çalışan": "çalışan",
    "Serbest": "serbest meslek",
    "Diğer": "diğer"
  };
  return map[occupation] || occupation.toLowerCase();
}

function SeekerMiniCard({ item }: { item: Extract<FeedItem, {type:'seeker'}> }) {
  const photo = item.photoUrl 
    ? getAbsoluteImageUrl(item.photoUrl) 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.displayName)}&background=8b5cf6&color=fff&size=256`;
  
  const occupation = formatOccupation(item.occupation);
  const location = item.preferredLocation?.trim() || "";
  
  return (
    <article 
      className="h-full w-full overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-md transition flex flex-col"
      data-testid={`card-seeker-${item.id}`}
    >
      {/* Mobile: Photo on top, Desktop: Photo on left */}
      <div className="flex flex-col md:grid md:grid-cols-[96px_1fr] md:gap-4 h-full">
        
        {/* Profile Photo - 96x96 circular */}
        <div className="flex-shrink-0">
          <div className="w-full aspect-square md:w-24 md:h-24 md:aspect-auto md:m-4 overflow-hidden rounded-t-2xl md:rounded-full bg-slate-100">
            <img 
              src={photo} 
              alt={item.displayName} 
              className="w-full h-full object-cover object-center"
              data-testid={`seeker-image-${item.id}`}
            />
          </div>
        </div>

        {/* Content Area - Details + CTA */}
        <div className="flex flex-col flex-1 p-4 md:py-5 md:pr-5 md:pl-0 gap-2 md:gap-2.5">
          
          {/* Name */}
          <h3 
            className="text-lg md:text-xl font-semibold tracking-tight text-slate-900 line-clamp-1" 
            data-testid={`text-name-${item.id}`}
          >
            {item.displayName}
          </h3>

          {/* Pills Container */}
          <div className="flex flex-wrap gap-2">
            
            {/* Budget - Green Pill */}
            {item.budgetMonthly !== null && (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-emerald-100 text-emerald-700">
                ₺{item.budgetMonthly.toLocaleString("tr-TR")}/ay
              </span>
            )}

            {/* Location - Purple Pill */}
            <span 
              className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-violet-100 text-violet-700 max-w-[200px] truncate"
              title={location || "Lokasyon bilgisi yok"}
            >
              {location || "Lokasyon bilgisi yok"}
            </span>

            {/* Occupation - Dark Pill */}
            {occupation && (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-slate-900 text-white">
                {occupation}
              </span>
            )}

            {/* Age - Fuchsia Pill */}
            {item.age && (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-fuchsia-100 text-fuchsia-700">
                {item.age} yaş
              </span>
            )}
          </div>

          {/* CTA Button - At bottom with mt-auto */}
          <div className="mt-auto pt-2">
            <Button
              asChild
              className="w-full h-11 md:h-12 bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold rounded-lg transition-colors"
              data-testid={`button-contact-${item.id}`}
            >
              <a href={`/oda-arayan/${item.slug || item.id}`}>
                <MessageCircle className="w-4 h-4 mr-2" />
                İletişime Geçin
              </a>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function MixedFeed() {
  const { data, isLoading, error } = useQuery<FeedItem[]>({
    queryKey: ['/api/feed'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="h-64 bg-white/70 rounded-2xl ring-1 ring-black/5 animate-pulse" 
          />
        ))}
      </div>
    );
  }

  if (error || !data?.length) return null;

  return (
    <section className="py-10 sm:py-12">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-6 sm:mb-8">
          Güncel İlanlar ve Oda Arayanlar
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
          {data.map((item) =>
            item.type === 'listing' ? (
              <div key={`feed-listing-${item.id}`} className="h-full">
                <ListingCard 
                  listing={{
                    id: item.id,
                    slug: item.slug,
                    title: item.title,
                    suburb: item.suburb ?? undefined,
                    rentAmount: item.rentAmount ?? undefined,
                    totalOccupants: item.totalOccupants ?? undefined,
                    roommatePreference: item.roommatePreference ?? undefined,
                    furnishingStatus: item.furnishingStatus ?? undefined,
                    images: item.images
                  }} 
                />
              </div>
            ) : (
              <div key={`feed-seeker-${item.id}`} className="h-full">
                <SeekerMiniCard item={item} />
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
