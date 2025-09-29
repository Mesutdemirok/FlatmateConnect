import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          <span>{t('filters.title')}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            data-testid="clear-filters-button"
          >
            {t('filters.clear')}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="filter-location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {t('filters.location')}
          </Label>
          <Input
            id="filter-location"
            placeholder={t('hero.search_placeholder')}
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
            {t('filters.price_range')}
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder={t('filters.min')}
                value={filters.minPrice || ''}
                onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                data-testid="filter-min-price"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder={t('filters.max')}
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
            {t('filters.availability')}
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
            {t('filters.room_type')}
          </Label>
          <Select 
            value={filters.roomType || ''} 
            onValueChange={(value) => updateFilter('roomType', value === 'all' ? undefined : value)}
          >
            <SelectTrigger data-testid="filter-room-type">
              <SelectValue placeholder={t('hero.room_types.any')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('hero.room_types.any')}</SelectItem>
              <SelectItem value="private">{t('hero.room_types.private')}</SelectItem>
              <SelectItem value="shared">{t('hero.room_types.shared')}</SelectItem>
              <SelectItem value="ensuite">{t('hero.room_types.ensuite')}</SelectItem>
              <SelectItem value="studio">{t('hero.room_types.studio')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <Label>{t('filters.property_type')}</Label>
          <Select 
            value={filters.propertyType || ''} 
            onValueChange={(value) => updateFilter('propertyType', value === 'all' ? undefined : value)}
          >
            <SelectTrigger data-testid="filter-property-type">
              <SelectValue placeholder={t('hero.property_types.any')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('hero.property_types.any')}</SelectItem>
              <SelectItem value="house">{t('hero.property_types.house')}</SelectItem>
              <SelectItem value="apartment">{t('hero.property_types.apartment')}</SelectItem>
              <SelectItem value="townhouse">{t('hero.property_types.townhouse')}</SelectItem>
              <SelectItem value="unit">{t('hero.property_types.unit')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Features */}
        <div className="space-y-3">
          <Label>{t('filters.features')}</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="furnished"
              checked={filters.furnished || false}
              onCheckedChange={(checked) => updateFilter('furnished', checked)}
              data-testid="filter-furnished"
            />
            <Label htmlFor="furnished" className="text-sm font-normal">
              {t('hero.feature_options.furnished')}
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
              {t('hero.feature_options.bills_included')}
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
              {t('hero.feature_options.parking')}
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
              {t('hero.feature_options.internet')}
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
