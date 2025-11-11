import { useState, useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
  height?: string;
  address?: string;
}

interface GeocoderComponentProps {
  location: { lat: number; lng: number };
  onAddressUpdate: (address: string) => void;
}

function GeocoderComponent({ location, onAddressUpdate }: GeocoderComponentProps) {
  const geocodingLib = useMapsLibrary('geocoding');

  const geocoder = useMemo(
    () => geocodingLib && new geocodingLib.Geocoder(),
    [geocodingLib]
  );

  useEffect(() => {
    if (!geocoder) return;

    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        onAddressUpdate(results[0].formatted_address);
      }
    });
  }, [geocoder, location.lat, location.lng]);

  return null;
}

export default function LocationPicker({
  onLocationSelect,
  initialLat = 39.9334,
  initialLng = 32.8597,
  height = '400px',
  address: initialAddress,
}: LocationPickerProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [address, setAddress] = useState<string>(initialAddress || '');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <p className="text-sm text-yellow-800">
          Google Maps API anahtarı bulunamadı. Lütfen VITE_GOOGLE_MAPS_API_KEY ortam değişkenini ayarlayın.
        </p>
      </Card>
    );
  }

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    setHasUserInteracted(true);
    setPosition({ lat, lng });
    setIsGeocoding(true);
  };

  const handleAddressUpdate = (newAddress: string) => {
    setAddress(newAddress);
    setIsGeocoding(false);
    
    // Only call onLocationSelect if user has actually interacted with the map
    if (hasUserInteracted && onLocationSelect) {
      onLocationSelect(position.lat, position.lng, newAddress);
    }
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    setHasUserInteracted(true);
    setPosition({ lat, lng });
    setIsGeocoding(true);
  };

  return (
    <div className="space-y-3" data-testid="location-picker">
      <APIProvider apiKey={apiKey}>
        <div style={{ height }} className="w-full rounded-lg overflow-hidden border">
          <Map
            defaultCenter={position}
            center={position}
            defaultZoom={13}
            mapId="odanet-location-picker"
            onClick={handleMapClick}
            gestureHandling="greedy"
            disableDefaultUI={false}
            zoomControl={true}
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl={false}
          >
            <AdvancedMarker
              position={position}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
            />
          </Map>
        </div>
        
        <GeocoderComponent location={position} onAddressUpdate={handleAddressUpdate} />
      </APIProvider>

      <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg text-sm">
        {isGeocoding ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mt-0.5 flex-shrink-0" />
            <span className="text-slate-600">Adres bulunuyor...</span>
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-slate-700">Seçili Konum</p>
              <p className="text-slate-600 mt-1">{address || 'Haritadan bir konum seçin'}</p>
              <p className="text-xs text-slate-500 mt-1">
                Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
