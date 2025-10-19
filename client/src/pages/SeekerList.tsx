import { useMemo, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search as SearchIcon, MapPin } from "lucide-react";

import { SeekerProfileWithRelations } from "@/lib/seekerApi";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";
import SEOHead from "@/components/SEOHead";

type Filters = {
  location: string;
  minBudget: string;
  maxBudget: string;
};

function formatBudgetTR(budget: string | number | null | undefined) {
  if (budget === null || budget === undefined || budget === "")
    return "Belirtilmemiş";
  const num =
    typeof budget === "string"
      ? Number(budget.replace(/[^\d.,-]/g, "").replace(",", "."))
      : Number(budget);
  if (!Number.isFinite(num)) return "Belirtilmemiş";
  return `₺${num.toLocaleString("tr-TR")}/ay`;
}

function displayNameOf(s: SeekerProfileWithRelations) {
  if (s.fullName) {
    const parts = s.fullName.trim().split(/\s+/);
    return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
  }
  if (s.user?.firstName) {
    const ln = s.user.lastName?.[0] ?? "";
    return `${s.user.firstName} ${ln ? ln + "." : ""}`.trim();
  }
  return "Anonim";
}

function photoUrlOf(s: SeekerProfileWithRelations) {
  if (s.profilePhotoUrl) return getAbsoluteImageUrl(s.profilePhotoUrl);
  const p = s.photos?.find((x) => x.sortOrder === 0) ?? s.photos?.[0];
  if (p?.imagePath) return getAbsoluteImageUrl(p.imagePath);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayNameOf(s),
  )}&background=8b5cf6&color=fff&size=400`;
}

export default function SeekerList() {
  const { t } = useTranslation();
  const [loc, navigate] = useLocation();

  // parse filters from URL
  const [filters, setFilters] = useState<Filters>({
    location: "",
    minBudget: "",
    maxBudget: "",
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    setFilters({
      location: url.searchParams.get("location") || "",
      minBudget: url.searchParams.get("minBudget") || "",
      maxBudget: url.searchParams.get("maxBudget") || "",
    });
  }, [loc]);

  // stable query string
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("isActive", "true");
    if (filters.location) params.set("location", filters.location.trim());
    if (filters.minBudget) params.set("minBudget", filters.minBudget.trim());
    if (filters.maxBudget) params.set("maxBudget", filters.maxBudget.trim());
    return params.toString();
  }, [filters]);

  const {
    data: seekers,
    isLoading,
    error,
  } = useQuery<SeekerProfileWithRelations[]>({
    queryKey: ["/api/seekers/public", queryString],
    queryFn: async () => {
      const res = await fetch(`/api/seekers/public?${queryString}`);
      if (!res.ok) throw new Error("Failed to fetch seekers");
      return res.json();
    },
  });

  const clearFilters = () => {
    navigate("/oda-aramalari"); // same page without query params
  };

  return (
    <div className="min-h-screen bg-background" data-testid="seeker-list-page">
      <SEOHead
        title="Oda Arayanlar - Ev Arkadaşı Bul | Odanet"
        description="Güvenilir ve doğrulanmış profillere sahip oda arayanlar ile tanış. Sana uygun ev arkadaşını bulmak için hemen incele."
        url="https://www.odanet.com.tr/oda-aramalari"
      />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8" data-testid="seeker-list-header">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <SearchIcon className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Oda Arayanlar
              </h1>
            </div>

            {/* Active filters preview */}
            {(filters.location || filters.minBudget || filters.maxBudget) && (
              <div className="flex items-center gap-2">
                {filters.location && (
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Konum: {filters.location}
                  </Badge>
                )}
                {filters.minBudget && (
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Min: ₺{Number(filters.minBudget).toLocaleString("tr-TR")}
                  </Badge>
                )}
                {filters.maxBudget && (
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Max: ₺{Number(filters.maxBudget).toLocaleString("tr-TR")}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="border-indigo-200 hover:bg-indigo-50"
                >
                  Filtreleri Temizle
                </Button>
              </div>
            )}
          </div>

          {!isLoading && seekers && (
            <p
              className="mt-1 text-muted-foreground"
              data-testid="seekers-count"
            >
              {seekers.length} profil bulundu
            </p>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
            data-testid="seekers-loading"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="rounded-2xl overflow-hidden shadow-md">
                <Skeleton className="w-full h-[260px] sm:h-[280px]" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert className="mb-6" data-testid="seekers-error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Profiller yüklenemedi. Lütfen daha sonra tekrar deneyiniz.
            </AlertDescription>
          </Alert>
        )}

        {/* No results */}
        {!isLoading && !error && seekers && seekers.length === 0 && (
          <div className="text-center py-12" data-testid="no-seekers">
            <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Sonuç Bulunamadı
            </h3>
            <p className="text-muted-foreground mb-6">
              Arama kriterlerinize uygun oda arayan profil bulunamadı.
            </p>
            <Button onClick={clearFilters}>Filtreleri Temizle</Button>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && seekers && seekers.length > 0 && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
            data-testid="seekers-grid"
          >
            {seekers.map((seeker) => {
              const name = displayNameOf(seeker);
              const img = photoUrlOf(seeker);

              return (
                <Card
                  key={seeker.id}
                  className="rounded-2xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                  onClick={() => navigate(`/oda-arayan/${seeker.id}`)}
                  data-testid={`seeker-card-${seeker.id}`}
                >
                  {/* Photo */}
                  <div className="relative h-[240px] sm:h-[280px] overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100">
                    <img
                      src={img}
                      alt={name}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            name || "U",
                          )}&background=8b5cf6&color=fff&size=400`;
                      }}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      data-testid={`seeker-photo-${seeker.id}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-center gap-2">
                      {seeker.budgetMonthly && (
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 rounded-full shadow-lg font-bold text-xs sm:text-sm">
                          {formatBudgetTR(seeker.budgetMonthly)}
                        </div>
                      )}
                      {seeker.age && (
                        <div className="bg-white/95 text-slate-700 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold">
                          {seeker.age} yaş
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <h3
                        className="text-white font-bold text-base sm:text-lg drop-shadow"
                        data-testid={`seeker-name-${seeker.id}`}
                      >
                        {name}
                      </h3>
                      {seeker.gender && (
                        <p className="text-white/90 text-xs sm:text-sm drop-shadow">
                          {seeker.gender === "male"
                            ? "Erkek"
                            : seeker.gender === "female"
                              ? "Kadın"
                              : seeker.gender}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <CardContent className="p-4 space-y-2.5">
                    <div className="space-y-1.5 text-sm text-slate-700">
                      {seeker.preferredLocation && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-violet-500 flex-shrink-0" />
                          <span className="truncate font-medium">
                            {seeker.preferredLocation}
                          </span>
                        </div>
                      )}

                      {seeker.occupation && (
                        <div className="text-slate-600 text-xs">
                          {seeker.occupation}
                        </div>
                      )}

                      {(seeker.cleanlinessLevel ||
                        seeker.smokingPreference ||
                        seeker.genderPreference) && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {seeker.cleanlinessLevel && (
                            <Badge className="text-xs bg-indigo-100 text-indigo-700 border-0">
                              {seeker.cleanlinessLevel === "very-clean"
                                ? "Çok Temiz"
                                : seeker.cleanlinessLevel === "clean"
                                  ? "Temiz"
                                  : seeker.cleanlinessLevel === "average"
                                    ? "Orta"
                                    : "Rahat"}
                            </Badge>
                          )}
                          {seeker.smokingPreference &&
                            seeker.smokingPreference !== "no-preference" && (
                              <Badge className="text-xs bg-violet-100 text-violet-700 border-0">
                                {seeker.smokingPreference === "non-smoker"
                                  ? "İçmiyor"
                                  : seeker.smokingPreference === "smoker"
                                    ? "İçiyor"
                                    : "Sosyal"}
                              </Badge>
                            )}
                          {seeker.genderPreference &&
                            seeker.genderPreference !== "no-preference" && (
                              <Badge className="text-xs bg-pink-100 text-pink-700 border-0">
                                {seeker.genderPreference === "male"
                                  ? "Erkek Tercih"
                                  : "Kadın Tercih"}
                              </Badge>
                            )}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-3 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/oda-arayan/${seeker.id}`);
                      }}
                      data-testid={`seeker-details-btn-${seeker.id}`}
                    >
                      Profili Görüntüle
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
