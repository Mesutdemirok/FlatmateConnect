import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { fetchSeeker, SeekerProfileWithRelations } from "@/lib/seekerApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, DollarSign, User, Briefcase, Home, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function SeekerDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

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
    if (seeker.firstName && seeker.lastName) {
      return `${seeker.firstName} ${seeker.lastName.charAt(0)}.`;
    }
    if (seeker.user?.firstName && seeker.user?.lastName) {
      return `${seeker.user.firstName} ${seeker.user.lastName.charAt(0)}.`;
    }
    if (seeker.user?.name) {
      const nameParts = seeker.user.name.split(" ");
      return nameParts.length > 1
        ? `${nameParts[0]} ${nameParts[1].charAt(0)}.`
        : nameParts[0];
    }
    return seeker.firstName || "Anonim";
  };

  const getPhotoUrl = (photo?: { imagePath: string }) => {
    if (photo) {
      return `/uploads/seekers/${photo.imagePath}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}&background=8b5cf6&color=fff&size=800`;
  };

  const formatBudget = (budget: string | null) => {
    if (!budget) return "Belirtilmemiş";
    const num = parseFloat(budget);
    return `₺${num.toLocaleString('tr-TR')}/hafta`;
  };

  const handleContactSeeker = () => {
    if (!isAuthenticated) {
      navigate(`/auth/login?next=${encodeURIComponent(window.location.pathname)}`);
    } else if (seeker?.userId) {
      navigate(`/messages?userId=${seeker.userId}`);
    }
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
                src={getPhotoUrl(primaryPhoto)}
                alt={getDisplayName()}
                className="w-full h-full object-cover"
                data-testid="seeker-primary-photo"
              />
            </div>

            {seeker.photos && seeker.photos.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {seeker.photos.slice(0, 4).map((photo, index) => (
                  <div
                    key={photo.id}
                    className="relative h-24 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100 cursor-pointer hover:opacity-80 transition-opacity"
                    data-testid={`seeker-thumbnail-${index}`}
                  >
                    <img
                      src={getPhotoUrl(photo)}
                      alt={`${getDisplayName()} - Fotoğraf ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
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
                {seeker.budgetWeekly && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100">
                      <DollarSign className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bütçe</p>
                      <p className="font-semibold text-foreground">{formatBudget(seeker.budgetWeekly)}</p>
                    </div>
                  </div>
                )}

                {seeker.preferredLocations && seeker.preferredLocations.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-violet-100 mt-1">
                      <MapPin className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Tercih Edilen Bölgeler</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {seeker.preferredLocations.map((location, index) => (
                          <Badge key={index} variant="outline" className="text-sm">
                            {location}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {seeker.moveInDate && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-fuchsia-100">
                      <Calendar className="h-5 w-5 text-fuchsia-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taşınma Tarihi</p>
                      <p className="font-semibold text-foreground">
                        {new Date(seeker.moveInDate).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                )}

                {seeker.stayDuration && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-pink-100">
                      <Home className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Kalış Süresi</p>
                      <p className="font-semibold text-foreground">{seeker.stayDuration}</p>
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

                {seeker.smokingStatus && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sigara</span>
                    <span className="font-medium">
                      {seeker.smokingStatus === 'non-smoker' ? 'İçmiyor' : 
                       seeker.smokingStatus === 'smoker' ? 'İçiyor' : 
                       seeker.smokingStatus === 'social-smoker' ? 'Sosyal İçici' : seeker.smokingStatus}
                    </span>
                  </div>
                )}

                {seeker.petOwner !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Evcil Hayvan</span>
                    <span className="font-medium">{seeker.petOwner ? 'Var' : 'Yok'}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Button */}
            <Button
              onClick={handleContactSeeker}
              className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white hover:opacity-90"
              size="lg"
              data-testid="contact-seeker-button"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              İletişime Geç
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
