// ODANET Revizyon – Tam Tıklanabilir SeekerCard + Adres Snippet
import { Link } from "wouter";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";
import { getAddressSnippet } from "@/lib/utils/getAddressSnippet";
import { MapPin, Briefcase } from "lucide-react";
import type { SeekerProfileWithRelations } from "@/lib/seekerApi";

function displayName(s: SeekerProfileWithRelations) {
  if (s?.fullName) {
    const parts = s.fullName.trim().split(/\s+/);
    return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
  }
  if (s?.user?.firstName) {
    const ln = s.user.lastName?.[0] ?? "";
    return `${s.user.firstName} ${ln ? ln + "." : ""}`.trim();
  }
  return "Anonim";
}

function budgetTR(budget: string | number | null | undefined) {
  if (budget === null || budget === undefined || budget === "")
    return "Belirtilmemiş";
  const num =
    typeof budget === "string"
      ? Number(budget.replace(/[^\d.,-]/g, "").replace(",", "."))
      : Number(budget);
  if (!Number.isFinite(num)) return "Belirtilmemiş";
  return `₺${num.toLocaleString("tr-TR")}/ay`;
}

function photoUrl(s: SeekerProfileWithRelations) {
  if (s?.profilePhotoUrl) return getAbsoluteImageUrl(s.profilePhotoUrl);
  const p = s?.photos?.find((x) => x.sortOrder === 0) ?? s?.photos?.[0];
  if (p?.imagePath) return getAbsoluteImageUrl(p.imagePath);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName(s),
  )}&background=8b5cf6&color=fff&size=400`;
}

function genderBadge(gender?: string | null) {
  if (!gender) return null;
  const lowerGender = gender.toLowerCase();
  if (lowerGender === "kadın" || lowerGender === "female" || lowerGender === "kadin")
    return { label: "Kadın", color: "bg-pink-50 text-pink-700 ring-pink-200" };
  if (lowerGender === "erkek" || lowerGender === "male")
    return { label: "Erkek", color: "bg-blue-50 text-blue-700 ring-blue-200" };
  return { label: gender, color: "bg-slate-50 text-slate-700 ring-slate-200" };
}

export default function SeekerCard({ seeker }: { seeker: SeekerProfileWithRelations }) {
  const name = displayName(seeker);
  const gender = genderBadge(seeker?.gender);
  const location = seeker?.preferredLocation ?? "";
  const locationSnippet = getAddressSnippet(location, 3);

  if (!seeker) return null;

  return (
    <Link href={`/oda-arayan/${seeker.id}`}>
      <article
        className="
          group relative overflow-hidden rounded-xl cursor-pointer
          border border-slate-200 bg-white shadow-sm
          hover:shadow-md hover:ring-1 hover:ring-slate-200 
          transition-all duration-200
          p-4
        "
        data-testid={`seeker-card-${seeker.id}`}
      >
        {/* Flex Container: mobilde stack, md+ ile side-by-side */}
        <div className="flex flex-col md:flex-row items-start gap-4">
          {/* SOL: Profil Fotoğrafı (100x100px, yuvarlak) */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="relative h-[100px] w-[100px] rounded-full overflow-hidden ring-2 ring-slate-200 shadow">
              <img
                src={photoUrl(seeker)}
                alt={name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      name || "U",
                    )}&background=8b5cf6&color=fff&size=400`;
                }}
              />
            </div>
          </div>

          {/* SAĞ: Bilgiler */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* İsim */}
            <h3 className="text-lg font-semibold text-slate-900 capitalize truncate">
              {name}
            </h3>

            {/* Bütçe - yeşil etiket */}
            {seeker.budgetMonthly && (
              <div className="inline-block rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                {budgetTR(seeker.budgetMonthly)}
              </div>
            )}

            {/* Alt etiketler satırı */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Konum Snippet */}
              {locationSnippet && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] bg-slate-50 text-slate-700 ring-1 ring-slate-200">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {locationSnippet}
                </span>
              )}

              {/* Meslek */}
              {seeker.occupation && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
                  <Briefcase className="h-3 w-3" aria-hidden="true" />
                  {seeker.occupation}
                </span>
              )}

              {/* Cinsiyet */}
              {gender && (
                <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${gender.color}`}>
                  {gender.label}
                </span>
              )}
            </div>

            {/* Tercihler (sigara/evcil hayvan) */}
            <div className="flex flex-wrap gap-1.5 text-xs text-slate-600">
              {seeker.smokingPreference && (
                <span className="inline-block rounded px-1.5 py-0.5 bg-slate-100">
                  {seeker.smokingPreference}
                </span>
              )}
              {seeker.petPreference && (
                <span className="inline-block rounded px-1.5 py-0.5 bg-slate-100">
                  {seeker.petPreference}
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
