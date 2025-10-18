import { useQuery } from "@tanstack/react-query";
import ListingCard from "@/components/ListingCard";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";
import { MapPin, Wallet } from "lucide-react";

type FeedItem =
  | { 
      type: 'listing'; 
      id: string; 
      title: string; 
      suburb: string | null; 
      rentAmount: string | null; 
      images: { imagePath: string; isPrimary?: boolean }[] 
    }
  | { 
      type: 'seeker'; 
      id: string; 
      displayName: string; 
      budgetMonthly: number | null; 
      preferredLocation: string | null; 
      photoUrl: string | null 
    };

function SeekerMiniCard({ item }: { item: Extract<FeedItem, {type:'seeker'}> }) {
  const photo = item.photoUrl 
    ? getAbsoluteImageUrl(item.photoUrl) 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.displayName)}&background=8b5cf6&color=fff&size=400`;
  
  return (
    <a 
      href={`/oda-arayan/${item.id}`} 
      className="group block overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-sm hover:shadow-lg transition-all duration-300"
      data-testid={`card-seeker-${item.id}`}
    >
      <div className="relative h-44 sm:h-52 overflow-hidden">
        <img 
          src={photo} 
          alt={item.displayName} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" 
        />
        {item.budgetMonthly != null && (
          <div className="absolute top-2 left-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs sm:text-sm font-semibold px-2.5 py-1 shadow-lg flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" />
            ₺{item.budgetMonthly.toLocaleString("tr-TR")}/ay
          </div>
        )}
        <div className="absolute top-2 right-2 rounded-full bg-purple-600/95 text-white text-[10px] sm:text-xs font-medium px-2 py-0.5 shadow">
          Oda Arayan
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="text-[15.5px] sm:text-[17px] font-semibold text-slate-900 line-clamp-1 mb-1" data-testid={`text-name-${item.id}`}>
          {item.displayName}
        </h3>
        {item.preferredLocation && (
          <p className="mt-0.5 text-sm text-slate-600 line-clamp-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            {item.preferredLocation}
          </p>
        )}
        {!item.preferredLocation && (
          <p className="mt-0.5 text-sm text-slate-400 italic">Lokasyon tercihi belirtilmemiş</p>
        )}
      </div>
    </a>
  );
}

export default function MixedFeed() {
  const { data, isLoading, error } = useQuery<FeedItem[]>({
    queryKey: ['/api/feed'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {data.map((item) =>
            item.type === 'listing' ? (
              <ListingCard 
                key={`feed-listing-${item.id}`} 
                listing={{
                  id: item.id,
                  title: item.title,
                  suburb: item.suburb ?? undefined,
                  rentAmount: item.rentAmount ?? undefined,
                  images: item.images
                }} 
              />
            ) : (
              <SeekerMiniCard 
                key={`feed-seeker-${item.id}`} 
                item={item} 
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}
