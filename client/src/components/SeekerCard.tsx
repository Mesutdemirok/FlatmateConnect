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
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameOf(s))}&background=8b5cf6&color=fff&size=256`;
}

function formatBudget(budget: string | null | undefined): string {
  if (!budget) return "";
  const num = typeof budget === "string" 
    ? Number(budget.replace(/[^\d.,-]/g, "").replace(",", "."))
    : Number(budget);
  if (!Number.isFinite(num)) return "";
  return `₺${num.toLocaleString("tr-TR")}/ay`;
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
    <article 
      className="h-full w-full overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-md transition flex flex-col"
      data-testid={`card-seeker-${seeker.id}`}
    >
      {/* Mobile: Photo on top, Desktop: Photo on left */}
      <div className="flex flex-col md:grid md:grid-cols-[96px_1fr] md:gap-4 h-full">
        
        {/* Profile Photo - 96x96 circular */}
        <div className="flex-shrink-0">
          <div className="w-full aspect-square md:w-24 md:h-24 md:aspect-auto md:m-4 overflow-hidden rounded-t-2xl md:rounded-full bg-slate-100">
            <img 
              src={photo} 
              alt={name} 
              className="w-full h-full object-cover object-center"
              data-testid={`seeker-image-${seeker.id}`}
            />
          </div>
        </div>

        {/* Content Area - Details + CTA */}
        <div className="flex flex-col flex-1 p-4 md:py-5 md:pr-5 md:pl-0 gap-2 md:gap-2.5">
          
          {/* Name */}
          <h3 
            className="text-lg md:text-xl font-semibold tracking-tight text-slate-900 line-clamp-1" 
            data-testid={`text-name-${seeker.id}`}
          >
            {name}
          </h3>

          {/* Pills Container */}
          <div className="flex flex-wrap gap-2">
            
            {/* Budget - Green Pill */}
            {budget && (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-emerald-100 text-emerald-700">
                {budget}
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
            {seeker.age && (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-fuchsia-100 text-fuchsia-700">
                {seeker.age} yaş
              </span>
            )}
          </div>

          {/* CTA Button - At bottom with mt-auto */}
          <div className="mt-auto pt-2">
            <Button
              asChild
              className="w-full h-11 md:h-12 bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold rounded-lg transition-colors"
              data-testid={`button-contact-${seeker.id}`}
            >
              <Link href={seekerUrl}>
                <MessageCircle className="w-4 h-4 mr-2" />
                İletişime Geçin
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
