import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, DollarSign, Calendar, Home, Wifi, Car, Bath } from "lucide-react";

interface SearchFiltersProps {
  onFilterChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export interface SearchFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  availableFrom?: string;
  roomType?: string;
  propertyType?: string;
  furnished?: boolean;
  billsIncluded?: boolean;
  parkingAvailable?: boolean;
  internetIncluded?: boolean;
}

export default function SearchFilters({ onFilterChange, initialFilters = {} }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: SearchFilters = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <Card className="sticky top-20" data-testid="search-filters">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Filters</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            data-testid="clear-filters-button"
          >
            Clear All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="filter-location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </Label>
          <Input
            id="filter-location"
            placeholder="Suburb, city or postcode"
            value={filters.location || ''}
            onChange={(e) => updateFilter('location', e.target.value)}
            data-testid="filter-location-input"
          />
        </div>

        <Separator />

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Price Range (per week)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                data-testid="filter-min-price"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                data-testid="filter-max-price"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Available From */}
        <div className="space-y-2">
          <Label htmlFor="filter-available-from" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Available From
          </Label>
          <Input
            id="filter-available-from"
            type="date"
            value={filters.availableFrom || ''}
            onChange={(e) => updateFilter('availableFrom', e.target.value)}
            data-testid="filter-available-from"
          />
        </div>

        <Separator />

        {/* Room Type */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Room Type
          </Label>
          <Select 
            value={filters.roomType || ''} 
            onValueChange={(value) => updateFilter('roomType', value || undefined)}
          >
            <SelectTrigger data-testid="filter-room-type">
              <SelectValue placeholder="Any room type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any room type</SelectItem>
              <SelectItem value="private">Private Room</SelectItem>
              <SelectItem value="shared">Shared Room</SelectItem>
              <SelectItem value="ensuite">Ensuite</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <Label>Property Type</Label>
          <Select 
            value={filters.propertyType || ''} 
            onValueChange={(value) => updateFilter('propertyType', value || undefined)}
          >
            <SelectTrigger data-testid="filter-property-type">
              <SelectValue placeholder="Any property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any property type</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="unit">Unit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Features */}
        <div className="space-y-3">
          <Label>Features</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="furnished"
              checked={filters.furnished || false}
              onCheckedChange={(checked) => updateFilter('furnished', checked)}
              data-testid="filter-furnished"
            />
            <Label htmlFor="furnished" className="text-sm font-normal">
              Furnished
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="bills-included"
              checked={filters.billsIncluded || false}
              onCheckedChange={(checked) => updateFilter('billsIncluded', checked)}
              data-testid="filter-bills-included"
            />
            <Label htmlFor="bills-included" className="text-sm font-normal flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Bills Included
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="parking"
              checked={filters.parkingAvailable || false}
              onCheckedChange={(checked) => updateFilter('parkingAvailable', checked)}
              data-testid="filter-parking"
            />
            <Label htmlFor="parking" className="text-sm font-normal flex items-center gap-1">
              <Car className="h-3 w-3" />
              Parking Available
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="internet"
              checked={filters.internetIncluded || false}
              onCheckedChange={(checked) => updateFilter('internetIncluded', checked)}
              data-testid="filter-internet"
            />
            <Label htmlFor="internet" className="text-sm font-normal flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Internet Included
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
