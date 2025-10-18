// ODANET Mobil Detay Revizyonu – Başlık Bloğu
import { MapPin } from "lucide-react";

interface TitleBlockProps {
  title: string;
  address: string;
  badges?: string[];
}

export default function TitleBlock({ title, address, badges = [] }: TitleBlockProps) {
  return (
    <div className="space-y-3" data-testid="title-block">
      {/* Başlık */}
      <h1 className="font-semibold tracking-tight text-2xl text-slate-900">
        {title}
      </h1>

      {/* Adres */}
      <div className="flex items-center gap-2 text-slate-600">
        <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span className="text-sm">{address}</span>
      </div>

      {/* Kategori Rozetleri */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-violet-50 text-violet-700 ring-1 ring-violet-100"
            >
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
