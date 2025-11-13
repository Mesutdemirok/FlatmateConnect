// ODANET Mobil Detay Revizyonu – Ana İlan Detay Sayfası
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";
import type { ListingWithRelations, FavoriteStatus } from "@/lib/listingApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import TitleBlock from "@/components/listing/TitleBlock";
import KeyFacts from "@/components/listing/KeyFacts";
import FeatureChips from "@/components/listing/FeatureChips";
import OwnerCard from "@/components/listing/OwnerCard";
import StickyCTA from "@/components/listing/StickyCTA";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Upload,
  Calendar,
} from "lucide-react";

export default function ListingDetail() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Listing data
  const {
    data: listing,
    isLoading,
    error,
  } = useQuery<ListingWithRelations>({
    queryKey: [`/api/listings/slug/${slug}`],
    enabled: !!slug,
  });

  // Favorite state
  const { data: favoriteStatus } = useQuery<FavoriteStatus>({
    queryKey: [`/api/favorites/${listing?.id}/check`],
    enabled: !!listing?.id && isAuthenticated,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!listing?.id) return;
      if (favoriteStatus?.isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${listing.id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { listingId: listing.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/favorites/${listing?.id}/check`],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: favoriteStatus?.isFavorite
          ? t("success.favorite_removed")
          : t("success.favorite_added"),
        description: favoriteStatus?.isFavorite
          ? t("success.favorite_removed_description")
          : t("success.favorite_added_description"),
      });
    },
    onError: (err) => {
      if (isUnauthorizedError(err)) {
        toast({
          title: t("errors.unauthorized"),
          description: t("errors.unauthorized_description"),
          variant: "destructive",
        });
        setTimeout(() => setLocation(`/giris?next=/oda-ilani/${slug}`), 500);
        return;
      }
      toast({
        title: t("errors.network_error"),
        description: t("errors.favorite_update_failed"),
        variant: "destructive",
      });
    },
  });

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      setLocation(`/giris?next=/oda-ilani/${slug}`);
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  const handleContactOwner = () => {
    if (!listing) return;
    
    if (!isAuthenticated) {
      // After login, redirect directly to the conversation with the owner
      setLocation(`/giris?next=/mesajlar/${listing.user.id}`);
      return;
    }
    
    // Navigate to direct message conversation with the listing owner
    setLocation(`/mesajlar/${listing.user.id}`);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-background"
        data-testid="listing-detail-loading"
      >
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  // Error handling
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">İlan Bulunamadı</h1>
          <p className="text-slate-600 mb-6">
            Aradığınız ilan mevcut değil veya kaldırılmış olabilir.
          </p>
          <Link href="/oda-ilanlari">
            <Button>Aramalara Dön</Button>
          </Link>
        </main>
      </div>
    );
  }

  // Images
  const hasImages = Array.isArray(listing.images) && listing.images.length > 0;
  const safeImages = hasImages ? listing.images : [];
  const currentImage = hasImages ? safeImages[currentImageIndex] : undefined;

  const mainImageUrl = currentImage
    ? getAbsoluteImageUrl(currentImage.imagePath)
    : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=60";

  const title = listing.title || "İlan";
  const availability = t("listings.available_now");

  // Rozet metinleri (TitleBlock için)
  const badges: string[] = [];
  if (listing.propertyType) badges.push(listing.propertyType);
  if (listing.furnishingStatus) badges.push(listing.furnishingStatus);
  if (listing.bathroomType) badges.push(`banyo: ${listing.bathroomType}`);

  // Fiyat formatı (StickyCTA için)
  const formattedPrice = formatCurrency(Number(listing.rentAmount));

  // Kullanıcı bilgileri (OwnerCard için)
  const ownerName = `${listing.user.firstName || ""} ${listing.user.lastName || ""}`.trim() || "Anonim Kullanıcı";
  const ownerPhoto = listing.user.profileImageUrl
    ? getAbsoluteImageUrl(listing.user.profileImageUrl)
    : undefined;

  // SEO data
  const seoTitle = `${listing.title} - ${listing.address || 'Kiralık Oda'} | Odanet`;
  const seoDescription = `${formatCurrency(Number(listing.rentAmount))} kiralık oda. ${listing.propertyType || ''} ${listing.furnishingStatus || ''}. ${listing.address || ''}. Hemen incele!`;
  const seoImage = mainImageUrl;
  const seoUrl = `https://www.odanet.com.tr/oda-ilani/${listing.slug || listing.id}`;

  // UI
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-indigo-50/30 via-white to-violet-50/30 pb-24"
      data-testid="listing-detail-page"
    >
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
        image={seoImage}
        url={seoUrl}
      />
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back button */}
        <Link href="/oda-ilanlari">
          <Button variant="ghost" className="mb-4" data-testid="back-button">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Aramaya Geri Dön
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - Mobil odaklı */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="relative">
              <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-100 ring-1 ring-slate-200">
                <img
                  src={mainImageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                  data-testid="listing-main-image"
                />

                {!hasImages && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Upload className="h-12 w-12 mx-auto mb-2 opacity-70" />
                      <p className="text-sm font-medium">
                        Henüz fotoğraf eklenmemiş
                      </p>
                    </div>
                  </div>
                )}

                {hasImages && safeImages.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-lg"
                      onClick={() =>
                        setCurrentImageIndex(
                          (i) =>
                            (i - 1 + safeImages.length) % safeImages.length,
                        )
                      }
                      data-testid="previous-image-button"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-lg"
                      onClick={() =>
                        setCurrentImageIndex((i) => (i + 1) % safeImages.length)
                      }
                      data-testid="next-image-button"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                      {currentImageIndex + 1} / {safeImages.length}
                    </div>
                  </>
                )}

                {/* Favorite button - overlaid */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm shadow-lg"
                  onClick={handleFavoriteToggle}
                  disabled={toggleFavoriteMutation.isPending}
                  data-testid="favorite-button-overlay"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      favoriteStatus?.isFavorite
                        ? "fill-red-500 text-red-500"
                        : "text-slate-600"
                    }`}
                  />
                </Button>
              </div>

              {/* Thumbnails */}
              {hasImages && safeImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {safeImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden ring-2 transition ${
                        idx === currentImageIndex
                          ? "ring-violet-500"
                          : "ring-slate-200"
                      }`}
                      data-testid={`thumbnail-${idx}`}
                    >
                      <img
                        src={getAbsoluteImageUrl(img.imagePath)}
                        alt={`${title} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TitleBlock */}
            <TitleBlock
              title={title}
              address={listing.address}
              badges={badges}
            />

            {/* Müsaitlik & Fiyat - Mobil */}
            <div className="lg:hidden rounded-2xl shadow-sm bg-white ring-1 ring-slate-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Aylık Kira</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{formattedPrice}/ay</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>{availability}</span>
                </div>
              </div>
            </div>

            {/* KeyFacts (Oda Bilgileri) */}
            <KeyFacts
              totalRooms={listing.totalRooms || undefined}
              totalOccupants={listing.totalOccupants || undefined}
              roommatePreference={listing.roommatePreference || undefined}
              smokingPolicy={listing.smokingPolicy || undefined}
              bathroomType={listing.bathroomType || undefined}
              furnishingStatus={listing.furnishingStatus || undefined}
            />

            {/* FeatureChips (Özellikler ve Olanaklar) */}
            <FeatureChips
              internetIncluded={listing.internetIncluded || false}
              billsIncluded={listing.billsIncluded || false}
              amenities={listing.amenities || []}
            />

            {/* Description Section */}
            {listing.description && (
              <div className="rounded-2xl shadow-sm bg-white ring-1 ring-slate-100 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Açıklama</h2>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Address Section */}
            <div className="rounded-2xl shadow-sm bg-white ring-1 ring-slate-100 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Konum</h2>
              <div className="space-y-3">
                {(listing.city || listing.district || listing.neighborhood) && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {[listing.neighborhood, listing.district, listing.city].filter(Boolean).join(", ")}
                      </p>
                      {listing.address && (
                        <p className="text-sm text-slate-600 mt-1">{listing.address}</p>
                      )}
                    </div>
                  </div>
                )}
                {!listing.city && !listing.district && !listing.neighborhood && listing.address && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{listing.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Terms Section */}
            {(() => {
              const hasDeposit = listing.deposit && !isNaN(Number(listing.deposit));
              const hasMoveInDate = listing.moveInDate && !isNaN(new Date(listing.moveInDate).getTime());
              const hasMinStay = listing.minStayMonths && Number(listing.minStayMonths) > 0;
              
              if (!hasDeposit && !hasMoveInDate && !hasMinStay) return null;
              
              return (
                <div className="rounded-2xl shadow-sm bg-white ring-1 ring-slate-100 p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Kiralama Koşulları</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {hasDeposit && (
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Depozito</p>
                          <p className="font-semibold text-slate-900">{formatCurrency(Number(listing.deposit))}</p>
                        </div>
                      </div>
                    )}
                    {hasMoveInDate && (
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-purple-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Taşınma Tarihi</p>
                          <p className="font-semibold text-slate-900">{formatDate(new Date(listing.moveInDate))}</p>
                        </div>
                      </div>
                    )}
                    {hasMinStay && (
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Min. Kalış Süresi</p>
                          <p className="font-semibold text-slate-900">{listing.minStayMonths} ay</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* OwnerCard - Mobil */}
            <div className="lg:hidden">
              <OwnerCard
                ownerName={ownerName}
                ownerPhoto={ownerPhoto}
                ownerInitials={
                  (listing.user.firstName?.[0] || "U") +
                  (listing.user.lastName?.[0] || "")
                }
                onContactClick={handleContactOwner}
                showContactButton={user?.id !== listing.userId}
              />
            </div>
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block space-y-6">
            {/* Fiyat & Müsaitlik */}
            <div className="rounded-2xl shadow-sm bg-white ring-1 ring-slate-100 p-5">
              <div className="text-center mb-6">
                <div
                  className="text-3xl font-bold text-slate-900"
                  data-testid="listing-price"
                >
                  {formattedPrice}
                  <span className="text-lg font-normal text-slate-600">
                    /ay
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-600 flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{availability}</span>
                </div>
              </div>

              <div className="space-y-3">
                {user?.id === listing.userId ? (
                  <Button
                    onClick={() => setLocation(`/ilan-duzenle/${listing.id}`)}
                    className="w-full"
                    style={{ backgroundColor: "#f97316" }}
                    data-testid="edit-listing-button"
                  >
                    Düzenle
                  </Button>
                ) : (
                  <Button
                    onClick={handleContactOwner}
                    className="w-full text-white"
                    style={{ backgroundColor: "#f97316" }}
                    data-testid="contact-owner-button"
                  >
                    {t("listings.contact_owner")}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={handleFavoriteToggle}
                  disabled={toggleFavoriteMutation.isPending}
                  className="w-full"
                  data-testid="favorite-button-sidebar"
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${
                      favoriteStatus?.isFavorite
                        ? "fill-red-500 text-red-500"
                        : ""
                    }`}
                  />
                  {favoriteStatus?.isFavorite
                    ? t("listings.remove_from_favorites")
                    : t("listings.add_to_favorites")}
                </Button>
              </div>
            </div>

            {/* OwnerCard - Desktop */}
            <OwnerCard
              ownerName={ownerName}
              ownerPhoto={ownerPhoto}
              ownerInitials={
                (listing.user.firstName?.[0] || "U") +
                (listing.user.lastName?.[0] || "")
              }
              onContactClick={handleContactOwner}
              showContactButton={user?.id !== listing.userId}
            />
          </div>
        </div>
      </main>

      {/* StickyCTA - Mobil */}
      <div className="lg:hidden">
        <StickyCTA
          price={formattedPrice}
          onContact={handleContactOwner}
          disabled={user?.id === listing.userId}
        />
      </div>

      <Footer />
    </div>
  );
}
