// ODANET Revizyon – Yeni SeekerCard tasarımı
// Sol: 100x100px profil foto, Sağ: renkli etiketler + bilgiler
import { useLocation } from "wouter";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
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

export default function SeekerCard({ seeker }: { seeker: SeekerProfileWithRelations }) {
  const [, navigate] = useLocation();
  const name = displayName(seeker);

  if (!seeker) return null;

  return (
    <article
      role="button"
      onClick={() => navigate(`/oda-arayan/${seeker.id}`)}
      className="
        group relative overflow-hidden rounded-xl
        border border-slate-200 bg-white shadow-sm
        hover:shadow-md transition-shadow duration-200
        p-4 cursor-pointer
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
          <div>
            <span className="inline-block rounded-full bg-green-600 text-white px-3 py-1 text-xs font-semibold">
              {budgetTR(seeker.budgetMonthly)}
            </span>
          </div>

          {/* Lokasyon - mor etiket */}
          {seeker.preferredLocation && (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 text-white px-3 py-1 text-xs font-semibold">
                <MapPin className="h-3.5 w-3.5" />
                {seeker.preferredLocation}
              </span>
            </div>
          )}

          {/* Meslek - siyah etiket */}
          {seeker.occupation && (
            <div>
              <span className="inline-block rounded-full bg-gray-900 text-white px-3 py-1 text-xs font-semibold">
                {seeker.occupation}
              </span>
            </div>
          )}

          {/* Yaş - pembe etiket */}
          {seeker.age && (
            <div>
              <span className="inline-block rounded-full bg-pink-600 text-white px-3 py-1 text-xs font-semibold">
                {seeker.age} yaş
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ALT: Turuncu buton */}
      <div className="mt-4">
        <Button
          className="
            w-full md:w-auto rounded-lg font-semibold
            text-white shadow
          "
          style={{ backgroundColor: "#f97316" }}
          onClick={(e) => {
            e.stopPropagation();
            if (seeker.userId) {
              navigate(`/mesajlar?user=${seeker.userId}`);
            } else {
              navigate(`/oda-arayan/${seeker.id}`);
            }
          }}
          data-testid={`contact-seeker-${seeker.id}`}
        >
          İletişime Geçin
        </Button>
      </div>
    </article>
  );
}
