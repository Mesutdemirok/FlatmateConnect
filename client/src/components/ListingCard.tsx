import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    suburb: string;
    rentAmount: string;
    availableFrom: string | null;
    images: Array<{
      imagePath: string;
      isPrimary: boolean;
    }>;
    user: {
      firstName: string | null;
      verificationStatus: string;
    };
  };
  isFavorited?: boolean;
  showDistance?: boolean;
  distance?: string;
}

export default function ListingCard({ 
  listing, 
  isFavorited = false, 
  showDistance = false, 
  distance 
}: ListingCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [favorite, setFavorite] = useState(isFavorited);

  const primaryImage = listing.images.find(img => img.isPrimary) || listing.images[0];
  const imageUrl = primaryImage 
    ? primaryImage.imagePath.startsWith('/uploads') 
      ? primaryImage.imagePath 
      : primaryImage.imagePath
    : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250';

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (favorite) {
        await apiRequest('DELETE', `/api/favorites/${listing.id}`);
      } else {
        await apiRequest('POST', '/api/favorites', { listingId: listing.id });
      }
    },
    onSuccess: () => {
      setFavorite(!favorite);
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: favorite ? "Removed from favorites" : "Added to favorites",
        description: favorite ? "Listing removed from your favorites" : "Listing added to your favorites"
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

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    
    toggleFavoriteMutation.mutate();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Available Now";
    const date = new Date(dateString);
    return date > new Date() ? date.toLocaleDateString() : "Available Now";
  };

  const formatPrice = (amount: string) => {
    return `$${Math.round(Number(amount))}`;
  };

  return (
    <Link href={`/listing/${listing.id}`}>
      <div className="bg-card rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer" data-testid={`listing-card-${listing.id}`}>
        <div className="relative">
          <img 
            src={imageUrl}
            alt={listing.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            data-testid={`listing-image-${listing.id}`}
          />
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full hover:bg-card transition-colors"
            onClick={handleToggleFavorite}
            disabled={toggleFavoriteMutation.isPending}
            data-testid={`favorite-button-${listing.id}`}
          >
            <Heart 
              className={`h-4 w-4 ${favorite ? 'fill-destructive text-destructive' : 'text-muted-foreground hover:text-destructive'}`} 
            />
          </Button>
          
          <div className="absolute bottom-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-medium" data-testid={`availability-${listing.id}`}>
            {formatDate(listing.availableFrom)}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-foreground line-clamp-1" data-testid={`listing-title-${listing.id}`}>
              {listing.title}
            </h3>
            <div className="flex items-center ml-2">
              <Star className="h-4 w-4 text-accent mr-1" />
              <span className="text-sm text-muted-foreground">4.8</span>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm mb-3" data-testid={`listing-location-${listing.id}`}>
            {listing.suburb} {showDistance && distance && `• ${distance} from CBD`}
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-foreground" data-testid={`listing-price-${listing.id}`}>
                {formatPrice(listing.rentAmount)}
              </span>
              <span className="text-muted-foreground text-sm">/week</span>
            </div>
            
            {listing.user.verificationStatus === 'verified' && (
              <div className="flex items-center space-x-1" data-testid={`verification-badge-${listing.id}`}>
                <div className="w-6 h-6 rounded-full bg-secondary"></div>
                <span className="text-xs text-muted-foreground">Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
