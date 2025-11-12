// ODANET Mobil Detay Revizyonu – Özellikler & Olanaklar (İkonlu Rozetler)
import {
  Wifi,
  Zap,
  Thermometer,
  Armchair,
  Tv,
  Wind,
  ParkingCircle,
  Bed,
  Shirt,
  Utensils,
  Building,
} from "lucide-react";

interface FeatureChipsProps {
  internetIncluded?: boolean;
  billsIncluded?: boolean;
  amenities?: string[];
}

interface FeatureChip {
  icon: React.ReactNode;
  label: string;
}

export default function FeatureChips({
  internetIncluded,
  billsIncluded,
  amenities = [],
}: FeatureChipsProps) {
  const chips: FeatureChip[] = [];

  // İnternet
  if (internetIncluded) {
    chips.push({
      icon: <Wifi className="h-3.5 w-3.5" aria-hidden="true" />,
      label: "İnternet Dahil",
    });
  }

  // Faturalar
  if (billsIncluded) {
    chips.push({
      icon: <Zap className="h-3.5 w-3.5" aria-hidden="true" />,
      label: "Faturalar Dahil",
    });
  }

  // Amenities eşleştirmesi
  amenities.forEach((amenity) => {
    const lowerAmenity = amenity.toLowerCase();

    if (lowerAmenity.includes("ısıt") || lowerAmenity.includes("isit") || lowerAmenity.includes("heating")) {
      chips.push({
        icon: <Thermometer className="h-3.5 w-3.5" aria-hidden="true" />,
        label: "Merkezi Isıtma",
      });
    } else if (lowerAmenity.includes("klima") || lowerAmenity.includes("ac") || lowerAmenity.includes("air")) {
      chips.push({
        icon: <Wind className="h-3.5 w-3.5" aria-hidden="true" />,
        label: "Klima",
      });
    } else if (lowerAmenity.includes("mobilya") || lowerAmenity.includes("eşya") || lowerAmenity.includes("furniture")) {
      chips.push({
        icon: <Armchair className="h-3.5 w-3.5" aria-hidden="true" />,
        label: "Mobilyalı",
      });
    } else if (lowerAmenity.includes("tv") || lowerAmenity.includes("televizyon")) {
      chips.push({
        icon: <Tv className="h-3.5 w-3.5" aria-hidden="true" />,
        label: "TV",
      });
    } else if (lowerAmenity.includes("otopark") || lowerAmenity.includes("park")) {
        chips.push({
          icon: <ParkingCircle className="h-3.5 w-3.5" aria-hidden="true" />,
          label: "Otopark",
        });
    } else if (lowerAmenity.includes("yatak") || lowerAmenity.includes("bed")) {
      chips.push({
        icon: <Bed className="h-3.5 w-3.5" aria-hidden="true" />,
        label: "Yatak",
      });
    } else if (lowerAmenity.includes("dolap") || lowerAmenity.includes("wardrobe") || lowerAmenity.includes("closet")) {
      chips.push({
        icon: <Shirt className="h-3.5 w-3.5" aria-hidden="true" />,
        label: "Dolap",
      });
    } else if (lowerAmenity.includes("mutfak") || lowerAmenity.includes("kitchen")) {
      chips.push({
        icon: <Utensils className="h-3.5 w-3.5" aria-hidden="true" />,
        label: "Mutfak",
      });
    } else if (lowerAmenity.includes("asansör") || lowerAmenity.includes("elevator")) {
      chips.push({
        icon: <Building className="h-3.5 w-3.5" aria-hidden="true" />,
        label: "Asansör",
      });
    } else if (!lowerAmenity.includes("diğer") && !lowerAmenity.includes("other")) {
      // Diğer spesifik olmayan özellikleri göster
      chips.push({
        icon: null,
        label: amenity,
      });
    }
  });

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl shadow-sm bg-white ring-1 ring-slate-100 p-4 md:p-5" data-testid="feature-chips">
      <h2 className="text-slate-900 font-semibold text-lg mb-4">
        Özellikler ve Olanaklar
      </h2>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs bg-slate-50 text-slate-700 ring-1 ring-slate-200"
          >
            {chip.icon}
            {chip.label}
          </span>
        ))}
      </div>
    </div>
  );
}
