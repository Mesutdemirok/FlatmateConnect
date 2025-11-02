import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";
import { MessageCircle } from "lucide-react";

type Seeker = {
  id: string;
  slug?: string | null;
  fullName?: string | null;
  user?: { firstName?: string | null; lastName?: string | null } | null;
  profilePhotoUrl?: string | null;
  photos?: Array<{ imagePath?: string; sortOrder?: number | null }>;
  preferredLocation?: string | null;
  budgetMonthly?: string | null;
  age?: number | null;
  occupation?: string | null;
};

function nameOf(s: Seeker) {
  if (s.fullName) {
    const parts = s.fullName.trim().split(/\s+/);
    if (parts.length > 1) {
      return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
    }
    return parts[0];
  }
  if (s.user?.firstName) {
    const ln = s.user?.lastName?.[0]?.toUpperCase() || "";
    return `${s.user.firstName} ${ln ? ln + "." : ""}`.trim();
  }
  return "Oda arayan";
}

function photoOf(s: Seeker) {
  if (s.profilePhotoUrl) return getAbsoluteImageUrl(s.profilePhotoUrl);
  const p = s.photos?.find(x => x.sortOrder === 0) || s.photos?.[0];
  if (p?.imagePath) return getAbsoluteImageUrl(p.imagePath);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameOf(s))}&background=8b5cf6&color=fff&size=512`;
}

function formatBudget(budget: string | null | undefined): string {
  if (!budget) return "";
  const num = typeof budget === "string" 
    ? Number(budget.replace(/[^\d.,-]/g, "").replace(",", "."))
    : Number(budget);
  if (!Number.isFinite(num)) return "";
  return `₺${num.toLocaleString("tr-TR")}`;
}

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

interface SeekerCardProps {
  seeker: Seeker;
}

export default function SeekerCard({ seeker }: SeekerCardProps) {
  const seekerUrl = seeker.slug
    ? `/oda-arayan/${seeker.slug}`
    : `/oda-arayan/${seeker.id}`;
  
  const name = nameOf(seeker);
  const photo = photoOf(seeker);
  const budget = formatBudget(seeker.budgetMonthly);
  const occupation = formatOccupation(seeker.occupation);
  const location = seeker.preferredLocation?.trim() || "";

  return (
    <Link href={seekerUrl}>
      <article 
        className="h-full w-full overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-md transition flex flex-col"
        data-testid={`card-seeker-${seeker.id}`}
      >
        {/* Image Section - Same aspect ratio as ListingCard for consistent height */}
        <div className="relative w-full aspect-[16/10] overflow-hidden">
          <img 
            src={photo} 
            alt={name} 
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
            data-testid={`seeker-image-${seeker.id}`}
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

        </div>

        {/* Text area with pills - matching ListingCard exactly for uniform height */}
        <div className="px-3 pb-3 sm:px-4 sm:pb-4 min-h-[96px] flex flex-col">
          <h3 className="text-[15.5px] sm:text-[17px] font-semibold text-slate-900 leading-snug line-clamp-2">
            {name}
          </h3>
          
          {/* Pills for occupation and age */}
          {(occupation || seeker.age) && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {occupation && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-900 text-white text-[11px] sm:text-xs font-medium">
                  {occupation}
                </span>
              )}
              {seeker.age && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-700 text-[11px] sm:text-xs font-medium">
                  {seeker.age} yaş
                </span>
              )}
            </div>
          )}

          {/* CTA Button - At bottom with mt-auto - matching ListingCard exactly */}
          <div className="mt-auto pt-2">
            <Button
              asChild
              className="w-full h-9 bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-semibold rounded-lg transition-colors"
              data-testid={`button-contact-${seeker.id}`}
            >
              <span>
                <MessageCircle className="w-4 h-4 mr-2 inline" />
                İletişime Geçin
              </span>
            </Button>
          </div>
        </div>
      </article>
    </Link>
  );
}
