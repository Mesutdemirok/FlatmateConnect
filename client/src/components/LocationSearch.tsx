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
    <div className="w-full bg-gradient-to-b from-white to-slate-50 border-y border-slate-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Oda veya Ev Arkadaşı Ara
          </h2>
          <p className="text-sm text-slate-600">
            Aramak istediğiniz konumu seçin
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
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
              className="sm:w-auto w-full bg-primary hover:bg-primary/90 text-white"
              data-testid="search-button"
            >
              <Search className="h-5 w-5 mr-2" />
              Ara
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
