import { useQuery } from "@tanstack/react-query";
import ListingCard from "./ListingCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export default function FeaturedListings() {
  const { t } = useTranslation();
  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['/api/listings'],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30" data-testid="featured-listings-loading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-3" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-muted/30" data-testid="featured-listings-error">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-card border border-destructive rounded-lg p-8">
            <h3 className="text-lg font-semibold text-destructive mb-2">{t('listings.unable_to_load')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('listings.trouble_loading')}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              data-testid="retry-button"
            >
              {t('listings.try_again')}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const featuredListings = Array.isArray(listings) ? listings.slice(0, 4) : [];

  if (featuredListings.length === 0) {
    return (
      <section className="py-16 bg-muted/30" data-testid="featured-listings-empty">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-card border border-border rounded-lg p-8">
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('listings.no_listings_available')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('listings.no_listings_message')}
            </p>
            <Link href="/create-listing">
              <Button data-testid="create-listing-button">
                {t('listings.list_your_room')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30" data-testid="featured-listings-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="featured-title">
              {t('listings.featured_rooms')}
            </h2>
            <p className="text-muted-foreground" data-testid="featured-subtitle">
              {t('listings.popular_listings')}
            </p>
          </div>
          <Link href="/search" data-testid="view-all-link">
            <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium">
              {t('listings.view_all')} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredListings.map((listing) => (
            <ListingCard 
              key={listing.id} 
              listing={listing}
              showDistance={true}
              distance="2 km"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
