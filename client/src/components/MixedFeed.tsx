import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";
import { MessageCircle, AlertCircle, RefreshCw, Home } from "lucide-react";

type FeedItem =
  | { 
      type: 'listing'; 
      id: string;
      slug?: string | null;
      title: string; 
      suburb: string | null;
      city: string | null;
      district: string | null;
      rentAmount: string | null;
      roomType: string | null;
      bathroomCount: number | null;
      moveInDate: string | null;
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
  const [, setLocation] = useLocation();
  const seekerUrl = `/oda-arayan/${item.slug || item.id}`;
  
  const photo = item.photoUrl 
    ? getAbsoluteImageUrl(item.photoUrl) 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.displayName)}&background=8b5cf6&color=fff&size=512`;
  
  const occupation = formatOccupation(item.occupation);
  const location = item.preferredLocation?.trim() || "";
  const budget = item.budgetMonthly ? `₺${item.budgetMonthly.toLocaleString("tr-TR")}` : "";
  
  return (
      <article 
        role="link"
        tabIndex={0}
        onClick={(e) => {
          e.preventDefault();
          setLocation(seekerUrl);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setLocation(seekerUrl);
          }
        }}
        aria-label={`${item.displayName} profil sayfasına git`}
        className="h-full w-full overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-md transition flex flex-col cursor-pointer"
        data-testid={`card-seeker-${item.id}`}
      >
        {/* Image Section - Desktop: full cover image like ListingCard, Mobile: with overlay */}
        <div className="relative w-full aspect-[16/10] overflow-hidden">
          <img 
            src={photo} 
            alt={item.displayName} 
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
            data-testid={`seeker-image-${item.id}`}
          />

          {/* Desktop: Budget badge (top-right) - same as ListingCard price */}
          {budget && (
            <div className="hidden md:block absolute right-2 top-2 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-indigo-700 shadow">
              {budget} <span className="text-xs text-indigo-600">/ay</span>
            </div>
          )}

          {/* Desktop: Location chip (bottom-left) - same as ListingCard address overlay */}
          {location && (
            <div className="hidden md:inline-flex absolute left-2 bottom-2 sm:left-3 sm:bottom-3 items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-slate-700 shadow-sm ring-1 ring-black/5">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-violet-600" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4.5 8-12a8 8 0 1 0-16 0c0 7.5 8 12 8 12Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span className="max-w-[14ch] truncate">{location}</span>
            </div>
          )}

          {/* Mobile: Info overlay on bottom of image with gradient */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 py-3">
            <h3 className="text-base font-semibold text-white mb-1.5 line-clamp-1" data-testid={`text-name-${item.id}`}>
              {item.displayName}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {budget && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">
                  {budget}/ay
                </span>
              )}
              {location && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-violet-100 text-violet-700 max-w-[120px] truncate">
                  {location}
                </span>
              )}
              {occupation && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-900 text-white">
                  {occupation}
                </span>
              )}
              {item.age && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-fuchsia-100 text-fuchsia-700">
                  {item.age} yaş
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Desktop: Text area with pills - same layout as ListingCard */}
        <div className="hidden md:flex md:flex-col px-3 pb-3 sm:px-4 sm:pb-4 min-h-[96px]">
          <h3 className="text-[15.5px] sm:text-[17px] font-semibold text-slate-900 leading-snug line-clamp-2">
            {item.displayName}
          </h3>
          
          {/* Pills for occupation and age */}
          {(occupation || item.age) && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {occupation && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-900 text-white text-[11px] sm:text-xs font-medium">
                  {occupation}
                </span>
              )}
              {item.age && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-700 text-[11px] sm:text-xs font-medium">
                  {item.age} yaş
                </span>
              )}
            </div>
          )}

          {/* CTA Button - At bottom with mt-auto - same size as ListingCard */}
          <div className="mt-auto pt-2">
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLocation(seekerUrl);
              }}
              className="w-full h-9 bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-semibold rounded-lg transition-colors"
              data-testid={`button-contact-${item.id}`}
            >
              <MessageCircle className="w-4 h-4 mr-2 inline" />
              İletişime Geçin
            </Button>
          </div>
        </div>

        {/* Mobile: Compact white area with only CTA button */}
        <div className="md:hidden px-3 py-2.5">
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLocation(seekerUrl);
            }}
            className="w-full h-11 bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-semibold rounded-lg transition-colors"
            data-testid={`button-contact-${item.id}`}
          >
            <MessageCircle className="w-4 h-4 mr-2 inline" />
            İletişime Geçin
          </Button>
        </div>
      </article>
  );
}

export default function MixedFeed() {
  const { data, isLoading, error, refetch } = useQuery<FeedItem[]>({
    queryKey: ['/api/feed'],
  });

  // Error state - check first so it's reachable
  if (error) {
    return (
      <section className="py-10 sm:py-12 isolate">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-6 sm:mb-8">
            Güncel İlanlar ve Oda Arayanlar
          </h2>
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8 max-w-md w-full text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                İlanlar Yüklenemedi
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                İlanları yüklerken bir sorun oluştu. Lütfen tekrar deneyin.
              </p>
              <Button
                onClick={() => refetch()}
                className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white"
                data-testid="button-retry-feed"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tekrar Dene
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Wait for data to load
  if (isLoading || !data) {
    return (
      <section className="py-10 sm:py-12 isolate">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-6 sm:mb-8">
            Güncel İlanlar ve Oda Arayanlar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="h-64 bg-white/70 rounded-2xl ring-1 ring-black/5 animate-pulse" 
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!data?.length) {
    return (
      <section className="py-10 sm:py-12 isolate">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-6 sm:mb-8">
            Güncel İlanlar ve Oda Arayanlar
          </h2>
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8 max-w-md w-full text-center">
              <Home className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Henüz İlan Yok
              </h3>
              <p className="text-sm text-slate-600">
                Şu anda gösterilecek ilan veya oda arayan profili bulunmuyor. Lütfen daha sonra tekrar kontrol edin.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-12 isolate">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-6 sm:mb-8">
          Güncel İlanlar ve Oda Arayanlar
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          {data.map((item) => {
            return item.type === 'listing' ? (
              <ListingCard 
                key={`listing-${item.id}`}
                listing={{
                  id: item.id,
                  slug: item.slug ?? null,
                  title: item.title,
                  suburb: item.suburb ?? null,
                  city: item.city ?? null,
                  district: item.district ?? null,
                  rentAmount: item.rentAmount ?? "0",
                  roomType: item.roomType ?? null,
                  bathroomCount: item.bathroomCount ?? null,
                  moveInDate: item.moveInDate ?? null,
                  totalOccupants: item.totalOccupants ?? null,
                  roommatePreference: item.roommatePreference ?? null,
                  furnishingStatus: item.furnishingStatus ?? null,
                  images: item.images ?? []
                }}
              />
            ) : (
              <SeekerMiniCard 
                key={`seeker-${item.id}`}
                item={item}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
