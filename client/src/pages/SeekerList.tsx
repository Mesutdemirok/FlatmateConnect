import { useMemo, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SeekerCard from "@/components/SeekerCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search as SearchIcon } from "lucide-react";

import { SeekerProfileWithRelations } from "@/lib/seekerApi";
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch"
            data-testid="seekers-loading"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-full rounded-2xl overflow-hidden bg-white ring-1 ring-slate-200 shadow-sm p-4 space-y-3">
                <Skeleton className="w-24 h-24 rounded-full" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch"
            data-testid="seekers-grid"
          >
            {seekers.map((seeker) => (
              <div key={seeker.id} className="h-full">
                <SeekerCard seeker={seeker} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
