import { ShieldCheck } from "lucide-react";

// --- Types and Interfaces (Unchanged) ---
export interface SeekerCardProps {
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
  onContact?: () => void;
}

// --- Helper Functions (Unchanged) ---
const formatTRY = (v?: number) =>
  typeof v === "number"
    ? `₺${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(
        Math.round(v),
      )}`
    : "Bütçe belirtilmedi";

// --- Info Chip Component and Helpers (Unchanged) ---
type InfoColor = "success" | "info" | "primary" | "secondary";

const colorClasses: Record<InfoColor, string> = {
  success: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  info: "bg-sky-100 text-sky-800 ring-sky-200",
  primary: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  secondary: "bg-gray-200 text-gray-700 ring-gray-300",
};

function Info({
  label,
  value,
  color,
  titleAll,
}: {
  label: string;
  value: string;
  color: InfoColor;
  titleAll?: boolean;
}) {
  const chipClasses = colorClasses[color];

  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase font-medium tracking-wider text-gray-500">
        {label}
      </div>
      <div
        className={`mt-1 inline-flex max-w-full items-center rounded-lg px-2 py-[3px] text-xs font-semibold ring-1 ${chipClasses}`}
        title={titleAll ? value : undefined}
      >
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}

// --- Main Component (SeekerCard) ---
export default function SeekerCard({
  seeker,
  onClick,
  onContact,
}: SeekerCardProps) {
  const initials = (() => {
    const [a = "", b = ""] = (seeker.fullName || "").trim().split(/\s+/);
    return (a[0] + (b[0] || "")).toUpperCase();
  })();

  const loc = seeker.preferredLocations?.length
    ? seeker.preferredLocations.slice(0, 2).join(", ") +
      (seeker.preferredLocations.length > 2 ? "…" : "")
    : "Lokasyon bilgisi yok";

  const age = seeker.age ? `${seeker.age} yaş` : "Yaş belirtilmedi";
  const occ = seeker.occupation || "Durum belirtilmedi";
  const budget = seeker.budgetMonthly
    ? `${formatTRY(seeker.budgetMonthly)}/ay`
    : "Bütçe belirtilmedi";

  const contact = () => {
    if (onContact) return onContact();
    window.location.href = `/mesajlar?to=${encodeURIComponent(seeker.id)}`;
  };

  return (
    <div
      role="button"
      aria-label={`Profili aç: ${seeker.fullName}`}
      onClick={onClick}
      className="
        group rounded-xl bg-gray-50 ring-1 ring-gray-200 shadow-lg 
        hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300
      "
      data-testid={`seeker-card-${seeker.id}`}
    >
      <div className="p-4">
        <div
          className="
            grid grid-cols-[96px,1fr] md:grid-cols-[128px,1fr] 
            gap-4 md:gap-5 items-stretch
          "
        >
          {/* Photo box: Removed fixed width/height so it stretches vertically */}
          <div
            className="
              overflow-hidden rounded-xl border-2 border-gray-200 
              **h-full** w-[96px] md:w-[128px] **aspect-square md:aspect-auto** bg-white // Aspect-square on mobile, stretches on desktop
            "
          >
            {seeker.avatarUrl ? (
              <img
                src={seeker.avatarUrl}
                alt={seeker.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-slate-500 text-xl md:text-2xl font-extrabold">
                {initials}
              </div>
            )}
          </div>

          {/* Right side - Info and Action */}
          <div className="min-w-0 flex flex-col justify-between">
            {/* Top info */}
            <div>
              {/* Name and Verification - Added mb-3 for slightly more space */}
              <div className="flex items-center gap-2 **mb-3**">
                <h3
                  className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 truncate"
                  title={seeker.fullName}
                >
                  {seeker.fullName}
                </h3>
                {seeker.verified && (
                  <span
                    className="inline-flex rounded-full bg-blue-600 text-white p-1.5 shadow-md"
                    aria-label="Doğrulanmış"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </div>

              {/* Chips - Added **mb-2** to increase space before the button area slightly */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 **mb-2**">
                <Info label="BÜTÇE" value={budget} color="success" />
                <Info label="LOKASYON" value={loc} color="primary" titleAll />
                <Info label="MESLEK / DURUM" value={occ} color="info" />
                <Info label="YAŞ" value={age} color="secondary" />
              </div>
            </div>

            {/* Compact action - Now pushed to the bottom of the right column */}
            <div className="mt-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  contact();
                }}
                className="
                  inline-flex items-center justify-center w-full md:w-auto
                  rounded-xl px-4 **py-2** **text-sm** font-semibold shadow-lg // Reduced height (py) and font size (text-sm)
                  bg-orange-600 text-white hover:bg-orange-700
                  focus:outline-none focus:ring-4 focus:ring-orange-300 transition ease-in-out duration-150
                "
              >
                İletişime Geçin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Skeleton Component (Adjusted) ---
export function SeekerCardSkeleton() {
  return (
    <div className="rounded-xl bg-gray-50 ring-1 ring-gray-200 shadow-lg p-4">
      <div className="grid grid-cols-[96px,1fr] md:grid-cols-[128px,1fr] gap-4 md:gap-5 items-stretch">
        {/* Skeleton image box updated to stretch */}
        <div className="w-[96px] md:w-[128px] **h-full aspect-square md:aspect-auto** rounded-xl border-2 border-gray-200 bg-gray-200 animate-pulse" />
        <div className="min-w-0 flex flex-col justify-between">
          <div>
            <div className="h-6 w-52 bg-gray-200 rounded animate-pulse **mb-3**" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 **mb-2**">
              <div className="h-8 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-8 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-8 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-8 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
          {/* Skeleton button height adjusted */}
          <div className="h-9 w-36 bg-gray-200 rounded-xl animate-pulse mt-3" />
        </div>
      </div>
    </div>
  );
}
