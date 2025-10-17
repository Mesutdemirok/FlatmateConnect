import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Heart, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Home, 
  Wifi, 
  Car, 
  Zap,
  Shield,
  ChevronLeft,
  ChevronRight,
  Upload
} from "lucide-react";

export default function ListingDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: listing, isLoading, error } = useQuery<ListingWithRelations>({
    queryKey: [`/api/listings/${id}`],
    enabled: !!id,
  });

  const { data: favoriteStatus } = useQuery<FavoriteStatus>({
    queryKey: [`/api/favorites/${id}/check`],
    enabled: !!id && isAuthenticated,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (favoriteStatus?.isFavorite) {
        await apiRequest('DELETE', `/api/favorites/${id}`);
      } else {
        await apiRequest('POST', '/api/favorites', { listingId: id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${id}/check`] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: favoriteStatus?.isFavorite ? t('success.favorite_removed') : t('success.favorite_added'),
        description: favoriteStatus?.isFavorite ? t('success.favorite_removed_description') : t('success.favorite_added_description')
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t('errors.unauthorized'),
          description: t('errors.unauthorized_description'),
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation(`/giris?next=/oda-ilani/${id}`);
        }, 500);
        return;
      }
      toast({
        title: t('errors.network_error'),
        description: t('errors.favorite_update_failed'),
        variant: "destructive"
      });
    }
  });

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      setLocation(`/giris?next=/oda-ilani/${id}`);
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  const handleContactOwner = () => {
    if (!isAuthenticated) {
      setLocation(`/giris?next=/oda-ilani/${id}`);
      return;
    }
    if (!listing) return;
    setLocation(`/mesajlar?user=${listing.user.id}&listing=${listing.id}`);
  };

  const nextImage = () => {
    if (listing && listing.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const previousImage = () => {
    if (listing && listing.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  const formatAvailability = (dateString: string | null) => {
    if (!dateString) return t('listings.available_now');
    const date = new Date(dateString);
    return date > new Date() ? formatDate(dateString) : t('listings.available_now');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="listing-detail-loading">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="w-full h-96 rounded-lg mb-6" />
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-24 mb-4" />
                  <Skeleton className="h-10 w-full mb-3" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background" data-testid="listing-detail-error">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-2">{t('listings.not_found_title')}</h1>
              <p className="text-muted-foreground mb-4">
                {t('listings.not_found_message')}
              </p>
              <Link href="/oda-ilanlari">
                <Button>Diğer İlanları İncele</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const hasImages = listing.images && listing.images.length > 0;
  const currentImage = hasImages ? listing.images[currentImageIndex] : null;
  const imageUrl = currentImage 
    ? getAbsoluteImageUrl(currentImage.imagePath)
    : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600';

  return (
    <div className="min-h-screen bg-background" data-testid="listing-detail-page">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link href="/oda-ilanlari">
          <Button variant="ghost" className="mb-6" data-testid="back-button">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Aramaya Geri Dön
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Image gallery */}
            <div className="relative mb-6">
              <div className="relative h-96 rounded-lg overflow-hidden bg-muted">
                <img
                  src={imageUrl}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  data-testid="listing-main-image"
                />
                
                {!hasImages && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Upload className="h-12 w-12 mx-auto mb-2 opacity-70" />
                      <p className="text-sm font-medium">Henüz fotoğraf eklenmemiş</p>
                    </div>
                  </div>
                )}
                
                {hasImages && listing.images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-card/80 backdrop-blur-sm"
                      onClick={previousImage}
                      data-testid="previous-image-button"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-card/80 backdrop-blur-sm"
                      onClick={nextImage}
                      data-testid="next-image-button"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {listing.images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Image thumbnails */}
              {hasImages && listing.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-primary' : 'border-transparent'
                      }`}
                      data-testid={`thumbnail-${index}`}
                    >
                      <img
                        src={getAbsoluteImageUrl(image.imagePath)}
                        alt={`${listing.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Listing details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="listing-title">
                  {listing.title}
                </h1>
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span data-testid="listing-address">
                    {listing.address}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {listing.propertyType && (
                    <Badge variant="secondary" data-testid="property-type-badge">
                      <Home className="h-3 w-3 mr-1" />
                      {listing.propertyType}
                    </Badge>
                  )}
                  {listing.furnishingStatus && (
                    <Badge variant="outline" data-testid="furnishing-badge">
                      {listing.furnishingStatus}
                    </Badge>
                  )}
                  {listing.bathroomType && (
                    <Badge variant="outline" data-testid="bathroom-badge">
                      Banyo: {listing.bathroomType}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Property Details */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Oda Bilgileri</h2>
                <div className="grid grid-cols-2 gap-4">
                  {listing.totalRooms && (
                    <div className="flex items-center" data-testid="total-rooms">
                      <Home className="h-4 w-4 mr-2 text-secondary" />
                      <span>Toplam Oda Sayısı: {listing.totalRooms}</span>
                    </div>
                  )}
                  {listing.totalOccupants && (
                    <div className="flex items-center" data-testid="total-occupants">
                      <span>Evde Yaşayan: {listing.totalOccupants} kişi</span>
                    </div>
                  )}
                  {listing.roommatePreference && (
                    <div className="flex items-center" data-testid="roommate-preference">
                      <span>Tercih: {listing.roommatePreference}</span>
                    </div>
                  )}
                  {listing.smokingPolicy && (
                    <div className="flex items-center" data-testid="smoking-policy">
                      <span>Sigara: {listing.smokingPolicy}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Features & Amenities */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Özellikler ve Olanaklar</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {listing.internetIncluded && (
                    <div className="flex items-center" data-testid="internet-feature">
                      <Wifi className="h-4 w-4 mr-2 text-secondary" />
                      <span>İnternet Dahil</span>
                    </div>
                  )}
                  {listing.billsIncluded ? (
                    <div className="flex items-center" data-testid="bills-included-feature">
                      <Zap className="h-4 w-4 mr-2 text-secondary" />
                      <span>Faturalar Dahil</span>
                    </div>
                  ) : listing.excludedBills && listing.excludedBills.length > 0 && (
                    <div className="flex items-center" data-testid="bills-excluded-feature">
                      <Zap className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Dahil Değil: {listing.excludedBills.join(', ')}</span>
                    </div>
                  )}
                  {listing.amenities && listing.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center" data-testid={`amenity-${index}`}>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price and contact */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-foreground" data-testid="listing-price">
                    {formatCurrency(Number(listing.rentAmount))}
                    <span className="text-lg font-normal text-muted-foreground">/ay</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {user?.id === listing.userId ? (
                    <Button 
                      onClick={() => setLocation(`/ilan-duzenle/${id}`)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      data-testid="edit-listing-button"
                    >
                      Düzenle
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleContactOwner}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      data-testid="contact-owner-button"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {t('listings.contact_owner')}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={handleFavoriteToggle}
                    disabled={toggleFavoriteMutation.isPending}
                    className="w-full"
                    data-testid="favorite-button"
                  >
                    <Heart className={`h-4 w-4 mr-2 ${favoriteStatus?.isFavorite ? 'fill-destructive text-destructive' : ''}`} />
                    {favoriteStatus?.isFavorite ? t('listings.remove_from_favorites') : t('listings.add_to_favorites')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Owner info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-secondary" />
                  Mülk Sahibi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar data-testid="owner-avatar">
                    <AvatarImage src={listing.user.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {listing.user.firstName?.[0] || 'U'}
                      {listing.user.lastName?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium" data-testid="owner-name">
                      {listing.user.firstName} {listing.user.lastName}
                    </p>
                    {listing.user.verificationStatus === 'verified' && (
                      <div className="flex items-center gap-1 text-sm text-secondary">
                        <Shield className="h-3 w-3" />
                        <span>Doğrulanmış</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety info */}
            <Card className="border-secondary/20 bg-secondary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-secondary" />
                  <span className="font-medium text-secondary">{t('listings.safety_first')}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('listings.safety_message')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
