import { Heart, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatCurrency } from "@/lib/formatters";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";

interface ListingCardProps {
  listing: {
    id: string;
    slug?: string | null;
    title: string;
    city?: string | null;
    district?: string | null;
    address?: string | null;
    rentAmount: string | number;
    images?: Array<{ imagePath?: string; isPrimary?: boolean }>;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    user?: { verificationStatus?: string | null };
  };
  isFavorited?: boolean;
}

// Helper to check if date is within last N days
const isWithinDays = (date: string | Date | undefined, days: number): boolean => {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays < days;
};

export default function ListingCard({
  listing,
  isFavorited = false,
}: ListingCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [favorite, setFavorite] = useState(isFavorited);
  const [imageError, setImageError] = useState(false);

  // Determine badge text
  const badge = useMemo(() => {
    if (isWithinDays(listing.updatedAt, 7)) return "GÜNCELLEND İ";
    if (isWithinDays(listing.createdAt, 7)) return "YENİ";
    return null;
  }, [listing.createdAt, listing.updatedAt]);

  // Get primary image
  const primaryImage = listing.images?.find(img => img.isPrimary) ?? listing.images?.[0];
  const imageUrl = getAbsoluteImageUrl(primaryImage?.imagePath || "");

  // Format location with fallback to address
  const location = useMemo(() => {
    const cityDistrict = [listing.district, listing.city].filter(Boolean).join(", ");
    if (cityDistrict) return cityDistrict;
    // Fallback: show first part of address (before comma or first 40 chars)
    if (listing.address) {
      const addressPart = listing.address.split(",")[0];
      return addressPart.length > 40 ? addressPart.substring(0, 37) + "..." : addressPart;
    }
    return "";
  }, [listing.district, listing.city, listing.address]);

  // Format price
  const amount = useMemo(() => {
    const v = listing.rentAmount;
    if (typeof v === "string") return Number(v.replace(/[^\d.,-]/g, "").replace(",", "."));
    return Number(v ?? 0);
  }, [listing.rentAmount]);

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (favorite) await apiRequest("DELETE", `/api/favorites/${listing.id}`);
      else await apiRequest("POST", "/api/favorites", { listingId: listing.id });
    },
    onSuccess: () => {
      setFavorite(!favorite);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: favorite ? "Favorilerden Çıkarıldı" : "Favorilere Eklendi",
      });
    },
    onError: (err) => {
      if (isUnauthorizedError(err)) {
        toast({
          title: "Giriş Gerekli",
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

  const listingUrl = listing.slug
    ? `/oda-ilani/${listing.slug}`
    : `/oda-ilani/${listing.id}`;

  return (
    <Link href={listingUrl}>
      <article
        data-testid={`card-listing-${listing.id}`}
        className="group block overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      >
        {/* HERO IMAGE */}
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          {!imageError ? (
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <p className="text-white text-sm font-medium">Görsel bulunamadı</p>
            </div>
          )}

          {/* NEW/UPDATED BADGE */}
          {badge && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-teal-500 text-white text-xs font-bold shadow-lg">
              {badge}
            </div>
          )}

          {/* FAVORITE BUTTON */}
          <button
            data-testid={`button-favorite-${listing.id}`}
            onClick={(e) => {
              e.preventDefault();
              if (!isAuthenticated) {
                window.location.href = "/giris";
                return;
              }
              toggleFavorite.mutate();
            }}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
            aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <Heart
              className={`w-5 h-5 ${favorite ? "fill-red-500 text-red-500" : "text-gray-700"}`}
              strokeWidth={2}
            />
          </button>

          {/* BOTTOM OVERLAY */}
          <div className="absolute bottom-0 left-0 right-0 bg-white m-3 rounded-xl p-4 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
              {listing.title}
            </h3>

            {location && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span className="line-clamp-1">{location}</span>
              </div>
            )}

            <div className="text-2xl font-bold text-purple-600">
              ₺{formatCurrency(amount)}
              <span className="text-base font-normal text-gray-600">/ay</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
