// ODANET Mobil Detay Revizyonu – Mülk Sahibi Kartı
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Shield, MessageCircle } from "lucide-react";

interface OwnerCardProps {
  ownerName?: string;
  ownerPhoto?: string;
  ownerInitials?: string;
  onContactClick?: () => void;
  showContactButton?: boolean;
}

export default function OwnerCard({
  ownerName = "Anonim Kullanıcı",
  ownerPhoto,
  ownerInitials,
  onContactClick,
  showContactButton = true,
}: OwnerCardProps) {
  // İsmi baş harf büyük formatla
  const formatName = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const displayName = formatName(ownerName);
  const initials = ownerInitials || displayName.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div
      className="rounded-2xl bg-white ring-1 ring-slate-100 p-4 space-y-3"
      data-testid="owner-card"
    >
      <h2 className="text-slate-900 font-semibold text-lg">Mülk Sahibi</h2>

      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={ownerPhoto} alt={displayName} />
          <AvatarFallback className="bg-violet-100 text-violet-700 font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium text-slate-900">{displayName}</p>
          <p className="text-xs text-slate-500">İlan Sahibi</p>
        </div>
      </div>

      {showContactButton && onContactClick && (
        <Button
          onClick={onContactClick}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          data-testid="button-contact-owner"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          İletişim
        </Button>
      )}

      <div className="flex items-start gap-2 text-xs text-slate-600 bg-amber-50 border border-amber-100 rounded-lg p-3">
        <Shield className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="font-medium text-amber-900 mb-1">Güvenlik Hatırlatması</p>
          <p className="leading-relaxed">
            Buluşma öncesi kimlik doğrulaması yapın. Detaylar için{" "}
            <a href="/guvenlik-onerileri" className="underline hover:text-amber-700">
              Güvenlik Önerileri
            </a>
            'ne göz atın.
          </p>
        </div>
      </div>
    </div>
  );
}
