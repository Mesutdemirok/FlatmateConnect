import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import { useLocation } from "wouter";

export default function Hero() {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState({
    location: '',
    priceRange: '',
    availableFrom: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchParams.location) params.set('location', searchParams.location);
    if (searchParams.priceRange) params.set('priceRange', searchParams.priceRange);
    if (searchParams.availableFrom) params.set('availableFrom', searchParams.availableFrom);
    
    setLocation(`/search?${params.toString()}`);
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className="relative bg-gradient-to-br from-primary to-secondary py-16 lg:py-24" data-testid="hero-section">
      {/* Hero pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6" data-testid="hero-title">
          Find Your Perfect
          <span className="block">Flatmate & Room</span>
        </h1>
        <p className="text-lg lg:text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto" data-testid="hero-subtitle">
          Connect with verified people seeking shared accommodation. Safe, secure, and simple.
        </p>
        
        {/* Main search form */}
        <div className="bg-card rounded-2xl shadow-2xl p-6 lg:p-8 max-w-4xl mx-auto" data-testid="search-form">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="lg:col-span-2">
              <Label htmlFor="location" className="block text-sm font-medium text-muted-foreground mb-2">
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  type="text"
                  placeholder="Suburb, city or postcode"
                  className="pl-10"
                  value={searchParams.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  data-testid="input-location"
                />
              </div>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-muted-foreground mb-2">
                Price Range
              </Label>
              <Select value={searchParams.priceRange} onValueChange={(value) => handleInputChange('priceRange', value)}>
                <SelectTrigger data-testid="select-price-range">
                  <SelectValue placeholder="Any Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="100-200">$100 - $200</SelectItem>
                  <SelectItem value="200-300">$200 - $300</SelectItem>
                  <SelectItem value="300-500">$300 - $500</SelectItem>
                  <SelectItem value="500+">$500+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="availableFrom" className="block text-sm font-medium text-muted-foreground mb-2">
                Available From
              </Label>
              <Input
                id="availableFrom"
                type="date"
                value={searchParams.availableFrom}
                onChange={(e) => handleInputChange('availableFrom', e.target.value)}
                data-testid="input-available-from"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 gap-4">
            <Button 
              variant="ghost" 
              className="text-primary hover:text-primary/80 font-medium"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              data-testid="button-advanced-filters"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
            <Button 
              className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
              onClick={handleSearch}
              data-testid="button-search"
            >
              <Search className="h-4 w-4 mr-2" />
              Search Rooms
            </Button>
          </div>

          {/* Advanced filters (collapsed by default) */}
          {showAdvancedFilters && (
            <div className="mt-6 pt-6 border-t border-border" data-testid="advanced-filters">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="block text-sm font-medium text-muted-foreground mb-2">
                    Room Type
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Room Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Room Type</SelectItem>
                      <SelectItem value="private">Private Room</SelectItem>
                      <SelectItem value="shared">Shared Room</SelectItem>
                      <SelectItem value="ensuite">Ensuite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-muted-foreground mb-2">
                    Property Type
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Property</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-muted-foreground mb-2">
                    Features
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Features" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Features</SelectItem>
                      <SelectItem value="furnished">Furnished</SelectItem>
                      <SelectItem value="bills-included">Bills Included</SelectItem>
                      <SelectItem value="parking">Parking Available</SelectItem>
                      <SelectItem value="internet">Internet Included</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
