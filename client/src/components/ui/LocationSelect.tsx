import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface LocationValue {
  city?: string;
  citySlug?: string;
  district?: string;
  districtSlug?: string;
  neighborhood?: string;
  neighborhoodSlug?: string;
}

interface LocationData {
  city: string;
  slug: string;
  districts: {
    district: string;
    slug: string;
    neighborhoods: {
      name: string;
      slug: string;
    }[];
  }[];
}

interface LocationSelectProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  requiredLevels?: ('city' | 'district' | 'neighborhood')[];
  className?: string;
  layout?: 'row' | 'column';
}

export default function LocationSelect({
  value,
  onChange,
  requiredLevels = ['city', 'district'],
  className = '',
  layout = 'column'
}: LocationSelectProps) {
  const [selectedCity, setSelectedCity] = useState<LocationData | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<LocationData['districts'][0] | null>(null);

  const { data: locations, isLoading } = useQuery<LocationData[]>({
    queryKey: ['/api/locations'],
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Update internal state when value changes
  useEffect(() => {
    if (locations && value.citySlug) {
      const city = locations.find(c => c.slug === value.citySlug);
      setSelectedCity(city || null);
      
      if (city && value.districtSlug) {
        const district = city.districts.find(d => d.slug === value.districtSlug);
        setSelectedDistrict(district || null);
      }
    }
  }, [locations, value.citySlug, value.districtSlug]);

  const handleCityChange = (citySlug: string) => {
    const city = locations?.find(c => c.slug === citySlug);
    setSelectedCity(city || null);
    setSelectedDistrict(null);
    
    onChange({
      city: city?.city,
      citySlug: city?.slug,
      district: undefined,
      districtSlug: undefined,
      neighborhood: undefined,
      neighborhoodSlug: undefined,
    });
  };

  const handleDistrictChange = (districtSlug: string) => {
    const district = selectedCity?.districts.find(d => d.slug === districtSlug);
    setSelectedDistrict(district || null);
    
    onChange({
      ...value,
      district: district?.district,
      districtSlug: district?.slug,
      neighborhood: undefined,
      neighborhoodSlug: undefined,
    });
  };

  const handleNeighborhoodChange = (neighborhoodSlug: string) => {
    const neighborhood = selectedDistrict?.neighborhoods.find(n => n.slug === neighborhoodSlug);
    
    onChange({
      ...value,
      neighborhood: neighborhood?.name,
      neighborhoodSlug: neighborhood?.slug,
    });
  };

  const containerClass = layout === 'row' 
    ? 'flex flex-col sm:flex-row gap-3'
    : 'space-y-3';

  if (isLoading) {
    return <div className={className}>Lokasyonlar yükleniyor...</div>;
  }

  return (
    <div className={`${containerClass} ${className}`}>
      {/* City Select */}
      <div className="flex-1">
        <Select value={value.citySlug || ''} onValueChange={handleCityChange}>
          <SelectTrigger data-testid="select-city" className="w-full">
            <SelectValue placeholder="İl seçin" />
          </SelectTrigger>
          <SelectContent>
            {locations?.map((city) => (
              <SelectItem key={city.slug} value={city.slug}>
                {city.city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* District Select */}
      {selectedCity && (
        <div className="flex-1">
          <Select 
            value={value.districtSlug || ''} 
            onValueChange={handleDistrictChange}
            disabled={!selectedCity}
          >
            <SelectTrigger data-testid="select-district" className="w-full">
              <SelectValue placeholder="İlçe seçin" />
            </SelectTrigger>
            <SelectContent>
              {selectedCity.districts.map((district) => (
                <SelectItem key={district.slug} value={district.slug}>
                  {district.district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Neighborhood Select (Optional) */}
      {selectedDistrict && selectedDistrict.neighborhoods.length > 0 && (
        <div className="flex-1">
          <Select 
            value={value.neighborhoodSlug || ''} 
            onValueChange={handleNeighborhoodChange}
            disabled={!selectedDistrict}
          >
            <SelectTrigger data-testid="select-neighborhood" className="w-full">
              <SelectValue placeholder="Mahalle (isteğe bağlı)" />
            </SelectTrigger>
            <SelectContent>
              {selectedDistrict.neighborhoods.map((neighborhood) => (
                <SelectItem key={neighborhood.slug} value={neighborhood.slug}>
                  {neighborhood.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
