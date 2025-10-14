import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, Upload } from "lucide-react";
import { z } from "zod";
import LocationSelect from "@/components/ui/LocationSelect";

const createSeekerSchema = z.object({
  fullName: z.string().min(3, 'Lütfen adınızı ve soyadınızı giriniz'),
  age: z.coerce.number().int().positive('Yaş 0\'dan büyük olmalıdır').max(120, 'Lütfen geçerli bir yaş giriniz'),
  gender: z.string().min(1, 'Lütfen cinsiyetinizi seçiniz'),
  occupation: z.string().min(1, 'Lütfen durumunuzu seçiniz'),
  budgetMonthly: z.coerce.number().positive('Bütçe 0\'dan büyük olmalıdır'),
  about: z.string().min(10, 'Lütfen kendiniz hakkında bilgi veriniz (en az 10 karakter)'),
  city: z.string().min(1, 'Lütfen şehir seçiniz'),
  citySlug: z.string().min(1, 'Şehir slug gerekli'),
  district: z.string().min(1, 'Lütfen ilçe seçiniz'),
  districtSlug: z.string().min(1, 'İlçe slug gerekli'),
  neighborhood: z.string().optional(),
  neighborhoodSlug: z.string().optional(),
  preferredLocation: z.string().optional(),
  // Preference fields
  smokingPreference: z.string().optional(),
  petPreference: z.string().optional(),
  cleanlinessLevel: z.string().optional(),
  socialLevel: z.string().optional(),
  workSchedule: z.string().optional(),
  agePreferenceMin: z.coerce.number().optional(),
  agePreferenceMax: z.coerce.number().optional(),
  genderPreference: z.string().optional(),
});

type CreateSeekerFormData = z.infer<typeof createSeekerSchema>;

export default function CreateSeekerProfile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing seeker profile for editing
  const { data: existingProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/seekers/user', user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

  const isEditMode = !!existingProfile;

  const form = useForm<CreateSeekerFormData>({
    resolver: zodResolver(createSeekerSchema),
    defaultValues: {
      fullName: '',
      age: 0,
      gender: '',
      occupation: '',
      budgetMonthly: 0,
      about: '',
      city: '',
      citySlug: '',
      district: '',
      districtSlug: '',
      neighborhood: '',
      neighborhoodSlug: '',
      preferredLocation: '',
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

  // Pre-populate form with existing data when editing
  useEffect(() => {
    if (existingProfile) {
      form.reset({
        fullName: (existingProfile as any).fullName || '',
        age: (existingProfile as any).age || 0,
        gender: (existingProfile as any).gender || '',
        occupation: (existingProfile as any).occupation || '',
        budgetMonthly: (existingProfile as any).budgetMonthly ? parseFloat((existingProfile as any).budgetMonthly) : 0,
        about: (existingProfile as any).about || '',
        city: (existingProfile as any).city || '',
        citySlug: (existingProfile as any).citySlug || '',
        district: (existingProfile as any).district || '',
        districtSlug: (existingProfile as any).districtSlug || '',
        neighborhood: (existingProfile as any).neighborhood || '',
        neighborhoodSlug: (existingProfile as any).neighborhoodSlug || '',
        preferredLocation: (existingProfile as any).preferredLocation || '',
        smokingPreference: (existingProfile as any).smokingPreference || '',
        petPreference: (existingProfile as any).petPreference || '',
        cleanlinessLevel: (existingProfile as any).cleanlinessLevel || '',
        socialLevel: (existingProfile as any).socialLevel || '',
        workSchedule: (existingProfile as any).workSchedule || '',
        agePreferenceMin: (existingProfile as any).agePreferenceMin,
        agePreferenceMax: (existingProfile as any).agePreferenceMax,
        genderPreference: (existingProfile as any).genderPreference || '',
      });
    }
  }, [existingProfile, form]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: 'Giriş Gerekli',
        description: 'Profil oluşturmak için giriş yapmalısınız',
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation('/giris?next=/oda-arama-ilani-olustur');
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast, setLocation]);

  const createSeekerMutation = useMutation({
    mutationFn: async (data: CreateSeekerFormData) => {
      const payload = {
        userId: user?.id,
        fullName: data.fullName,
        age: data.age,
        gender: data.gender,
        occupation: data.occupation,
        budgetMonthly: data.budgetMonthly.toString(),
        about: data.about,
        city: data.city,
        citySlug: data.citySlug,
        district: data.district,
        districtSlug: data.districtSlug,
        neighborhood: data.neighborhood || '',
        neighborhoodSlug: data.neighborhoodSlug || '',
        preferredLocation: `${data.neighborhood || data.district}, ${data.city}`,
        // Include all preference fields
        smokingPreference: data.smokingPreference || null,
        petPreference: data.petPreference || null,
        cleanlinessLevel: data.cleanlinessLevel || null,
        socialLevel: data.socialLevel || null,
        workSchedule: data.workSchedule || null,
        agePreferenceMin: data.agePreferenceMin || null,
        agePreferenceMax: data.agePreferenceMax || null,
        genderPreference: data.genderPreference || null,
      };

      // Use PUT for editing, POST for creating
      const method = isEditMode ? 'PUT' : 'POST';
      const endpoint = isEditMode ? `/api/seekers/${(existingProfile as any).id}` : '/api/seekers';
      const response = await apiRequest(method, endpoint, payload);
      return response.json();
    },
    onSuccess: async (seeker) => {
      // Upload profile photo if provided
      if (profilePhoto) {
        try {
          const formData = new FormData();
          formData.append('photos', profilePhoto); // Changed from 'images' to 'photos' to match the backend route
          
          await fetch(`/api/seekers/${seeker.id}/photos`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });
        } catch (error) {
          console.error('Error uploading photo:', error);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['/api/seekers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seekers/public'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seekers/user', user?.id] });
      
      toast({
        title: 'Başarılı!',
        description: isEditMode ? 'Profil başarıyla güncellendi.' : 'Profil başarıyla oluşturuldu.'
      });
      
      setLocation('/profil');
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: 'Bir hata oluştu, lütfen tekrar deneyiniz.',
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (data: CreateSeekerFormData) => {
    setIsSubmitting(true);
    try {
      await createSeekerMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isValidType = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (isValidType && isValidSize) {
        setProfilePhoto(file);
      } else {
        toast({
          title: 'Uyarı',
          description: 'Sadece PNG, JPG, WebP formatları ve 5MB altı kabul edilir.',
          variant: "destructive"
        });
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isEditMode ? 'Oda Arama İlanımı Düzenle' : 'Oda Arama İlanı Oluştur'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Profil bilgilerinizi güncelleyin' : 'Profilinizi oluşturun ve mükemmel odayı bulun'}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profil Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 1. Profil fotoğrafınızı yükleyiniz */}
                <FormItem>
                  <FormLabel>1. Profil fotoğrafınızı yükleyiniz</FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <Input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handlePhotoChange}
                        className="cursor-pointer"
                        data-testid="input-photo"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        PNG, JPG, WebP (Max 5MB)
                      </p>
                      {profilePhoto && (
                        <p className="text-sm text-green-600 mt-2">
                          {profilePhoto.name} seçildi
                        </p>
                      )}
                    </div>
                  </FormControl>
                </FormItem>

                {/* 2. Adınız Soyadınız nedir? */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>2. Adınız Soyadınız nedir? *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="örn., Ahmet Yılmaz" 
                          {...field} 
                          data-testid="input-fullname"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 3. Yaşınız kaç? */}
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>3. Yaşınız kaç? *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="18"
                          max="120"
                          placeholder="25"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          data-testid="input-age"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 4. Cinsiyetiniz nedir? */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>4. Cinsiyetiniz nedir? *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-gender">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="kadin">Kadın</SelectItem>
                          <SelectItem value="erkek">Erkek</SelectItem>
                          <SelectItem value="diger">Diğer</SelectItem>
                          <SelectItem value="belirtmek-istemiyorum">Belirtmek İstemiyorum</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 5. Durumunuz nedir? */}
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>5. Durumunuz nedir? *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ogrenci">Öğrenci</SelectItem>
                          <SelectItem value="calisan">Çalışan</SelectItem>
                          <SelectItem value="serbest">Serbest</SelectItem>
                          <SelectItem value="diger">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 6. Aylık kira için bütçeniz ne kadar? */}
                <FormField
                  control={form.control}
                  name="budgetMonthly"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>6. Aylık kira için bütçeniz ne kadar? *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5">₺</span>
                          <Input 
                            type="number"
                            min="0"
                            placeholder="5000" 
                            className="pl-8"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                            data-testid="input-budget"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 7. Kendinizden kısaca bahseder misiniz? */}
                <FormField
                  control={form.control}
                  name="about"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>7. Kendinizden kısaca bahseder misiniz? *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Kendinizden ve odadan beklentilerinizden bahsedin..." 
                          className="min-h-[120px]"
                          {...field} 
                          data-testid="textarea-about"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 8. Hangi lokasyonda oda/ev arıyorsunuz? */}
                <div className="space-y-2">
                  <FormLabel>8. Hangi lokasyonda oda/ev arıyorsunuz? *</FormLabel>
                  <LocationSelect
                    value={{
                      city: form.watch('city') || '',
                      citySlug: form.watch('citySlug') || '',
                      district: form.watch('district') || '',
                      districtSlug: form.watch('districtSlug') || '',
                      neighborhood: form.watch('neighborhood') || '',
                      neighborhoodSlug: form.watch('neighborhoodSlug') || '',
                    }}
                    onChange={(location) => {
                      form.setValue('city', location.city || '');
                      form.setValue('citySlug', location.citySlug || '');
                      form.setValue('district', location.district || '');
                      form.setValue('districtSlug', location.districtSlug || '');
                      form.setValue('neighborhood', location.neighborhood || '');
                      form.setValue('neighborhoodSlug', location.neighborhoodSlug || '');
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preferences Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Tercihleriniz
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sigara Tercihi */}
                  <FormField
                    control={form.control}
                    name="smokingPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sigara</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-smoking">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="non-smoker">İçmiyor</SelectItem>
                            <SelectItem value="smoker">İçiyor</SelectItem>
                            <SelectItem value="social-smoker">Sosyal İçici</SelectItem>
                            <SelectItem value="no-preference">Farketmez</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Evcil Hayvan Tercihi */}
                  <FormField
                    control={form.control}
                    name="petPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evcil Hayvan</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-pet">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no-pets">Hayır</SelectItem>
                            <SelectItem value="cat-friendly">Kedi Seviyorum</SelectItem>
                            <SelectItem value="dog-friendly">Köpek Seviyorum</SelectItem>
                            <SelectItem value="all-pets">Hepsini Seviyorum</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Temizlik Seviyesi */}
                  <FormField
                    control={form.control}
                    name="cleanlinessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temizlik Seviyesi</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-cleanliness">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="very-clean">Çok Temiz</SelectItem>
                            <SelectItem value="clean">Temiz</SelectItem>
                            <SelectItem value="average">Orta</SelectItem>
                            <SelectItem value="relaxed">Rahat</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Sosyallik Seviyesi */}
                  <FormField
                    control={form.control}
                    name="socialLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sosyallik</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-social">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="very-social">Çok Sosyal</SelectItem>
                            <SelectItem value="social">Sosyal</SelectItem>
                            <SelectItem value="balanced">Dengeli</SelectItem>
                            <SelectItem value="quiet">Sakin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Çalışma Saatleri */}
                  <FormField
                    control={form.control}
                    name="workSchedule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Çalışma Saatleri</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-work">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="9-to-5">9-5 Mesai</SelectItem>
                            <SelectItem value="shift-work">Vardiyalı</SelectItem>
                            <SelectItem value="student">Öğrenci</SelectItem>
                            <SelectItem value="work-from-home">Evden Çalışma</SelectItem>
                            <SelectItem value="unemployed">İşsiz</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cinsiyet Tercihi */}
                  <FormField
                    control={form.control}
                    name="genderPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ev Arkadaşı Cinsiyet Tercihi</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-gender-pref">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Erkek</SelectItem>
                            <SelectItem value="female">Kadın</SelectItem>
                            <SelectItem value="no-preference">Farketmez</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Yaş Aralığı Min */}
                  <FormField
                    control={form.control}
                    name="agePreferenceMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yaş Aralığı (Min)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="18"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            data-testid="input-age-pref-min"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Yaş Aralığı Max */}
                  <FormField
                    control={form.control}
                    name="agePreferenceMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yaş Aralığı (Max)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="50"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            data-testid="input-age-pref-max"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation('/profil')}
                data-testid="button-cancel"
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || createSeekerMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-submit"
              >
                {isSubmitting || createSeekerMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Profil Oluşturuluyor...
                  </>
                ) : (
                  'Profil Oluştur'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </main>
      
      <Footer />
    </div>
  );
}
