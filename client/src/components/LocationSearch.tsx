import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import LocationSelect, { LocationValue } from "@/components/ui/LocationSelect";
import { Search } from "lucide-react";

export default function LocationSearch() {
  const [, navigate] = useLocation();
  const [location, setLocation] = useState<LocationValue>({});

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (location.citySlug) {
      params.set('il', location.citySlug);
    }
    if (location.districtSlug) {
      params.set('ilce', location.districtSlug);
    }
    if (location.neighborhoodSlug) {
      params.set('mahalle', location.neighborhoodSlug);
    }

    navigate(`/arama?${params.toString()}`);
  };

  const canSearch = location.citySlug && location.districtSlug;

  return (
    <div className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Oda veya Ev Arkadaşı Ara
        </h2>
        <p className="text-sm text-white/80">
          Aramak istediğiniz konumu seçin
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <LocationSelect
            value={location}
            onChange={setLocation}
            layout="row"
            className="w-full"
          />
        </div>
        
        <Button
          onClick={handleSearch}
          disabled={!canSearch}
          size="lg"
          className="sm:w-auto w-full bg-white text-indigo-600 hover:bg-white/90 font-semibold shadow-lg"
          data-testid="search-button"
        >
          <Search className="h-5 w-5 mr-2" />
          Ara
        </Button>
      </div>
    </div>
  );
}
