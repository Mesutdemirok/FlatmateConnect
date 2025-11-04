import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";
import { MessageCircle, MapPin } from "lucide-react";

type Seeker = {
  id: string;
  userId?: string;
  slug?: string | null;
  fullName?: string | null;
  user?: { 
    id?: string;
    firstName?: string | null; 
    lastName?: string | null;
  } | null;
  profilePhotoUrl?: string | null;
  photos?: Array<{ imagePath?: string; sortOrder?: number | null }>;
  preferredLocation?: string | null;
  budgetMonthly?: string | null;
  age?: number | null;
  occupation?: string | null;
  genderPreference?: string | null;
};

function nameOf(s: Seeker) {
  if (s.fullName) {
    const parts = s.fullName.trim().split(/\s+/);
    if (parts.length > 1) return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
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
  const p = s.photos?.find((x) => x.sortOrder === 0) || s.photos?.[0];
  if (p?.imagePath) return getAbsoluteImageUrl(p.imagePath);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameOf(s))}&background=8b5cf6&color=fff&size=512`;
}

function formatBudget(budget?: string | null) {
  if (!budget) return "";
  const num =
    typeof budget === "string"
      ? Number(budget.replace(/[^\d.,-]/g, "").replace(",", "."))
      : Number(budget);
  if (!Number.isFinite(num)) return "";
  return `₺${num.toLocaleString("tr-TR")}`;
}

function formatOccupation(o?: string | null) {
  if (!o) return "";
  const map: Record<string, string> = {
    Öğrenci: "öğrenci",
    Çalışan: "çalışan",
    Serbest: "serbest meslek",
    Diğer: "diğer",
  };
  return map[o] || o.toLowerCase();
}

interface SeekerCardProps {
  seeker: Seeker;
}

export default function SeekerCard({ seeker }: SeekerCardProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  
  const seekerUrl = seeker.slug
    ? `/oda-arayan/${seeker.slug}`
    : `/oda-arayan/${seeker.id}`;
  const name = nameOf(seeker);
  const photo = photoOf(seeker);
  const budget = formatBudget(seeker.budgetMonthly);
  const occupation = formatOccupation(seeker.occupation);
  const location = seeker.preferredLocation?.trim() || "";

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent card link navigation
    e.stopPropagation();
    
    const targetUserId = seeker.user?.id || seeker.userId;
    if (!targetUserId) return;
    
    if (!isAuthenticated) {
      // Redirect to login, then return to this conversation
      setLocation(`/giris?next=/mesajlar/${targetUserId}`);
    } else {
      setLocation(`/mesajlar/${targetUserId}`);
    }
  };

  return (
    <Link href={seekerUrl}>
      <article className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-lg hover:-translate-y-[2px]">
        {/* Image area */}
        <div className="relative w-full h-[180px] md:h-[220px] overflow-hidden">
          <img
            src={photo}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            {budget && (
              <span className="rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-indigo-700 shadow-sm">
                {budget} <span className="text-xs text-indigo-500">/ay</span>
              </span>
            )}
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
            <h3 className="text-white text-[15px] sm:text-[17px] font-semibold drop-shadow-sm">
              {name}
            </h3>
          </div>
        </div>

        {/* Info area */}
        <div className="flex flex-col flex-1 px-4 py-3 md:py-4">
          {/* location */}
          {location && (
            <div className="flex items-center gap-1 text-slate-600 text-[13px] sm:text-sm font-medium mb-1">
              <MapPin className="w-4 h-4 text-violet-600" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {/* tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {occupation && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] sm:text-xs font-medium">
                {occupation}
              </span>
            )}
            {seeker.age && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-700 text-[11px] sm:text-xs font-medium">
                {seeker.age} yaş
              </span>
            )}
            {seeker.genderPreference && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[11px] sm:text-xs font-medium">
                {seeker.genderPreference === "Kadın" ? "Tercih: Kadın" : seeker.genderPreference === "Erkek" ? "Tercih: Erkek" : "Tercih: Farketmez"}
              </span>
            )}
          </div>

          {/* CTA */}
          <div className="mt-auto pt-2">
            <Button
              onClick={handleContact}
              className="w-full h-9 md:h-10 bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2"
              data-testid="button-contact-seeker"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="ml-1.5">İletişime Geç</span>
            </Button>
          </div>
        </div>
      </article>
    </Link>
  );
}
