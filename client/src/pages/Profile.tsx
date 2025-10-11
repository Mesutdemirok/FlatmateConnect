import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertUserPreferencesSchema } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Settings, 
  Heart, 
  Home, 
  Shield, 
  Loader2
} from "lucide-react";
import { z } from "zod";

// Use a schema for the preference fields only (these match the unified seeker profile fields)
const preferencesSchema = z.object({
  smokingPreference: z.string().optional(),
  petPreference: z.string().optional(),
  cleanlinessLevel: z.string().optional(),
  socialLevel: z.string().optional(),
  workSchedule: z.string().optional(),
  agePreferenceMin: z.union([z.string(), z.number()]).transform(val => {
    if (val === '' || val === null || val === undefined) return undefined;
    return typeof val === 'string' ? (val ? Number(val) : undefined) : val;
  }).optional(),
  agePreferenceMax: z.union([z.string(), z.number()]).transform(val => {
    if (val === '' || val === null || val === undefined) return undefined;
    return typeof val === 'string' ? (val ? Number(val) : undefined) : val;
  }).optional(),
  genderPreference: z.string().optional(),
});
type PreferencesFormData = z.infer<typeof preferencesSchema>;

export default function Profile() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("profile");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: t('errors.unauthorized'),
        description: t('errors.unauthorized_description'),
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/giris?next=/profil");
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast, setLocation]);

  const { data: mySeekerProfile, isLoading: preferencesLoading } = useQuery({
    queryKey: ['/api/seekers/user', user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

  const { data: myListings, isLoading: listingsLoading } = useQuery({
    queryKey: ['/api/my-listings'],
    enabled: isAuthenticated,
  });

  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: isAuthenticated,
  });

  const preferencesForm = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      smokingPreference: '',
      petPreference: '',
      cleanlinessLevel: '',
      socialLevel: '',
      workSchedule: '',
      agePreferenceMin: undefined,
      agePreferenceMax: undefined,
      genderPreference: '',
    },
  });

  // Update form when seeker profile is loaded
  useEffect(() => {
    if (mySeekerProfile) {
      preferencesForm.reset({
        smokingPreference: mySeekerProfile.smokingPreference || '',
        petPreference: mySeekerProfile.petPreference || '',
        cleanlinessLevel: mySeekerProfile.cleanlinessLevel || '',
        socialLevel: mySeekerProfile.socialLevel || '',
        workSchedule: mySeekerProfile.workSchedule || '',
        agePreferenceMin: mySeekerProfile.agePreferenceMin,
        agePreferenceMax: mySeekerProfile.agePreferenceMax,
        genderPreference: mySeekerProfile.genderPreference || '',
      });
    }
  }, [mySeekerProfile, preferencesForm]);

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: PreferencesFormData) => {
      // Update seeker profile instead of separate preferences
      if (mySeekerProfile?.id) {
        const response = await apiRequest('PUT', `/api/seekers/${mySeekerProfile.id}`, data);
        return response.json();
      } else {
        // If no seeker profile exists, redirect to create one
        toast({
          title: "Profil Bulunamadı",
          description: "Lütfen önce bir oda arama profili oluşturun",
          variant: "destructive"
        });
        setTimeout(() => setLocation('/oda-arama-ilani-olustur'), 1000);
        throw new Error('No seeker profile');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seekers/user', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/seekers'] });
      toast({
        title: "Başarılı!",
        description: "Tercihleriniz güncellendi"
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t('errors.unauthorized'),
          description: t('errors.unauthorized_description'),
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation("/giris?next=/profil");
        }, 500);
        return;
      }
      if (error.message !== 'No seeker profile') {
        toast({
          title: t('errors.server_error'),
          description: 'Tercihler güncellenemedi',
          variant: "destructive"
        });
      }
    }
  });

  const onPreferencesSubmit = (data: PreferencesFormData) => {
    updatePreferencesMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="profile-loading">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="profile-page">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="page-title">
            {t('profile.title')}
          </h1>
          <p className="text-muted-foreground" data-testid="page-subtitle">
            Hesabınızı ve tercihlerinizi yönetin
          </p>
        </div>

        {/* Quick Action Buttons */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => setLocation('/ilan-olustur')}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-auto py-6"
                data-testid="button-create-listing"
              >
                <div className="flex flex-col items-center gap-2">
                  <Home className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Oda İlanı Ver</div>
                    <div className="text-sm opacity-90">Kiralık odanızı ilan edin</div>
                  </div>
                </div>
              </Button>
              <Button
                onClick={() => setLocation('/oda-arama-ilani-olustur')}
                variant="outline"
                className="w-full h-auto py-6 border-2"
                data-testid="button-create-seeker"
              >
                <div className="flex flex-col items-center gap-2">
                  <User className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Oda Arama İlanı Ver</div>
                    <div className="text-sm opacity-90">Oda arama profilinizi oluşturun</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="h-4 w-4 mr-2" />
              {t('profile.personal_info')}
            </TabsTrigger>
            <TabsTrigger value="preferences" data-testid="tab-preferences">
              <Settings className="h-4 w-4 mr-2" />
              {t('profile.preferences')}
            </TabsTrigger>
            <TabsTrigger value="listings" data-testid="tab-listings">
              <Home className="h-4 w-4 mr-2" />
              {t('profile.my_listings')}
            </TabsTrigger>
            <TabsTrigger value="favorites" data-testid="tab-favorites">
              <Heart className="h-4 w-4 mr-2" />
              {t('profile.favorites')}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>{t('profile.personal_info')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4" data-testid="profile-avatar">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="text-lg">
                        {user?.firstName?.[0] || 'U'}
                        {user?.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    
                    <h3 className="text-xl font-semibold" data-testid="profile-name">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-muted-foreground" data-testid="profile-email">
                      {user?.email}
                    </p>
                    
                    {user?.verificationStatus === 'verified' && (
                      <Badge className="mt-2 bg-secondary text-secondary-foreground" data-testid="verification-badge">
                        <Shield className="h-3 w-3 mr-1" />
                        {t('features.verified_profiles.title')}
                      </Badge>
                    )}
                  </div>
                  
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Hesap Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Hesap bilgileriniz güvenli kimlik doğrulama sistemimiz tarafından yönetilmektedir.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ad</label>
                      <p className="text-foreground">{user?.firstName || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Soyad</label>
                      <p className="text-foreground">{user?.lastName || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">E-posta</label>
                      <p className="text-foreground">{user?.email || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Doğrulama Durumu</label>
                      <p className="text-foreground">{user?.verificationStatus === 'verified' ? 'Doğrulandı' : 'Doğrulanmadı'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.preferences')}</CardTitle>
                <p className="text-muted-foreground">
                  Uyumlu ev arkadaşları ile eşleşmenize yardımcı olmak için tercihlerinizi belirleyin
                </p>
              </CardHeader>
              <CardContent>
                {preferencesLoading ? (
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                ) : !mySeekerProfile ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">
                      Tercihlerinizi kaydetmek için önce bir oda arama profili oluşturmanız gerekiyor.
                    </p>
                    <Button onClick={() => setLocation('/oda-arama-ilani-olustur')}>
                      Oda Arama Profili Oluştur
                    </Button>
                  </div>
                ) : (
                  <Form {...preferencesForm}>
                    <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={preferencesForm.control}
                          name="smokingPreference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('profile.smoking')}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-smoking-preference">
                                    <SelectValue placeholder={t('common.select_preference')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="non-smoker">{t('options.smoking.non-smoker')}</SelectItem>
                                  <SelectItem value="smoker">{t('options.smoking.smoker')}</SelectItem>
                                  <SelectItem value="social-smoker">{t('options.smoking.social-smoker')}</SelectItem>
                                  <SelectItem value="no-preference">{t('options.smoking.no-preference')}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={preferencesForm.control}
                          name="petPreference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('profile.pets')}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-pet-preference">
                                    <SelectValue placeholder={t('common.select_preference')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="no-pets">{t('options.pets.no-pets')}</SelectItem>
                                  <SelectItem value="cat-friendly">{t('options.pets.cat-friendly')}</SelectItem>
                                  <SelectItem value="dog-friendly">{t('options.pets.dog-friendly')}</SelectItem>
                                  <SelectItem value="all-pets">{t('options.pets.all-pets')}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={preferencesForm.control}
                          name="cleanlinessLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('profile.cleanliness')}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-cleanliness-level">
                                    <SelectValue placeholder={t('common.select_level')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="very-clean">{t('options.cleanliness.very-clean')}</SelectItem>
                                  <SelectItem value="clean">{t('options.cleanliness.clean')}</SelectItem>
                                  <SelectItem value="average">{t('options.cleanliness.average')}</SelectItem>
                                  <SelectItem value="relaxed">{t('options.cleanliness.relaxed')}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={preferencesForm.control}
                          name="socialLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('profile.social_level')}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-social-level">
                                    <SelectValue placeholder={t('common.select_level')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="very-social">{t('options.social_level.very-social')}</SelectItem>
                                  <SelectItem value="social">{t('options.social_level.social')}</SelectItem>
                                  <SelectItem value="balanced">{t('options.social_level.balanced')}</SelectItem>
                                  <SelectItem value="quiet">{t('options.social_level.quiet')}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={preferencesForm.control}
                          name="workSchedule"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('profile.work_schedule')}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-work-schedule">
                                    <SelectValue placeholder={t('common.select_schedule')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="9-to-5">{t('options.work_schedule.9-to-5')}</SelectItem>
                                  <SelectItem value="shift-work">{t('options.work_schedule.shift-work')}</SelectItem>
                                  <SelectItem value="student">{t('options.work_schedule.student')}</SelectItem>
                                  <SelectItem value="work-from-home">{t('options.work_schedule.work-from-home')}</SelectItem>
                                  <SelectItem value="unemployed">{t('options.work_schedule.unemployed')}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={preferencesForm.control}
                          name="genderPreference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('profile.gender_preference')}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-gender-preference">
                                    <SelectValue placeholder={t('common.select_preference')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">{t('options.gender_preference.male')}</SelectItem>
                                  <SelectItem value="female">{t('options.gender_preference.female')}</SelectItem>
                                  <SelectItem value="no-preference">{t('options.gender_preference.no-preference')}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={preferencesForm.control}
                          name="agePreferenceMin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('create_listing.age_range')} (Min)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  placeholder="18"
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                  data-testid="input-age-min"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={preferencesForm.control}
                          name="agePreferenceMax"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('create_listing.age_range')} (Max)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  placeholder="50"
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                  data-testid="input-age-max"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={updatePreferencesMutation.isPending}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          data-testid="save-preferences-button"
                        >
                          {updatePreferencesMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {t('common.loading')}
                            </>
                          ) : (
                            t('profile.save_changes')
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Listings Tab */}
          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.my_listings')}</CardTitle>
                <p className="text-muted-foreground">
                  Oda ilanlarınızı ve oda arama ilanınızı yönetin
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Room Listings Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Oda İlanlarım</h3>
                  {listingsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="border rounded-lg overflow-hidden">
                          <Skeleton className="w-full h-48" />
                          <div className="p-4">
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : myListings?.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Henüz oda ilanınız yok</h3>
                      <p className="text-muted-foreground mb-4">
                        Kiralık odanızı ilan edin ve uygun ev arkadaşları bulun
                      </p>
                      <Button onClick={() => setLocation('/ilan-olustur')}>
                        Oda İlanı Ver
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="my-listings-grid">
                      {myListings?.map((listing: any) => (
                        <div 
                          key={listing.id} 
                          className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setLocation(`/oda-ilani/${listing.id}`)}
                        >
                          <div className="relative">
                            <img
                              src={listing.images?.find((img: any) => img.isPrimary)?.imagePath || listing.images?.[0]?.imagePath || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250'}
                              alt={listing.title}
                              className="w-full h-32 object-cover"
                            />
                            <Badge 
                              className={`absolute top-2 right-2 ${listing.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}
                            >
                              {listing.status === 'active' ? 'Aktif' : 'Pasif'}
                            </Badge>
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold mb-1">{listing.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{listing.address}</p>
                            <p className="text-lg font-bold text-primary">₺{Math.round(Number(listing.rentAmount))}/ay</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Seeker Profile Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Oda Arama İlanım</h3>
                  {preferencesLoading ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Skeleton className="w-full h-48" />
                      <div className="p-4">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ) : !mySeekerProfile ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Henüz oda arama ilanınız yok</h3>
                      <p className="text-muted-foreground mb-4">
                        Oda arama profilinizi oluşturun ve size uygun odaları bulun
                      </p>
                      <Button onClick={() => setLocation('/oda-arama-ilani-olustur')}>
                        Oda Arama İlanı Ver
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setLocation(`/oda-arayan/${mySeekerProfile.id}`)}
                    >
                      <div className="relative">
                        <img
                          src={mySeekerProfile.profilePhotoUrl || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400'}
                          alt={mySeekerProfile.fullName}
                          className="w-full h-48 object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-purple-500">
                          Oda Arayan
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold mb-2">{mySeekerProfile.fullName}</h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>{mySeekerProfile.age} yaş • {mySeekerProfile.gender === 'male' ? 'Erkek' : mySeekerProfile.gender === 'female' ? 'Kadın' : 'Belirtilmemiş'}</p>
                          <p className="text-primary font-semibold">₺{mySeekerProfile.budgetMonthly}/ay bütçe</p>
                          <p>{mySeekerProfile.preferredLocation}</p>
                        </div>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {mySeekerProfile.cleanlinessLevel && (
                            <Badge variant="outline" className="text-xs">
                              {mySeekerProfile.cleanlinessLevel === 'very-clean' ? 'Çok Temiz' : 
                               mySeekerProfile.cleanlinessLevel === 'clean' ? 'Temiz' : 
                               mySeekerProfile.cleanlinessLevel === 'average' ? 'Orta' : 'Rahat'}
                            </Badge>
                          )}
                          {mySeekerProfile.smokingPreference && (
                            <Badge variant="outline" className="text-xs">
                              {mySeekerProfile.smokingPreference === 'non-smoker' ? 'Sigara İçmiyor' : 
                               mySeekerProfile.smokingPreference === 'smoker' ? 'Sigara İçiyor' : 'Sosyal İçici'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.favorites')}</CardTitle>
                <p className="text-muted-foreground">
                  Kaydettiğiniz oda ilanları
                </p>
              </CardHeader>
              <CardContent>
                {favoritesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border rounded-lg overflow-hidden">
                        <Skeleton className="w-full h-48" />
                        <div className="p-4">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : favorites?.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Henüz favori eklemediniz</h3>
                    <p className="text-muted-foreground mb-4">
                      İlgilendiğiniz ilanları göz atmaya başlayın ve kaydedin.
                    </p>
                    <Button onClick={() => setLocation('/oda-ilanlari')}>
                      {t('nav.browse_rooms')}
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="favorites-grid">
                    {favorites?.map((favorite: any) => (
                      <div 
                        key={favorite.id} 
                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setLocation(`/oda-ilani/${favorite.listing.id}`)}
                      >
                        <div className="relative">
                          <img
                            src={favorite.listing.images?.find((img: any) => img.isPrimary)?.imagePath || favorite.listing.images?.[0]?.imagePath || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250'}
                            alt={favorite.listing.title}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold mb-1">{favorite.listing.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{favorite.listing.address}</p>
                          <p className="text-lg font-bold text-primary">₺{Math.round(Number(favorite.listing.rentAmount))}/ay</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
