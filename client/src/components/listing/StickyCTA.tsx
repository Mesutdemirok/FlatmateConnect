// ODANET Mobil Detay Revizyonu – Alt Sabit CTA
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface StickyCTAProps {
  price: string;
  onContact: () => void;
  disabled?: boolean;
}

export default function StickyCTA({ price, onContact, disabled = false }: StickyCTAProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70"
      data-testid="sticky-cta"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Sol: Fiyat */}
        <div>
          <p className="text-xs text-slate-500">Aylık Kira</p>
          <p className="text-lg font-bold text-slate-900">{price}/ay</p>
        </div>

        {/* Sağ: İletişim Butonu */}
        <Button
          onClick={onContact}
          disabled={disabled}
          className="flex items-center gap-2 text-white hover:brightness-95"
          style={{ backgroundColor: "#f97316" }}
          data-testid="sticky-contact-button"
        >
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Sahibiyle İletişime Geç</span>
          <span className="sm:hidden">İletişime Geç</span>
        </Button>
      </div>
    </div>
  );
}
