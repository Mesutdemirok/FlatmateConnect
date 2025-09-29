import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

export default function Hero() {
  const { t } = useTranslation();
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
          {t('hero.title')}
        </h1>
        <p className="text-lg lg:text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto" data-testid="hero-subtitle">
          {t('hero.subtitle')}
        </p>
        
        {/* Main search form */}
        <div className="bg-card rounded-2xl shadow-2xl p-6 lg:p-8 max-w-4xl mx-auto" data-testid="search-form">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="lg:col-span-2">
              <Label htmlFor="location" className="block text-sm font-medium text-muted-foreground mb-2">
                {t('filters.location')}
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  type="text"
                  placeholder={t('hero.search_placeholder')}
                  className="pl-10"
                  value={searchParams.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  data-testid="input-location"
                />
              </div>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-muted-foreground mb-2">
                {t('hero.filters.price')}
              </Label>
              <Select value={searchParams.priceRange} onValueChange={(value) => handleInputChange('priceRange', value)}>
                <SelectTrigger data-testid="select-price-range">
                  <SelectValue placeholder={t('hero.price_ranges.any')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('hero.price_ranges.any')}</SelectItem>
                  <SelectItem value="100-200">{t('hero.price_ranges.100-200')}</SelectItem>
                  <SelectItem value="200-300">{t('hero.price_ranges.200-300')}</SelectItem>
                  <SelectItem value="300-500">{t('hero.price_ranges.300-500')}</SelectItem>
                  <SelectItem value="500+">{t('hero.price_ranges.500+')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="availableFrom" className="block text-sm font-medium text-muted-foreground mb-2">
                {t('create_listing.available_from')}
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
              {t('filters.title')}
            </Button>
            <Button 
              className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
              onClick={handleSearch}
              data-testid="button-search"
            >
              <Search className="h-4 w-4 mr-2" />
              {t('hero.search_button')}
            </Button>
          </div>

          {/* Advanced filters (collapsed by default) */}
          {showAdvancedFilters && (
            <div className="mt-6 pt-6 border-t border-border" data-testid="advanced-filters">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="block text-sm font-medium text-muted-foreground mb-2">
                    {t('hero.filters.room_type')}
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t('hero.room_types.any')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('hero.room_types.any')}</SelectItem>
                      <SelectItem value="private">{t('hero.room_types.private')}</SelectItem>
                      <SelectItem value="shared">{t('hero.room_types.shared')}</SelectItem>
                      <SelectItem value="ensuite">{t('hero.room_types.ensuite')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-muted-foreground mb-2">
                    {t('hero.filters.property_type')}
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t('hero.property_types.any')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('hero.property_types.any')}</SelectItem>
                      <SelectItem value="house">{t('hero.property_types.house')}</SelectItem>
                      <SelectItem value="apartment">{t('hero.property_types.apartment')}</SelectItem>
                      <SelectItem value="townhouse">{t('hero.property_types.townhouse')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-muted-foreground mb-2">
                    {t('hero.filters.features')}
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t('hero.feature_options.any')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('hero.feature_options.any')}</SelectItem>
                      <SelectItem value="furnished">{t('hero.feature_options.furnished')}</SelectItem>
                      <SelectItem value="bills-included">{t('hero.feature_options.bills_included')}</SelectItem>
                      <SelectItem value="parking">{t('hero.feature_options.parking')}</SelectItem>
                      <SelectItem value="internet">{t('hero.feature_options.internet')}</SelectItem>
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
