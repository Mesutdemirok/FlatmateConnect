import { useQuery } from "@tanstack/react-query";
import ListingCard from "./ListingCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedListings() {
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
            <h3 className="text-lg font-semibold text-destructive mb-2">Unable to Load Listings</h3>
            <p className="text-muted-foreground mb-4">
              We're having trouble loading the featured listings right now. Please try again later.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              data-testid="retry-button"
            >
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const featuredListings = listings?.slice(0, 4) || [];

  if (featuredListings.length === 0) {
    return (
      <section className="py-16 bg-muted/30" data-testid="featured-listings-empty">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-card border border-border rounded-lg p-8">
            <h3 className="text-lg font-semibold text-foreground mb-2">No Listings Available</h3>
            <p className="text-muted-foreground mb-4">
              There are currently no room listings available. Check back soon for new listings!
            </p>
            <Link href="/create-listing">
              <Button data-testid="create-listing-button">
                List Your Room
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
              Featured Rooms
            </h2>
            <p className="text-muted-foreground" data-testid="featured-subtitle">
              Popular listings in your area
            </p>
          </div>
          <Link href="/search" data-testid="view-all-link">
            <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium">
              View All <ArrowRight className="ml-1 h-4 w-4" />
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
