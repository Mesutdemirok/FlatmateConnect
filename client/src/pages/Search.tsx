import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchFilters, { SearchFilters as FilterType } from "@/components/SearchFilters";
import ListingCard from "@/components/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search as SearchIcon } from "lucide-react";

export default function Search() {
  const [location] = useLocation();
  const [filters, setFilters] = useState<FilterType>({});

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilters: FilterType = {};

    if (urlParams.get('location')) initialFilters.location = urlParams.get('location')!;
    if (urlParams.get('minPrice')) initialFilters.minPrice = Number(urlParams.get('minPrice'));
    if (urlParams.get('maxPrice')) initialFilters.maxPrice = Number(urlParams.get('maxPrice'));
    if (urlParams.get('availableFrom')) initialFilters.availableFrom = urlParams.get('availableFrom')!;
    if (urlParams.get('roomType')) initialFilters.roomType = urlParams.get('roomType')!;
    if (urlParams.get('propertyType')) initialFilters.propertyType = urlParams.get('propertyType')!;
    if (urlParams.get('furnished')) initialFilters.furnished = urlParams.get('furnished') === 'true';
    if (urlParams.get('billsIncluded')) initialFilters.billsIncluded = urlParams.get('billsIncluded') === 'true';
    if (urlParams.get('parkingAvailable')) initialFilters.parkingAvailable = urlParams.get('parkingAvailable') === 'true';
    if (urlParams.get('internetIncluded')) initialFilters.internetIncluded = urlParams.get('internetIncluded') === 'true';

    setFilters(initialFilters);
  }, [location]);

  const buildQueryParams = (filters: FilterType) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.set(key, value.toString());
      }
    });
    return params.toString();
  };

  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['/api/listings', buildQueryParams(filters)],
    queryFn: async () => {
      const response = await fetch(`/api/listings?${buildQueryParams(filters)}`);
      if (!response.ok) throw new Error('Failed to fetch listings');
      return response.json();
    }
  });

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    // Update URL without triggering a page reload
    const params = buildQueryParams(newFilters);
    const newUrl = params ? `/search?${params}` : '/search';
    window.history.pushState({}, '', newUrl);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="search-page">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <SearchFilters 
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </div>

          {/* Results */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="mb-6" data-testid="search-results-header">
              <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                <SearchIcon className="h-6 w-6" />
                Search Results
              </h1>
              {!isLoading && listings && (
                <p className="text-muted-foreground" data-testid="results-count">
                  {listings.length} {listings.length === 1 ? 'listing' : 'listings'} found
                </p>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="search-loading">
                {[...Array(6)].map((_, i) => (
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
            )}

            {/* Error State */}
            {error && (
              <Alert className="mb-6" data-testid="search-error">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load listings. Please try again later.
                </AlertDescription>
              </Alert>
            )}

            {/* No Results */}
            {!isLoading && !error && listings && listings.length === 0 && (
              <div className="text-center py-12" data-testid="no-results">
                <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No listings found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search filters or check back later for new listings.
                </p>
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && !error && listings && listings.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="search-results-grid">
                {listings.map((listing: any) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    showDistance={true}
                    distance="2.5 km"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
