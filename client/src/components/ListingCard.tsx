import { Button } from "@/components/ui/button";
import { Heart, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatCurrency } from "@/lib/formatters";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";

interface ListingCardProps {
  listing?: {
    id?: string;
    title?: string | null;
    suburb?: string | null;
    rentAmount?: string | number | null;
    availableFrom?: string | null;
    images?: Array<{
      imagePath?: string;
      isPrimary?: boolean;
    }>;
    user?: {
      firstName?: string | null;
      verificationStatus?: string | null;
    };
  };
  isFavorited?: boolean;
  showDistance?: boolean;
  distance?: string;
}

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=60";

export default function ListingCard({
  listing,
  isFavorited = false,
  showDistance = false,
  distance,
}: ListingCardProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- Safe fields (avoid touching undefined) ---
  const id = listing?.id ?? "";
  const rawTitle = (listing?.title ?? "").toString().trim();
  const title4 =
    rawTitle.length > 0
      ? rawTitle.split(/\s+/).slice(0, 4).join(" ") +
        (rawTitle.split(/\s+/).length > 4 ? "…" : "")
      : "İlan";

  const suburb = (listing?.suburb ?? "").toString();
  const amountNumber = Number(
    typeof listing?.rentAmount === "string"
      ? listing?.rentAmount.replace(/[^\d.,-]/g, "").replace(",", ".")
      : (listing?.rentAmount ?? 0),
  );
  const rentLabel = formatCurrency(
    Number.isFinite(amountNumber) ? amountNumber : 0,
  );

  const imgs =
    Array.isArray(listing?.images) && listing?.images?.length
      ? listing!.images!
      : [{ imagePath: FALLBACK_IMG, isPrimary: true }];

  const primaryImage = imgs.find((img) => img?.isPrimary) ??
    imgs[0] ?? { imagePath: FALLBACK_IMG };
  const imageUrl = getAbsoluteImageUrl(primaryImage?.imagePath || FALLBACK_IMG);

  const isVerified = listing?.user?.verificationStatus === "verified";

  const [favorite, setFavorite] = useState(isFavorited);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!id) return; // nothing to do without an id
      if (favorite) {
        await apiRequest("DELETE", `/api/favorites/${id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { listingId: id });
      }
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
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t("errors.unauthorized"),
          description: "Oturumunuz sonlandı. Lütfen tekrar giriş yapın.",
          variant: "destructive",
        });
        setTimeout(() => (window.location.href = "/giris"), 500);
        return;
      }
      toast({
        title: "Hata",
        description: "Favoriler güncellenemedi.",
        variant: "destructive",
      });
    },
  });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return (window.location.href = "/giris");
    if (!id) return; // guard
    toggleFavoriteMutation.mutate();
  };

  return (
    <Link href={id ? `/oda-ilani/${id}` : "#"}>
      <div
        className="
          group relative cursor-pointer overflow-hidden rounded-2xl
          bg-gradient-to-b from-[#f9faff] via-[#f3f6ff] to-[#edf0ff]
          ring-1 ring-black/5 shadow-sm hover:shadow-lg transition-all duration-300
          before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5
          before:bg-gradient-to-b before:from-indigo-500 before:to-fuchsia-500
        "
        data-testid={`listing-card-${id || "noid"}`}
      >
        {/* Image */}
        <div className="relative mx-2 mt-2 mb-1 overflow-hidden rounded-lg ring-1 ring-black/5 sm:mx-3 sm:mt-3 sm:mb-2 -ml-0.5">
          <img
            src={imageUrl}
            alt={title4}
            className="w-full h-[168px] sm:h-[210px] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            data-testid={`listing-image-${id || "noid"}`}
          />

          {/* Single price */}
          <div className="absolute right-2 top-2 sm:right-3 sm:top-3 rounded-full bg-white/95 px-2.5 py-1 sm:px-3 text-[12px] sm:text-sm font-semibold text-indigo-700 shadow-sm backdrop-blur">
            {rentLabel}
            <span className="ml-1 text-[11px] sm:text-xs font-medium text-indigo-600">
              /ay
            </span>
          </div>

          {/* Favorite — dark orange */}
          <Button
            variant="secondary"
            size="icon"
            aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
            className="
              absolute left-2 top-2 h-9 w-9 sm:h-10 sm:w-10 rounded-full
              bg-orange-600 text-white shadow-sm ring-1 ring-white/40
              hover:bg-orange-700 active:scale-95 transition
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70
            "
            onClick={handleToggleFavorite}
            disabled={toggleFavoriteMutation.isPending || !id}
            aria-pressed={favorite}
            data-testid={`favorite-button-${id || "noid"}`}
          >
            <Heart
              className="h-5 w-5"
              strokeWidth={2}
              fill={favorite ? "currentColor" : "none"}
            />
          </Button>

          {/* Verified badge */}
          {isVerified && (
            <div className="absolute bottom-2 left-2 rounded-full bg-emerald-600/95 p-1.5 text-white shadow-sm ring-1 ring-white/40 sm:bottom-3 sm:left-3">
              <ShieldCheck className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
          <h3 className="text-[15.5px] sm:text-[17px] font-semibold text-slate-900 leading-snug">
            {title4}
          </h3>
          <p
            className="mt-0.5 sm:mt-1 text-[13px] sm:text-sm text-slate-600 truncate"
            title={`${suburb}${showDistance && distance ? ` • ${distance}` : ""}`}
          >
            {suburb}
            {showDistance && distance ? ` • ${distance}` : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}
