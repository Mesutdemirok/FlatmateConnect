import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { fetchSeeker, SeekerProfileWithRelations } from "@/lib/seekerApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  DollarSign,
  User,
  Briefcase,
  MessageCircle,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";

/** Safe currency label for TR */
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

export default function SeekerDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgOk, setImgOk] = useState(true);

  const {
    data: seeker,
    isLoading,
    error,
  } = useQuery<SeekerProfileWithRelations>({
    queryKey: ["/api/seekers", id],
    queryFn: () => fetchSeeker(id!),
    enabled: !!id,
  });

  // Görünen ad
  const displayName = useMemo(() => {
    if (!seeker) return "";
    if (seeker.fullName) {
      const parts = seeker.fullName.trim().split(/\s+/);
      return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
    }
    if (seeker.user?.firstName) {
      const ln = seeker.user.lastName?.[0] ?? "";
      return `${seeker.user.firstName} ${ln ? ln + "." : ""}`.trim();
    }
    return "Anonim";
  }, [seeker]);

  const isOwner = !!(user && seeker && user.id === seeker.userId);

  // Fotoğraf kaynağı
  const photos = useMemo(() => {
    const list =
      Array.isArray(seeker?.photos) && seeker?.photos.length
        ? seeker!.photos
        : [];
    // profilePhotoUrl varsa listenin başına koy
    const lead = seeker?.profilePhotoUrl
      ? [{ imagePath: seeker.profilePhotoUrl, sortOrder: -1 }]
      : [];
    return [...lead, ...list];
  }, [seeker]);

  const activeImageUrl = useMemo(() => {
    // Önce profilePhotoUrl / sonra seçilen / sonra ilk foto
    if (seeker?.profilePhotoUrl && currentIndex === 0) {
      return getAbsoluteImageUrl(seeker.profilePhotoUrl);
    }
    const base = seeker?.profilePhotoUrl ? photos.slice(1) : photos;
    const idx = seeker?.profilePhotoUrl ? currentIndex - 1 : currentIndex;
    const chosen =
      base && base.length > 0
        ? base[Math.max(0, Math.min(idx, base.length - 1))]
        : undefined;

    if (chosen?.imagePath) return getAbsoluteImageUrl(chosen.imagePath);

    // Avatar fallback
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName || "U",
    )}&background=8b5cf6&color=fff&size=800`;
  }, [currentIndex, photos, seeker?.profilePhotoUrl, displayName]);

  const totalImages = useMemo(() => {
    const count =
      (seeker?.profilePhotoUrl ? 1 : 0) + (seeker?.photos?.length || 0);
    return count || 1;
  }, [seeker]);

  const hasMultiple = totalImages > 1;

  const next = () => {
    if (!hasMultiple) return;
    setCurrentIndex((i) => (i + 1) % totalImages);
    setImgOk(true);
  };
  const prev = () => {
    if (!hasMultiple) return;
    setCurrentIndex((i) => (i - 1 + totalImages) % totalImages);
    setImgOk(true);
  };

  const handleContactSeeker = () => {
    if (!isAuthenticated) {
      navigate(`/giris?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (seeker?.userId) {
      // Messages sayfası ?user= paramını bekliyor
      navigate(`/mesajlar?user=${seeker.userId}`);
    }
  };

  const handleEditProfile = () => {
    // Varsa edit route’unu kullan; yoksa create sayfasına yönlendiriyoruz
    navigate("/oda-arama-ilani-olustur");
  };

  // Yükleniyor
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-background"
        data-testid="seeker-detail-loading"
      >
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[480px] rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Hata veya bulunamadı
  if (error || !seeker) {
    return (
      <div
        className="min-h-screen bg-background"
        data-testid="seeker-detail-error"
      >
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold mb-3">Profil Bulunamadı</h1>
          <p className="text-muted-foreground mb-8">
            Aradığınız oda arayan profili bulunamadı veya kaldırılmış olabilir.
          </p>
          <Button onClick={() => navigate("/oda-aramalari")}>
            Oda Arayanlara Dön
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  // SEO data
  const seoTitle = `${displayName} - Oda Arıyor | Odanet`;
  const seoDescription = seeker.about 
    ? seeker.about.slice(0, 155) + (seeker.about.length > 155 ? '...' : '')
    : `${displayName}, ${seeker.age || ''} yaş, ${seeker.occupation || 'profesyonel'}. ${seeker.preferredLocation || 'Türkiye'} bölgesinde oda arıyor. ${formatBudgetTR(seeker.budgetMonthly)} bütçe.`;
  const seoImage = activeImageUrl;
  const seoUrl = `https://www.odanet.com.tr/oda-arayan/${id}`;

  return (
    <div
      className="min-h-screen bg-background"
      data-testid="seeker-detail-page"
    >
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
        image={seoImage}
        url={seoUrl}
      />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Geri dön */}
        <Button
          variant="ghost"
          onClick={() => navigate("/oda-aramalari")}
          className="mb-4 sm:mb-6"
          data-testid="back-button"
        >
          ← Geri Dön
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Fotoğraf / Galeri */}
          <div className="space-y-3 sm:space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10]">
                <img
                  src={
                    imgOk
                      ? activeImageUrl
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          displayName || "U",
                        )}&background=8b5cf6&color=fff&size=800`
                  }
                  alt={displayName}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => setImgOk(false)}
                  data-testid="seeker-primary-photo"
                />

                {hasMultiple && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                      onClick={prev}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                      onClick={next}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-white text-xs">
                      {(((currentIndex % totalImages) + totalImages) %
                        totalImages) +
                        1}{" "}
                      / {totalImages}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Küçük önizlemeler */}
            {hasMultiple && (
              <div className="flex gap-2 overflow-x-auto">
                {Array.from({ length: totalImages }).map((_, i) => {
                  // Her index için görsel URL’ini hesapla
                  let url = "";
                  if (seeker.profilePhotoUrl && i === 0) {
                    url = getAbsoluteImageUrl(seeker.profilePhotoUrl);
                  } else {
                    const baseIdx = seeker.profilePhotoUrl ? i - 1 : i;
                    const p = seeker.photos?.[baseIdx];
                    url = p?.imagePath
                      ? getAbsoluteImageUrl(p.imagePath)
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          displayName || "U",
                        )}&background=8b5cf6&color=fff&size=256`;
                  }
                  const active = i === currentIndex;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentIndex(i);
                        setImgOk(true);
                      }}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                        active ? "border-primary" : "border-transparent"
                      }`}
                      aria-label={`Fotoğraf ${i + 1}`}
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detaylar */}
          <div className="space-y-6">
            {/* Başlık */}
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold mb-2"
                data-testid="seeker-name"
              >
                {displayName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                {seeker.age && (
                  <Badge variant="secondary">{seeker.age} yaş</Badge>
                )}
                {seeker.gender && (
                  <Badge variant="secondary">
                    {seeker.gender === "male"
                      ? "Erkek"
                      : seeker.gender === "female"
                        ? "Kadın"
                        : seeker.gender}
                  </Badge>
                )}
              </div>
            </div>

            {/* Bütçe & Konum */}
            <Card>
              <CardContent className="p-5 sm:p-6 space-y-4">
                {seeker.budgetMonthly && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100">
                      <DollarSign className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bütçe</p>
                      <p className="font-semibold">
                        {formatBudgetTR(seeker.budgetMonthly)}
                      </p>
                    </div>
                  </div>
                )}

                {seeker.preferredLocation && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-violet-100 mt-1">
                      <MapPin className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Tercih Edilen Bölge
                      </p>
                      <p className="font-semibold">
                        {seeker.preferredLocation}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hakkında */}
            {seeker.about && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" />
                    Hakkında
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {seeker.about}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Ek detaylar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5" />
                  Detaylar
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {seeker.occupation && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Meslek</span>
                    <span className="font-medium">{seeker.occupation}</span>
                  </div>
                )}

                {seeker.smokingPreference && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sigara</span>
                    <span className="font-medium">
                      {seeker.smokingPreference === "non-smoker"
                        ? "İçmiyor"
                        : seeker.smokingPreference === "smoker"
                          ? "İçiyor"
                          : seeker.smokingPreference === "social-smoker"
                            ? "Sosyal İçici"
                            : seeker.smokingPreference}
                    </span>
                  </div>
                )}

                {seeker.petPreference && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Evcil Hayvan</span>
                    <span className="font-medium">
                      {seeker.petPreference === "no-pets"
                        ? "Hayvan İstemez"
                        : seeker.petPreference === "cat-friendly"
                          ? "Kedi Dostu"
                          : seeker.petPreference === "dog-friendly"
                            ? "Köpek Dostu"
                            : seeker.petPreference === "all-pets"
                              ? "Her Tür Hayvan"
                              : seeker.petPreference}
                    </span>
                  </div>
                )}

                {seeker.cleanlinessLevel && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Temizlik</span>
                    <span className="font-medium">
                      {seeker.cleanlinessLevel === "very-clean"
                        ? "Çok Temiz"
                        : seeker.cleanlinessLevel === "clean"
                          ? "Temiz"
                          : seeker.cleanlinessLevel === "average"
                            ? "Orta"
                            : seeker.cleanlinessLevel === "relaxed"
                              ? "Rahat"
                              : seeker.cleanlinessLevel}
                    </span>
                  </div>
                )}

                {seeker.socialLevel && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sosyallik</span>
                    <span className="font-medium">
                      {seeker.socialLevel === "very-social"
                        ? "Çok Sosyal"
                        : seeker.socialLevel === "social"
                          ? "Sosyal"
                          : seeker.socialLevel === "balanced"
                            ? "Dengeli"
                            : seeker.socialLevel === "quiet"
                              ? "Sessiz"
                              : seeker.socialLevel}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Aksiyonlar */}
            {isOwner ? (
              <Button
                onClick={handleEditProfile}
                className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white hover:opacity-90"
                size="lg"
                data-testid="edit-profile-button"
              >
                <Edit className="h-5 w-5 mr-2" />
                İlanımı Düzenle
              </Button>
            ) : (
              <Button
                onClick={handleContactSeeker}
                className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white hover:opacity-90"
                size="lg"
                data-testid="contact-seeker-button"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                İletişime Geç
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
