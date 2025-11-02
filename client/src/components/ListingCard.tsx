import { Button } from "@/components/ui/button";
import { Heart, ShieldCheck, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatCurrency } from "@/lib/formatters";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";

type AspectOpt = "16/9" | "4/3" | "16/10";

interface ListingCardProps {
  listing?: {
    id?: string;
    slug?: string | null;
    title?: string | null;
    suburb?: string | null;
    address?: string | null;
    rentAmount?: string | number | null;
    totalOccupants?: number | null;
    roommatePreference?: string | null;
    furnishingStatus?: string | null;
    smokingPolicy?: string | null;
    images?: Array<{ imagePath?: string; isPrimary?: boolean }>;
    user?: { verificationStatus?: string | null };
  };
  isFavorited?: boolean;
  imageAspect?: AspectOpt;
  addressOverlay?: boolean;
}

const aspectClass = (a?: AspectOpt) =>
  a === "4/3"
    ? "aspect-[4/3]"
    : a === "16/9"
      ? "aspect-[16/9]"
      : "aspect-[16/10]";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=60";

export default function ListingCard({
  listing,
  isFavorited = false,
  imageAspect = "16/10",
  addressOverlay = false,
}: ListingCardProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const id = listing?.id ?? "";
  const title = (listing?.title ?? "İlan").toString();
  const suburb = (listing?.suburb ?? "").toString();
  const address = (listing?.address ?? "").toString();
  const totalOccupants = listing?.totalOccupants;
  const roommatePreference = listing?.roommatePreference;
  const furnishingStatus = listing?.furnishingStatus;
  const smokingPolicy = listing?.smokingPolicy;
  const isVerified = listing?.user?.verificationStatus === "verified";

  const amount = useMemo(() => {
    const v = listing?.rentAmount;
    if (typeof v === "string")
      return Number(v.replace(/[^\d.,-]/g, "").replace(",", "."));
    return Number(v ?? 0);
  }, [listing?.rentAmount]);

  const imgs =
    Array.isArray(listing?.images) && listing?.images.length
      ? listing!.images
      : [{ imagePath: FALLBACK_IMG, isPrimary: true }];

  const primary = imgs.find((i) => i?.isPrimary) ?? imgs[0];
  const imageUrl = getAbsoluteImageUrl(primary?.imagePath || FALLBACK_IMG);
  const [favorite, setFavorite] = useState(isFavorited);

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (!id) return;
      if (favorite) await apiRequest("DELETE", `/api/favorites/${id}`);
      else await apiRequest("POST", "/api/favorites", { listingId: id });
    },
    onSuccess: () => {
      setFavorite((f) => !f);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: favorite
          ? t("success.removed_from_favorites")
          : t("success.added_to_favorites"),
      });
    },
    onError: (err) => {
      if (isUnauthorizedError(err)) {
        toast({
          title: t("errors.unauthorized"),
          description: "Lütfen giriş yapın.",
          variant: "destructive",
        });
        setTimeout(() => (window.location.href = "/giris"), 400);
        return;
      }
      toast({
        title: "Hata",
        description: "Favoriler güncellenemedi.",
        variant: "destructive",
      });
    },
  });

  const listingUrl = listing?.slug
    ? `/oda-ilani/${listing.slug}`
    : id
      ? `/oda-ilani/${id}`
      : "#";

  return (
    <Link href={listingUrl}>
      <article className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-lg hover:-translate-y-[2px]">
        {/* IMAGE AREA */}
        <div className="relative w-full h-[180px] md:h-[220px] overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* PRICE BADGE */}
          <div className="absolute top-2 right-2 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-indigo-700 shadow">
            {formatCurrency(Number.isFinite(amount) ? amount : 0)}{" "}
            <span className="text-xs text-indigo-600">/ay</span>
          </div>

          {/* FAVORITE BUTTON */}
          <Button
            variant="secondary"
            size="icon"
            aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
            className="absolute left-2 top-2 h-10 w-10 rounded-full bg-orange-600 text-white hover:bg-orange-700 shadow ring-1 ring-white/50"
            onClick={(e) => {
              e.preventDefault();
              if (!isAuthenticated) return (window.location.href = "/giris");
              toggleFavorite.mutate();
            }}
          >
            <Heart
              className="h-5 w-5"
              strokeWidth={2}
              fill={favorite ? "currentColor" : "none"}
            />
          </Button>

          {/* VERIFIED ICON */}
          {isVerified && (
            <div className="absolute bottom-2 left-2 rounded-full bg-emerald-600/95 p-1.5 text-white shadow ring-1 ring-white/50">
              <ShieldCheck className="h-4 w-4" />
            </div>
          )}

          {/* ADDRESS OVERLAY */}
          {addressOverlay && (address || suburb) && (
            <div className="absolute left-2 bottom-2 sm:left-3 sm:bottom-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-slate-700 shadow-sm ring-1 ring-black/5">
              <MapPin className="w-3.5 h-3.5 text-violet-600" />
              <span className="max-w-[14ch] truncate">{address || suburb}</span>
            </div>
          )}
        </div>

        {/* INFO AREA */}
        <div className="flex flex-col flex-1 px-4 py-3 md:py-4">
          <h3 className="text-[15px] sm:text-[17px] font-semibold text-slate-900 leading-snug line-clamp-2">
            {title}
          </h3>
          {!addressOverlay && suburb && (
            <p className="mt-0.5 text-[13px] sm:text-sm text-slate-600 truncate flex items-center gap-1">
              <MapPin className="w-4 h-4 text-violet-500" />
              {suburb}
            </p>
          )}

          {/* ROOM INFO BADGES */}
          {(totalOccupants || roommatePreference || furnishingStatus || smokingPolicy) && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {totalOccupants && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] sm:text-xs font-medium">
                  👥 {totalOccupants} kişi
                </span>
              )}
              {roommatePreference && roommatePreference !== "Farketmez" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[11px] sm:text-xs font-medium">
                  {roommatePreference === "Kadın" ? "👩 Kadın" : "👨 Erkek"}
                </span>
              )}
              {(!roommatePreference || roommatePreference === "Farketmez") && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] sm:text-xs font-medium">
                  🤝 Farketmez
                </span>
              )}
              {smokingPolicy && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] sm:text-xs font-medium">
                  {smokingPolicy === "İçilmez" ? "🚭 İçilmez" : smokingPolicy === "İçilir" ? "🚬 İçilir" : "🤝 Farketmez"}
                </span>
              )}
              {furnishingStatus && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] sm:text-xs font-medium">
                  {furnishingStatus === "Eşyalı"
                    ? "🛋️ Eşyalı"
                    : furnishingStatus === "Eşyasız"
                      ? "📦 Eşyasız"
                      : "🤝 Farketmez"}
                </span>
              )}
            </div>
          )}

          {/* CTA BUTTON */}
          <div className="mt-auto pt-3">
            <Button
              asChild
              className="w-full h-9 md:h-10 bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-semibold rounded-lg flex items-center justify-center transition"
            >
              <span>Detay Gör</span>
            </Button>
          </div>
        </div>
      </article>
    </Link>
  );
}
