import React from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";
import type { SeekerProfileWithRelations } from "@/lib/seekerApi";

type Props = { seeker: SeekerProfileWithRelations };

function displayName(s: SeekerProfileWithRelations) {
  if (s.fullName) {
    const parts = s.fullName.trim().split(/\s+/);
    return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
  }
  if (s.user?.firstName) {
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
  if (s.profilePhotoUrl) return getAbsoluteImageUrl(s.profilePhotoUrl);
  const p = s.photos?.find((x) => x.sortOrder === 0) ?? s.photos?.[0];
  if (p?.imagePath) return getAbsoluteImageUrl(p.imagePath);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName(s),
  )}&background=8b5cf6&color=fff&size=400`;
}

export default function SeekerCard({ seeker }: Props) {
  const [, navigate] = useLocation();
  const name = displayName(seeker);

  return (
    <article
      role="button"
      onClick={() => navigate(`/oda-arayan/${seeker.id}`)}
      className="
        group relative overflow-hidden rounded-2xl
        border border-slate-200 bg-white shadow-sm
        hover:shadow-lg transition-shadow duration-300
        p-4
      "
      data-testid={`seeker-card-${seeker.id}`}
    >
      {/* Top row: avatar + main info */}
      <div className="flex items-start gap-4">
        {/* Circular photo */}
        <div className="shrink-0">
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full ring-2 ring-white shadow-md overflow-hidden">
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

        {/* Details */}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-slate-900 leading-tight truncate">
            {name.toLowerCase()}
          </h3>

          {/* BÜTÇE */}
          <div className="mt-2">
            <p className="text-xs font-semibold text-slate-500 tracking-wide">
              BÜTÇE
            </p>
            <div className="mt-1 inline-flex items-center rounded-full bg-emerald-600 text-white px-3 py-1 text-sm font-bold">
              {budgetTR(seeker.budgetMonthly)}
            </div>
          </div>

          {/* LOKASYON */}
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500 tracking-wide">
              LOKASYON
            </p>
            <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-violet-600 text-white px-3 py-1 text-sm font-semibold">
              <MapPin className="h-4 w-4 opacity-90" />
              {seeker.preferredLocation?.trim() || "Lokasyon bilgisi yok"}
            </div>
          </div>

          {/* MESLEK / DURUM */}
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500 tracking-wide">
              MESLEK / DURUM
            </p>
            <div className="mt-1 inline-flex items-center rounded-full bg-slate-900 text-white px-3 py-1 text-sm font-semibold">
              {seeker.occupation?.trim() || "Belirtilmemiş"}
            </div>
          </div>

          {/* YAŞ */}
          {seeker.age ? (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500 tracking-wide">
                YAŞ
              </p>
              <div className="mt-1 inline-flex items-center rounded-full bg-pink-500 text-white px-3 py-1 text-sm font-semibold">
                {seeker.age} yaş
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Action */}
      <div className="mt-4">
        <Button
          className="
            w-full rounded-xl bg-orange-600 hover:bg-orange-700
            text-white font-semibold h-11
          "
          onClick={(e) => {
            e.stopPropagation();
            if (seeker.userId) {
              navigate(`/mesajlar?user=${seeker.userId}`);
            } else {
              navigate(`/oda-arayan/${seeker.id}`);
            }
          }}
        >
          İletişime Geç
        </Button>
      </div>
    </article>
  );
}
