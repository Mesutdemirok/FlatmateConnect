import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

type Seeker = {
  id: string;
  userId?: string;
  slug?: string | null;
  fullName?: string | null;
  user?: { 
    id?: string;
    firstName?: string | null; 
    lastName?: string | null;
  } | null;
  profilePhotoUrl?: string | null;
  photos?: Array<{ imagePath?: string; sortOrder?: number | null }>;
  preferredLocation?: string | null;
  budgetMonthly?: string | null;
  age?: number | null;
  gender?: string | null;
  occupation?: string | null;
  moveInDate?: string | null;
  createdAt?: string | Date;
};

function nameOf(s: Seeker) {
  if (s.fullName) return s.fullName.trim();
  if (s.user?.firstName) {
    const ln = s.user?.lastName || "";
    return `${s.user.firstName} ${ln}`.trim();
  }
  return "Oda arayan";
}

function photoOf(s: Seeker) {
  if (s.profilePhotoUrl) return getAbsoluteImageUrl(s.profilePhotoUrl);
  const p = s.photos?.find((x) => x.sortOrder === 0) || s.photos?.[0];
  if (p?.imagePath) return getAbsoluteImageUrl(p.imagePath);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameOf(s))}&background=8b5cf6&color=fff&size=512`;
}

function formatBudget(budget?: string | null) {
  if (!budget) return "";
  const num =
    typeof budget === "string"
      ? Number(budget.replace(/[^\d.,-]/g, "").replace(",", "."))
      : Number(budget);
  if (!Number.isFinite(num)) return "";
  return `₺${num.toLocaleString("tr-TR")}`;
}

function formatGender(gender?: string | null) {
  if (!gender) return "";
  const genderMap: Record<string, string> = {
    male: "Erkek",
    female: "Kadın",
    other: "Diğer",
  };
  return genderMap[gender.toLowerCase()] || gender;
}

function formatMoveInDate(date?: string | null) {
  if (!date) return "Şimdi müsait";
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
  return `${d.toLocaleDateString("tr-TR", options)} tarihinde`;
}

// Helper to check if date is within last N days
const isWithinDays = (date: string | Date | undefined, days: number): boolean => {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays < days;
};

interface SeekerCardProps {
  seeker: Seeker;
}

export default function SeekerCard({ seeker }: SeekerCardProps) {
  const { isAuthenticated } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ✅ FIX: Use userId or id (not slug) for correct backend route
  const seekerUrl = `/oda-arayan/${seeker.userId || seeker.id}`;

  const name = nameOf(seeker);
  const budget = formatBudget(seeker.budgetMonthly);
  const genderText = formatGender(seeker.gender);
  const availability = formatMoveInDate(seeker.moveInDate);

  // Get all photos
  const photos = useMemo(() => {
    const allPhotos = [];
    if (seeker.profilePhotoUrl) {
      allPhotos.push(getAbsoluteImageUrl(seeker.profilePhotoUrl));
    }
    if (seeker.photos && seeker.photos.length > 0) {
      const sorted = [...seeker.photos].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
      sorted.forEach((p) => {
        if (p.imagePath) {
          const url = getAbsoluteImageUrl(p.imagePath);
          if (!allPhotos.includes(url)) {
            allPhotos.push(url);
          }
        }
      });
    }
    if (allPhotos.length === 0) {
      allPhotos.push(
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&size=512`
      );
    }
    return allPhotos;
  }, [seeker.profilePhotoUrl, seeker.photos, name]);

  const hasMultiplePhotos = photos.length > 1;
  const currentPhotoUrl = photos[currentImageIndex];

  // Show NEW badge if created within last 7 days
  const showNewBadge = useMemo(() => {
    return isWithinDays(seeker.createdAt, 7);
  }, [seeker.createdAt]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <Link href={seekerUrl}>
      <article className="group block overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300">
        {/* IMAGE CAROUSEL */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={currentPhotoUrl}
            alt={name}
            className="w-full h-full object-cover"
          />

          {/* Left Arrow */}
          {hasMultiplePhotos && (
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-105 z-10"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" strokeWidth={2.5} />
            </button>
          )}

          {/* Right Arrow */}
          {hasMultiplePhotos && (
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-105 z-10"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" strokeWidth={2.5} />
            </button>
          )}

          {/* Image Counter */}
          {hasMultiplePhotos && (
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
              <span className="text-white text-sm font-medium">
                {currentImageIndex + 1} / {photos.length}
              </span>
            </div>
          )}

          {/* NEW Badge */}
          {showNewBadge && (
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white backdrop-blur-sm shadow-lg">
              <span className="text-gray-800 text-xs font-bold uppercase tracking-wide">YENİ</span>
            </div>
          )}

          {/* Favorite Button */}
          {isAuthenticated && (
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-105"
              onClick={(e) => e.preventDefault()}
              aria-label="Add to favorites"
            >
              <Star className="w-5 h-5 text-gray-800" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Info Section */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            {budget && (
              <div className="text-2xl font-semibold text-purple-600">
                {budget} <span className="text-lg font-normal text-gray-600">/ ay</span>
              </div>
            )}
            {seeker.age && genderText && (
              <div className="text-gray-600">
                {seeker.age} yaşında {genderText}
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-800 truncate">{name}</h3>

          {seeker.preferredLocation && (
            <p className="text-gray-600 truncate">{seeker.preferredLocation}</p>
          )}

          <p className="text-sm text-gray-500">{availability}</p>
        </div>
      </article>
    </Link>
  );
}

export { SeekerCard };