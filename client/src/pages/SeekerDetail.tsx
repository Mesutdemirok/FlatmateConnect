import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { fetchSeeker, SeekerProfileWithRelations } from "@/lib/seekerApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, DollarSign, User, Briefcase, Home, MessageCircle, Edit } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";

export default function SeekerDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();

  const {
    data: seeker,
    isLoading,
    error,
  } = useQuery<SeekerProfileWithRelations>({
    queryKey: ["/api/seekers", id],
    queryFn: () => fetchSeeker(id!),
    enabled: !!id,
  });

  const getDisplayName = () => {
    if (!seeker) return "";
    if (seeker.fullName) {
      const parts = seeker.fullName.split(" ");
      return parts.length > 1 ? `${parts[0]} ${parts[1].charAt(0)}.` : parts[0];
    }
    if (seeker.user?.firstName && seeker.user?.lastName) {
      return `${seeker.user.firstName} ${seeker.user.lastName.charAt(0)}.`;
    }
    return "Anonim";
  };

  const isOwner = user && seeker && user.id === seeker.userId;

  const getPhotoUrl = () => {
    // Use profilePhotoUrl if available
    if (seeker?.profilePhotoUrl) {
      return getAbsoluteImageUrl(seeker.profilePhotoUrl);
    }
    // Fallback to photos array
    const primaryPhoto = seeker?.photos?.find((p) => p.sortOrder === 0) || seeker?.photos?.[0];
    if (primaryPhoto?.imagePath) {
      return getAbsoluteImageUrl(primaryPhoto.imagePath);
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}&background=8b5cf6&color=fff&size=800`;
  };

  const formatBudget = (budget: string | null) => {
    if (!budget) return "Belirtilmemiş";
    const num = parseFloat(budget);
    return `₺${num.toLocaleString('tr-TR')}/ay`;
  };

  const handleContactSeeker = () => {
    if (!isAuthenticated) {
      navigate(`/giris?next=${encodeURIComponent(window.location.pathname)}`);
    } else if (seeker?.userId) {
      navigate(`/mesajlar?userId=${seeker.userId}`);
    }
  };

  const handleEditProfile = () => {
    navigate('/oda-arama-ilani-olustur');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="seeker-detail-loading">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[500px] rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !seeker) {
    return (
      <div className="min-h-screen bg-background" data-testid="seeker-detail-error">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Profil Bulunamadı</h1>
            <p className="text-muted-foreground mb-8">Aradığınız oda arayan profil bulunamadı veya kaldırılmış olabilir.</p>
            <Button onClick={() => navigate("/")}>Ana Sayfaya Dön</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const primaryPhoto = seeker.photos?.find((p) => p.sortOrder === 0) || seeker.photos?.[0];

  return (
    <div className="min-h-screen bg-background" data-testid="seeker-detail-page">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
          data-testid="back-button"
        >
          ← Geri Dön
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Photo Gallery */}
          <div className="space-y-4">
            <div className="relative h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100">
              <img
                src={getPhotoUrl()}
                alt={getDisplayName()}
                className="w-full h-full object-cover"
                data-testid="seeker-primary-photo"
              />
            </div>
          </div>

          {/* Seeker Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="seeker-name">
                {getDisplayName()}
              </h1>
              <div className="flex items-center gap-3 text-muted-foreground">
                {seeker.age && (
                  <Badge variant="secondary" className="text-sm">
                    {seeker.age} yaş
                  </Badge>
                )}
                {seeker.gender && (
                  <Badge variant="secondary" className="text-sm">
                    {seeker.gender === 'male' ? 'Erkek' : seeker.gender === 'female' ? 'Kadın' : seeker.gender}
                  </Badge>
                )}
              </div>
            </div>

            {/* Budget & Location */}
            <Card>
              <CardContent className="p-6 space-y-4">
                {seeker.budgetMonthly && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100">
                      <DollarSign className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bütçe</p>
                      <p className="font-semibold text-foreground">{formatBudget(seeker.budgetMonthly)}</p>
                    </div>
                  </div>
                )}

                {seeker.preferredLocation && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-violet-100 mt-1">
                      <MapPin className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Tercih Edilen Bölge</p>
                      <p className="font-semibold text-foreground">{seeker.preferredLocation}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* About */}
            {seeker.about && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Hakkında
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{seeker.about}</p>
                </CardContent>
              </Card>
            )}

            {/* Additional Details */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Detaylar
                </h2>
                
                {seeker.occupation && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Meslek</span>
                    <span className="font-medium">{seeker.occupation}</span>
                  </div>
                )}

                {seeker.smokingPreference && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sigara</span>
                    <span className="font-medium">
                      {seeker.smokingPreference === 'non-smoker' ? 'İçmiyor' : 
                       seeker.smokingPreference === 'smoker' ? 'İçiyor' : 
                       seeker.smokingPreference === 'social-smoker' ? 'Sosyal İçici' : seeker.smokingPreference}
                    </span>
                  </div>
                )}

                {seeker.petPreference && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Evcil Hayvan Tercihi</span>
                    <span className="font-medium">
                      {seeker.petPreference === 'no-pets' ? 'Hayvan İstemez' : 
                       seeker.petPreference === 'cat-friendly' ? 'Kedi Dostu' : 
                       seeker.petPreference === 'dog-friendly' ? 'Köpek Dostu' :
                       seeker.petPreference === 'all-pets' ? 'Her Tür Hayvan' : seeker.petPreference}
                    </span>
                  </div>
                )}

                {seeker.cleanlinessLevel && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temizlik</span>
                    <span className="font-medium">
                      {seeker.cleanlinessLevel === 'very-clean' ? 'Çok Temiz' : 
                       seeker.cleanlinessLevel === 'clean' ? 'Temiz' : 
                       seeker.cleanlinessLevel === 'average' ? 'Orta' :
                       seeker.cleanlinessLevel === 'relaxed' ? 'Rahat' : seeker.cleanlinessLevel}
                    </span>
                  </div>
                )}

                {seeker.socialLevel && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sosyallik</span>
                    <span className="font-medium">
                      {seeker.socialLevel === 'very-social' ? 'Çok Sosyal' : 
                       seeker.socialLevel === 'social' ? 'Sosyal' : 
                       seeker.socialLevel === 'balanced' ? 'Dengeli' :
                       seeker.socialLevel === 'quiet' ? 'Sessiz' : seeker.socialLevel}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
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
