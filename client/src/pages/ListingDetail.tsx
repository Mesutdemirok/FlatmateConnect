import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
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
  Star
} from "lucide-react";

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: listing, isLoading, error } = useQuery({
    queryKey: [`/api/listings/${id}`],
    enabled: !!id,
  });

  const { data: favoriteStatus } = useQuery({
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
        title: favoriteStatus?.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: favoriteStatus?.isFavorite ? "Listing removed from your favorites" : "Listing added to your favorites"
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive"
      });
    }
  });

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  const handleContactOwner = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    setLocation(`/messages?user=${listing.user.id}&listing=${listing.id}`);
  };

  const nextImage = () => {
    if (listing?.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const previousImage = () => {
    if (listing?.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  const formatPrice = (amount: string) => {
    return `$${Math.round(Number(amount))}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Available Now";
    const date = new Date(dateString);
    return date > new Date() ? date.toLocaleDateString() : "Available Now";
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
              <h1 className="text-2xl font-bold text-foreground mb-2">Listing Not Found</h1>
              <p className="text-muted-foreground mb-4">
                The listing you're looking for doesn't exist or may have been removed.
              </p>
              <Link href="/search">
                <Button>Browse Other Listings</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const currentImage = listing.images[currentImageIndex];
  const imageUrl = currentImage 
    ? currentImage.imagePath.startsWith('/uploads') 
      ? currentImage.imagePath 
      : currentImage.imagePath
    : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600';

  return (
    <div className="min-h-screen bg-background" data-testid="listing-detail-page">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link href="/search">
          <Button variant="ghost" className="mb-6" data-testid="back-button">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Search
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
                
                {listing.images.length > 1 && (
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
              {listing.images.length > 1 && (
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
                        src={image.imagePath}
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
                    {listing.address || `${listing.suburb}, ${listing.city} ${listing.postcode}`}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" data-testid="availability-badge">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(listing.availableFrom)}
                  </Badge>
                  {listing.roomType && (
                    <Badge variant="outline" data-testid="room-type-badge">
                      <Home className="h-3 w-3 mr-1" />
                      {listing.roomType}
                    </Badge>
                  )}
                  {listing.furnished && (
                    <Badge variant="outline" data-testid="furnished-badge">
                      Furnished
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Description */}
              {listing.description && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-foreground leading-relaxed" data-testid="listing-description">
                    {listing.description}
                  </p>
                </div>
              )}

              <Separator />

              {/* Features */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Features & Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {listing.billsIncluded && (
                    <div className="flex items-center" data-testid="bills-included-feature">
                      <Zap className="h-4 w-4 mr-2 text-secondary" />
                      <span>Bills Included</span>
                    </div>
                  )}
                  {listing.internetIncluded && (
                    <div className="flex items-center" data-testid="internet-feature">
                      <Wifi className="h-4 w-4 mr-2 text-secondary" />
                      <span>Internet Included</span>
                    </div>
                  )}
                  {listing.parkingAvailable && (
                    <div className="flex items-center" data-testid="parking-feature">
                      <Car className="h-4 w-4 mr-2 text-secondary" />
                      <span>Parking Available</span>
                    </div>
                  )}
                  {listing.propertyType && (
                    <div className="flex items-center" data-testid="property-type-feature">
                      <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{listing.propertyType}</span>
                    </div>
                  )}
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
                    {formatPrice(listing.rentAmount)}
                    <span className="text-lg font-normal text-muted-foreground">/week</span>
                  </div>
                  {listing.bondAmount && (
                    <p className="text-sm text-muted-foreground mt-1" data-testid="bond-amount">
                      ${Math.round(Number(listing.bondAmount))} bond
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleContactOwner}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    data-testid="contact-owner-button"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Owner
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleFavoriteToggle}
                    disabled={toggleFavoriteMutation.isPending}
                    className="w-full"
                    data-testid="favorite-button"
                  >
                    <Heart className={`h-4 w-4 mr-2 ${favoriteStatus?.isFavorite ? 'fill-destructive text-destructive' : ''}`} />
                    {favoriteStatus?.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Owner info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-secondary" />
                  Property Owner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
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
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-accent" />
                  <span>4.8 rating • 12 reviews</span>
                </div>
              </CardContent>
            </Card>

            {/* Safety info */}
            <Card className="border-secondary/20 bg-secondary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-secondary" />
                  <span className="font-medium text-secondary">Safety First</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Always meet in person before making any payments. Never send money without viewing the property.
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
