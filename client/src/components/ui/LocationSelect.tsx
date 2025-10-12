import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

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
      {/* City Select - Using Native Select for Testing */}
      <div className="flex-1">
        <select 
          data-testid="select-city" 
          className="w-full h-10 px-3 py-2 bg-white border border-input rounded-md text-sm"
          value={value.citySlug || ""}
          onChange={(e) => handleCityChange(e.target.value)}
        >
          <option value="">İl seçin</option>
          {locations && locations.length > 0 && locations.map((city) => (
            <option key={city.slug} value={city.slug}>
              {city.city}
            </option>
          ))}
        </select>
      </div>

      {/* District Select */}
      <div className="flex-1">
        <select
          data-testid="select-district"
          className="w-full h-10 px-3 py-2 bg-white border border-input rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          value={value.districtSlug || ""}
          onChange={(e) => handleDistrictChange(e.target.value)}
          disabled={!selectedCity}
        >
          <option value="">İlçe seçin</option>
          {selectedCity?.districts.map((district) => (
            <option key={district.slug} value={district.slug}>
              {district.district}
            </option>
          ))}
        </select>
      </div>

      {/* Neighborhood Select (Optional) */}
      {requiredLevels.includes('neighborhood') && selectedDistrict && selectedDistrict.neighborhoods.length > 0 && (
        <div className="flex-1">
          <select
            data-testid="select-neighborhood"
            className="w-full h-10 px-3 py-2 bg-white border border-input rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            value={value.neighborhoodSlug || ""}
            onChange={(e) => handleNeighborhoodChange(e.target.value)}
            disabled={!selectedDistrict}
          >
            <option value="">Mahalle (isteğe bağlı)</option>
            {selectedDistrict.neighborhoods.map((neighborhood) => (
              <option key={neighborhood.slug} value={neighborhood.slug}>
                {neighborhood.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
