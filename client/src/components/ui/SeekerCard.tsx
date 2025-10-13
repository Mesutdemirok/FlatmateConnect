import { ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface SeekerCardProps {
  seeker: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    age?: number;
    occupation?: string;
    preferredLocations?: string[];
    budgetMonthly?: number;
    verified?: boolean;
  };
  onClick?: () => void;
}

export default function SeekerCard({ seeker, onClick }: SeekerCardProps) {
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const locationDisplay = seeker.preferredLocations && seeker.preferredLocations.length > 0
    ? seeker.preferredLocations.slice(0, 2).join(", ") + 
      (seeker.preferredLocations.length > 2 ? "..." : "")
    : "Lokasyon bilgisi yok";

  const budgetDisplay = seeker.budgetMonthly 
    ? `${formatCurrency(seeker.budgetMonthly)}/ay`
    : "Bütçe belirtilmedi";

  const occupationDisplay = seeker.occupation || "Durum belirtilmedi";
  const ageDisplay = seeker.age ? `${seeker.age} yaş` : "Yaş belirtilmedi";

  return (
    <div
      className="relative rounded-2xl bg-white shadow-sm ring-1 ring-black/5 hover:shadow-lg transition-shadow duration-300 p-5 md:p-6 cursor-pointer"
      onClick={onClick}
      role="button"
      aria-label={`Profili aç: ${seeker.fullName}`}
      data-testid={`seeker-card-${seeker.id}`}
    >
      {/* Corner Badges */}
      {/* Top Left - Location */}
      <div 
        className="absolute top-3 left-3 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 truncate max-w-[45%]"
        title={seeker.preferredLocations?.join(", ") || "Lokasyon bilgisi yok"}
        data-testid={`seeker-location-${seeker.id}`}
      >
        {locationDisplay}
      </div>

      {/* Top Right - Budget */}
      <div 
        className="absolute top-3 right-3 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 truncate max-w-[45%]"
        title={budgetDisplay}
        data-testid={`seeker-budget-${seeker.id}`}
      >
        {budgetDisplay}
      </div>

      {/* Bottom Left - Occupation */}
      <div 
        className="absolute bottom-3 left-3 rounded-full bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 truncate max-w-[45%]"
        title={occupationDisplay}
        data-testid={`seeker-occupation-${seeker.id}`}
      >
        {occupationDisplay}
      </div>

      {/* Bottom Right - Age */}
      <div 
        className="absolute bottom-3 right-3 rounded-full bg-fuchsia-50 text-fuchsia-700 text-xs font-medium px-2.5 py-1"
        title={ageDisplay}
        data-testid={`seeker-age-${seeker.id}`}
      >
        {ageDisplay}
      </div>

      {/* Center Content */}
      <div className="flex flex-col items-center justify-center py-8 md:py-10">
        {/* Avatar */}
        <div className="relative mb-4">
          {seeker.avatarUrl ? (
            <img
              src={seeker.avatarUrl}
              alt={seeker.fullName}
              className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-white shadow-md"
              data-testid={`seeker-avatar-${seeker.id}`}
            />
          ) : (
            <div 
              className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center ring-4 ring-white shadow-md"
              data-testid={`seeker-avatar-placeholder-${seeker.id}`}
            >
              <span className="text-white text-3xl md:text-4xl font-bold">
                {getInitials(seeker.fullName)}
              </span>
            </div>
          )}

          {/* Verification Badge */}
          {seeker.verified && (
            <div 
              className="absolute -bottom-1 -right-1 rounded-full bg-rose-500 text-white p-1 shadow-md"
              data-testid={`seeker-verified-${seeker.id}`}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Name */}
        <h3 
          className="text-xl md:text-2xl font-bold text-slate-900 text-center px-4"
          data-testid={`seeker-name-${seeker.id}`}
        >
          {seeker.fullName}
        </h3>
      </div>
    </div>
  );
}

export function SeekerCardSkeleton() {
  return (
    <div className="relative rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5 md:p-6">
      {/* Corner placeholders */}
      <div className="absolute top-3 left-3 h-6 w-24 rounded-full bg-slate-200 animate-pulse" />
      <div className="absolute top-3 right-3 h-6 w-20 rounded-full bg-slate-200 animate-pulse" />
      <div className="absolute bottom-3 left-3 h-6 w-20 rounded-full bg-slate-200 animate-pulse" />
      <div className="absolute bottom-3 right-3 h-6 w-16 rounded-full bg-slate-200 animate-pulse" />

      {/* Center content */}
      <div className="flex flex-col items-center justify-center py-8 md:py-10">
        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-slate-200 animate-pulse mb-4" />
        <div className="h-7 w-32 bg-slate-200 animate-pulse rounded" />
      </div>
    </div>
  );
}
