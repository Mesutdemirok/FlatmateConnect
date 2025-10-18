import { Button } from "@/components/ui/button";
import { Heart, ShieldCheck } from "lucide-react";
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

interface ListingCardProps {
  listing?: {
    id?: string;
    title?: string | null;
    suburb?: string | null;
    rentAmount?: string | number | null;
    images?: Array<{ imagePath?: string; isPrimary?: boolean }>;
    user?: { verificationStatus?: string | null };
  };
  isFavorited?: boolean;
}

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=60";

export default function ListingCard({ listing, isFavorited = false }: ListingCardProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const id = listing?.id ?? "";
  const title = (listing?.title ?? "İlan").toString();
  const suburb = (listing?.suburb ?? "").toString();

  const amount = useMemo(() => {
    const v = listing?.rentAmount;
    if (typeof v === "string") return Number(v.replace(/[^\d.,-]/g, "").replace(",", "."));
    return Number(v ?? 0);
  }, [listing?.rentAmount]);

  const imgs = Array.isArray(listing?.images) && listing?.images.length
    ? listing!.images
    : [{ imagePath: FALLBACK_IMG, isPrimary: true }];

  const primary = imgs.find(i => i?.isPrimary) ?? imgs[0];
  const imageUrl = getAbsoluteImageUrl(primary?.imagePath || FALLBACK_IMG);
  const isVerified = listing?.user?.verificationStatus === "verified";

  const [favorite, setFavorite] = useState(isFavorited);

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (!id) return;
      if (favorite) await apiRequest("DELETE", `/api/favorites/${id}`);
      else await apiRequest("POST", "/api/favorites", { listingId: id });
    },
    onSuccess: () => {
      setFavorite(f => !f);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({ title: favorite ? t("success.removed_from_favorites") : t("success.added_to_favorites") });
    },
    onError: (err) => {
      if (isUnauthorizedError(err)) {
        toast({ title: t("errors.unauthorized"), description: "Lütfen giriş yapın.", variant: "destructive" });
        setTimeout(() => (window.location.href = "/giris"), 400);
        return;
      }
      toast({ title: "Hata", description: "Favoriler güncellenemedi.", variant: "destructive" });
    }
  });

  return (
    <Link href={id ? `/oda-ilani/${id}` : "#"}>
      <article
        className="h-[430px] w-full overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-md transition
                   flex flex-col"
        data-testid={`listing-card-${id || "noid"}`}
      >
        <div className="relative h-56 w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
            data-testid={`listing-image-${id || "noid"}`}
          />

          <div className="absolute right-2 top-2 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-indigo-700 shadow">
            {formatCurrency(Number.isFinite(amount) ? amount : 0)} <span className="text-xs text-indigo-600">/ay</span>
          </div>

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
            data-testid={`favorite-button-${id || "noid"}`}
          >
            <Heart className="h-5 w-5" strokeWidth={2} fill={favorite ? "currentColor" : "none"} />
          </Button>

          {isVerified && (
            <div className="absolute bottom-2 left-2 rounded-full bg-emerald-600/95 p-1.5 text-white shadow ring-1 ring-white/50">
              <ShieldCheck className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="flex-1 p-4">
          <h3 className="line-clamp-2 text-[17px] font-semibold text-slate-900">{title}</h3>
          {suburb && <p className="mt-1 line-clamp-1 text-sm text-slate-600">{suburb}</p>}
        </div>
      </article>
    </Link>
  );
}
