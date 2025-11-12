import { Star, MapPin, ChevronLeft, ChevronRight, Bed, Bath, Users } from "lucide-react";
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
    roomType?: string | null;
    propertyType?: string | null;
    bedroomCount?: number | null;
    bathroomCount?: number | null;
    currentOccupants?: number | null;
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get all images
  const images = useMemo(() => {
    if (!listing.images || listing.images.length === 0) return [];
    // Sort: primary first, then by order
    return [...listing.images].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return 0;
    });
  }, [listing.images]);

  const hasMultipleImages = images.length > 1;

  // Determine badge text (only show if within 7 days)
  const showNewBadge = useMemo(() => {
    return isWithinDays(listing.createdAt, 7);
  }, [listing.createdAt]);

  // Get current image URL
  const currentImageUrl = images[currentImageIndex]
    ? getAbsoluteImageUrl(images[currentImageIndex].imagePath || "")
    : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800";

  // Format location
  const location = useMemo(() => {
    const cityDistrict = [listing.district, listing.city].filter(Boolean).join(", ");
    if (cityDistrict) return cityDistrict;
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

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const listingUrl = listing.slug
    ? `/oda-ilani/${listing.slug}`
    : `/oda-ilani/${listing.id}`;

  return (
    <Link href={listingUrl}>
      <article
        data-testid={`card-listing-${listing.id}`}
        className="group block overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300"
      >
        {/* IMAGE CAROUSEL */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={currentImageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />

          {/* Left Arrow */}
          {hasMultipleImages && (
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-105 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" strokeWidth={2.5} />
            </button>
          )}

          {/* Right Arrow */}
          {hasMultipleImages && (
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-105 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" strokeWidth={2.5} />
            </button>
          )}

          {/* NEW BADGE */}
          {showNewBadge && (
            <div className="absolute top-3 left-3 px-4 py-2 rounded-lg bg-white text-gray-900 text-sm font-bold shadow-md">
              YENİ
            </div>
          )}

          {/* IMAGE COUNTER */}
          {hasMultipleImages && (
            <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-gray-800/70 text-white text-sm font-medium">
              {currentImageIndex + 1}/{images.length}
            </div>
          )}

          {/* FAVORITE BUTTON */}
          <button
            data-testid={`button-favorite-${listing.id}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isAuthenticated) {
                window.location.href = "/giris";
                return;
              }
              toggleFavorite.mutate();
            }}
            className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-transparent border-2 border-white flex items-center justify-center transition-all hover:scale-110"
            aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <Star
              className={`w-6 h-6 ${favorite ? "fill-white text-white" : "text-white"}`}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* INFO SECTION */}
        <div className="p-4 bg-white">
          {/* Title and Price Row */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
              {listing.title}
            </h3>
            <div className="text-xl font-semibold text-teal-600 whitespace-nowrap">
              ₺{Math.round(amount).toLocaleString("tr-TR")} <span className="text-sm font-normal text-gray-600">ay</span>
            </div>
          </div>

          {/* Location */}
          {location && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
              <span className="line-clamp-1">{location}</span>
            </div>
          )}

          {/* Availability */}
          <div className="text-sm text-gray-600 mb-3">
            Şimdi müsait
          </div>

          {/* Icons Row */}
          <div className="flex items-center gap-4 text-gray-700">
            {listing.bedroomCount !== null && listing.bedroomCount !== undefined && (
              <div className="flex items-center gap-1.5">
                <Bed className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-medium">{listing.bedroomCount}</span>
              </div>
            )}
            {listing.bathroomCount !== null && listing.bathroomCount !== undefined && (
              <div className="flex items-center gap-1.5">
                <Bath className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">{listing.bathroomCount}</span>
              </div>
            )}
            {listing.currentOccupants !== null && listing.currentOccupants !== undefined && (
              <div className="flex items-center gap-1.5">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">{listing.currentOccupants}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
