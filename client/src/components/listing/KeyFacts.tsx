// ODANET Mobil Detay Revizyonu – Kilit Bilgiler (Oda Bilgileri)
import DefinitionList, { DefinitionItem } from "@/components/ui/DefinitionList";

interface KeyFactsProps {
  totalRooms?: number;
  totalOccupants?: number;
  roommatePreference?: string;
  smokingPolicy?: string;
  petPolicy?: string;
  bathroomType?: string;
  furnishingStatus?: string;
}

export default function KeyFacts({
  totalRooms,
  totalOccupants,
  roommatePreference,
  smokingPolicy,
  petPolicy,
  bathroomType,
  furnishingStatus,
}: KeyFactsProps) {
  // Sigara politikası çevirisi
  const getSmokingText = (policy?: string) => {
    if (!policy) return "Belirtilmemiş";
    const lowerPolicy = policy.toLowerCase();
    if (lowerPolicy.includes("ilebilir") || lowerPolicy === "allowed") return "İçilebilir";
    if (lowerPolicy.includes("ilemez") || lowerPolicy === "not_allowed") return "İçilemez";
    return policy;
  };

  // Banyo tipi çevirisi
  const getBathroomText = (type?: string) => {
    if (!type) return "Belirtilmemiş";
    const lowerType = type.toLowerCase();
    if (lowerType === "ortak" || lowerType === "shared") return "Ortak";
    if (lowerType === "ozel" || lowerType === "özel" || lowerType === "private") return "Özel";
    return type;
  };

  // Eşya durumu çevirisi
  const getFurnishingText = (status?: string) => {
    if (!status) return "Belirtilmemiş";
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "eşyalı" || lowerStatus === "esyali" || lowerStatus === "furnished") return "Eşyalı";
    if (lowerStatus === "eşyasız" || lowerStatus === "esyasiz" || lowerStatus === "unfurnished") return "Eşyasız";
    if (lowerStatus.includes("kısmen") || lowerStatus.includes("partially")) return "Kısmen Eşyalı";
    return status;
  };

  // Cinsiyet tercihi çevirisi
  const getGenderText = (pref?: string) => {
    if (!pref) return "Belirtilmemiş";
    const lowerPref = pref.toLowerCase();
    if (lowerPref === "kadin" || lowerPref === "kadın" || lowerPref === "female") return "Kadın";
    if (lowerPref === "erkek" || lowerPref === "male") return "Erkek";
    if (lowerPref === "farketmez" || lowerPref === "any") return "Farketmez";
    return pref;
  };

  const items: DefinitionItem[] = [
    {
      label: "Toplam Oda Sayısı",
      value: totalRooms || "Belirtilmemiş",
    },
    {
      label: "Evde Yaşayan Kişi",
      value: totalOccupants || "Belirtilmemiş",
    },
    {
      label: "Cinsiyet Tercihi",
      value: getGenderText(roommatePreference),
    },
    {
      label: "Sigara",
      value: getSmokingText(smokingPolicy),
    },
    {
      label: "Evcil Hayvan",
      value: petPolicy || "Belirtilmemiş",
      hideIfNull: true,
    },
    {
      label: "Banyo",
      value: getBathroomText(bathroomType),
    },
    {
      label: "Eşya Durumu",
      value: getFurnishingText(furnishingStatus),
    },
  ];

  return (
    <div className="rounded-2xl shadow-sm bg-white ring-1 ring-slate-100 p-4 md:p-5" data-testid="key-facts">
      <h2 className="text-slate-900 font-semibold text-lg mb-4">
        Oda Bilgileri
      </h2>
      <DefinitionList items={items} columns={2} />
    </div>
  );
}
