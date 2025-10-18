import { Link } from "wouter";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";

type AspectOpt = "16/9" | "4/3" | "16/10";

type Seeker = {
  id: string;
  fullName?: string | null;
  user?: { firstName?: string | null; lastName?: string | null } | null;
  profilePhotoUrl?: string | null;
  photos?: Array<{ imagePath?: string; sortOrder?: number }>;
  preferredLocation?: string | null;
  budgetMonthly?: string | null;
  age?: number | null;
};

const aspectClass = (a?: AspectOpt) =>
  a === "4/3" ? "aspect-[4/3]" :
  a === "16/9" ? "aspect-[16/9]" :
  "aspect-[16/10]";

function nameOf(s: Seeker) {
  if (s.fullName) {
    const parts = s.fullName.split(" ");
    return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
  }
  if (s.user?.firstName) return `${s.user.firstName} ${s.user?.lastName?.[0] || ""}.`.trim();
  return "Oda arayan";
}

function photoOf(s: Seeker) {
  if (s.profilePhotoUrl) return getAbsoluteImageUrl(s.profilePhotoUrl);
  const p = s.photos?.find(x => x.sortOrder === 0) || s.photos?.[0];
  if (p?.imagePath) return getAbsoluteImageUrl(p.imagePath);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameOf(s))}&background=8b5cf6&color=fff&size=512`;
}

interface SeekerCardProps {
  seeker: Seeker;
  imageAspect?: AspectOpt;
}

export default function SeekerCard({ seeker, imageAspect = "16/10" }: SeekerCardProps) {
  return (
    <Link href={`/oda-arayan/${seeker.id}`}>
      <article 
        className="w-full overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-md transition flex flex-col"
        data-testid={`card-seeker-${seeker.id}`}
      >
        <div className={`relative w-full ${aspectClass(imageAspect)} overflow-hidden`}>
          <img 
            src={photoOf(seeker)} 
            alt={nameOf(seeker)} 
            className="absolute inset-0 h-full w-full object-cover"
            data-testid={`seeker-image-${seeker.id}`}
          />
          {seeker.budgetMonthly && (
            <div className="absolute left-2 top-2 rounded-full bg-emerald-600/95 px-3 py-1 text-sm font-bold text-white shadow">
              ₺{Number(seeker.budgetMonthly).toLocaleString("tr-TR")}/ay
            </div>
          )}
          <div className="absolute right-2 top-2 rounded-full bg-violet-600/95 px-3 py-1 text-xs font-semibold text-white shadow">
            Oda Arayan
          </div>
        </div>

        <div className="p-4 min-h-[96px] flex flex-col justify-center">
          <h3 className="text-base sm:text-lg font-semibold line-clamp-1" data-testid={`text-name-${seeker.id}`}>
            {nameOf(seeker)}
          </h3>
          {seeker.preferredLocation && (
            <p className="text-sm text-slate-600 truncate">{seeker.preferredLocation}</p>
          )}
          {seeker.age ? <p className="text-sm text-slate-600">{seeker.age} yaş</p> : null}
        </div>
      </article>
    </Link>
  );
}
