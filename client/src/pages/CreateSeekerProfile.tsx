// ODANET Revizyon – Tek aşamalı oda arayan formu
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SeekerProfileWithRelations } from "@/lib/seekerApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NumberInput from "@/components/forms/NumberInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, Upload, Trash2 } from "lucide-react";
import { z } from "zod";

const createSeekerSchema = z.object({
  fullName: z.string().min(3, 'Lütfen adınızı ve soyadınızı giriniz'),
  age: z.string().min(1, 'Lütfen yaşınızı giriniz'),
  gender: z.string().min(1, 'Lütfen cinsiyetinizi seçiniz'),
  occupation: z.string().min(1, 'Lütfen mesleğinizi giriniz'),
  preferredLocation: z.string().min(3, 'Lütfen tercih ettiğiniz lokasyonu giriniz'),
  about: z.string().min(10, 'Lütfen kendiniz hakkında bilgi veriniz (en az 10 karakter)'),
  // ODANET Revizyon – Yaşam Tarzı
  isSmoker: z.string().optional(),
  hasPets: z.string().optional(),
  // Tercihler
  budgetMonthly: z.string().min(1, 'Lütfen bütçenizi giriniz'),
  smokingPreference: z.string().optional(),
  petPreference: z.string().optional(),
});

type CreateSeekerFormData = z.infer<typeof createSeekerSchema>;

export default function CreateSeekerProfile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [uploadedPhotoPath, setUploadedPhotoPath] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing seeker profile for editing
  const { data: existingProfile, isLoading: profileLoading } = useQuery<SeekerProfileWithRelations>({
    queryKey: ['/api/seekers/user', user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

  const isEditMode = !!existingProfile;

  const form = useForm<CreateSeekerFormData>({
    resolver: zodResolver(createSeekerSchema),
    defaultValues: {
      fullName: '',
      age: '',
      gender: '',
      occupation: '',
      preferredLocation: '',
      about: '',
      budgetMonthly: '',
      smokingPreference: '',
      petPreference: '',
    },
  });

  // Pre-populate form with existing data when editing
  useEffect(() => {
    if (existingProfile) {
      form.reset({
        fullName: existingProfile.fullName || '',
        age: existingProfile.age?.toString() || '',
        gender: existingProfile.gender || '',
        occupation: existingProfile.occupation || '',
        preferredLocation: existingProfile.preferredLocation || '',
        about: existingProfile.about || '',
        budgetMonthly: existingProfile.budgetMonthly || '',
        smokingPreference: existingProfile.smokingPreference || '',
        petPreference: existingProfile.petPreference || '',
      });
      setExistingPhotoUrl(existingProfile.profilePhotoUrl || null);
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
        age: parseInt(data.age),
        gender: data.gender,
        occupation: data.occupation,
        budgetMonthly: data.budgetMonthly,
        about: data.about,
        preferredLocation: data.preferredLocation,
        smokingPreference: data.smokingPreference || 'no-preference',
        petPreference: data.petPreference || 'no-preference',
        cleanlinessLevel: 'average', // Default value
        // Include uploaded photo path if available
        profilePhotoUrl: uploadedPhotoPath || existingPhotoUrl,
      };

      console.log('Submitting seeker profile:', payload);

      try {
        const response = await apiRequest(
          isEditMode ? 'PUT' : 'POST',
          isEditMode ? `/api/seekers/${existingProfile.id}` : '/api/seekers',
          payload
        );

        const result = await response.json();
        console.log('Seeker profile response:', result);
        return result;
      } catch (error: any) {
        console.error('API Request failed:', error);
        // Extract error message from the response
        const errorMessage = error.message || error.toString();
        throw new Error(errorMessage);
      }
    },
    onSuccess: async (result) => {
      // Photo is already uploaded via handlePhotoChange
      // No need to upload again

      // Delete photo if marked for deletion
      if (photoToDelete && existingProfile?.profilePhotoUrl) {
        try {
          await apiRequest('DELETE', `/api/seekers/${existingProfile.id}/photo`);
        } catch (error) {
          console.error('Photo deletion error:', error);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['/api/seekers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seekers/user', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/seekers/public'] });
      
      toast({
        title: 'Başarılı!',
        description: isEditMode ? 'Profil başarıyla güncellendi.' : 'Profil başarıyla oluşturuldu.'
      });
      
      setLocation('/profil');
    },
    onError: (error: any) => {
      console.error('Seeker profile creation error:', error);
      toast({
        title: 'Hata',
        description: error.message || error.toString() || 'Bir hata oluştu, lütfen tekrar deneyiniz.',
        variant: "destructive"
      });
    }
  });

  const deleteSeekerMutation = useMutation({
    mutationFn: async () => {
      if (!existingProfile?.id) {
        throw new Error('Silinecek profil bulunamadı');
      }
      const response = await apiRequest('DELETE', `/api/seekers/${existingProfile.id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seekers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seekers/user', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/seekers/public'] });
      toast({
        title: 'Başarılı',
        description: 'İlanınız başarıyla silindi',
      });
      setLocation('/profil');
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'İlan silinemedi',
        variant: "destructive",
      });
    },
  });

  const handleDeleteSeeker = () => {
    if (window.confirm('Bu oda arama ilanını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      deleteSeekerMutation.mutate();
    }
  };

  const handleDeletePhoto = () => {
    setPhotoToDelete(true);
    setExistingPhotoUrl(null);
    setProfilePhoto(null);
    setUploadedPhotoPath(null);
    setUploadedPhotoUrl(null);
    setPhotoPreviewUrl(null);
    setPhotoError(null);
    toast({
      title: 'Fotoğraf silindi',
      description: 'Yeni bir fotoğraf yükleyebilirsiniz',
    });
  };

  const onSubmit = async (data: CreateSeekerFormData) => {
    setIsSubmitting(true);
    try {
      await createSeekerMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    // Validate file type (JPG, PNG, WEBP)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      const errorMsg = 'Sadece JPG, PNG veya WEBP formatında fotoğraf yükleyebilirsiniz';
      setPhotoError(errorMsg);
      toast({
        title: 'Geçersiz Dosya Formatı',
        description: errorMsg,
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const errorMsg = 'Fotoğraf boyutu en fazla 5MB olabilir';
      setPhotoError(errorMsg);
      toast({
        title: 'Dosya Çok Büyük',
        description: errorMsg,
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreviewUrl(previewUrl);
    setProfilePhoto(file);
    setPhotoToDelete(false);
    setIsUploadingPhoto(true);

    try {
      // Upload to backend immediately
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/uploads/seeker-photo', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      
      // Store the image path and URL
      setUploadedPhotoPath(data.imagePath);
      setUploadedPhotoUrl(data.url);
      
      toast({
        title: 'Başarılı!',
        description: 'Fotoğraf yüklendi ve optimize edildi',
      });
    } catch (error: any) {
      console.error('Photo upload error:', error);
      const errorMsg = error.message || 'Fotoğraf yüklenirken bir hata oluştu';
      setPhotoError(errorMsg);
      toast({
        title: 'Yükleme Hatası',
        description: errorMsg,
        variant: "destructive",
      });
      setProfilePhoto(null);
      setPhotoPreviewUrl(null);
      e.target.value = '';
    } finally {
      setIsUploadingPhoto(false);
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* A. Kişisel Bilgiler */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Kişisel Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profil Fotoğrafı */}
                <FormItem>
                  <FormLabel>Profil Fotoğrafı (İsteğe Bağlı)</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {/* Photo Preview or Upload Area */}
                      {(uploadedPhotoUrl || photoPreviewUrl || existingPhotoUrl) && !photoToDelete ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center">
                            <div className="relative">
                              <img 
                                src={uploadedPhotoUrl || photoPreviewUrl || existingPhotoUrl || ''} 
                                alt="Profil Fotoğrafı" 
                                className="w-32 h-32 object-cover rounded-full border-4 border-green-500 shadow-lg"
                                data-testid="photo-preview"
                              />
                              {isUploadingPhoto && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                                </div>
                              )}
                            </div>
                          </div>
                          {uploadedPhotoUrl && !isUploadingPhoto && (
                            <p className="text-sm text-green-600 text-center font-medium">
                              ✓ Fotoğraf başarıyla yüklendi
                            </p>
                          )}
                          {isUploadingPhoto && (
                            <p className="text-sm text-violet-600 text-center font-medium">
                              Yükleniyor ve optimize ediliyor...
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('photo-input')?.click()}
                              className="flex-1 flex items-center gap-2"
                              disabled={isUploadingPhoto}
                              data-testid="change-photo-button"
                            >
                              <Upload className="h-4 w-4" />
                              Değiştir
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={handleDeletePhoto}
                              className="flex-1 flex items-center gap-2"
                              disabled={isUploadingPhoto}
                              data-testid="delete-photo-button"
                            >
                              <Trash2 className="h-4 w-4" />
                              Sil
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-violet-400 transition-colors">
                          {isUploadingPhoto ? (
                            <div className="space-y-3">
                              <Loader2 className="h-12 w-12 mx-auto text-violet-600 animate-spin" />
                              <p className="text-sm text-violet-600 font-medium">
                                Fotoğraf yükleniyor...
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                                <Upload className="h-8 w-8 text-gray-400" />
                              </div>
                              <div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="lg"
                                  onClick={() => document.getElementById('photo-input')?.click()}
                                  className="font-medium"
                                  data-testid="upload-photo-button"
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Fotoğraf Yükle
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                JPG, PNG veya WEBP (Max 5MB)
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Hidden File Input */}
                      <input
                        id="photo-input"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        capture="environment"
                        onChange={handlePhotoChange}
                        className="hidden"
                        data-testid="input-photo"
                        disabled={isUploadingPhoto}
                      />
                      
                      {/* Error Message */}
                      {photoError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-600 font-medium">
                            {photoError}
                          </p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                </FormItem>

                {/* Ad Soyad */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Soyad *</FormLabel>
                      <FormControl>
                        <Input placeholder="örn., Ahmet Yılmaz" {...field} data-testid="input-fullName" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Yaş */}
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yaş *</FormLabel>
                      <FormControl>
                        <NumberInput 
                          placeholder="örn., 25" 
                          value={field.value}
                          onChange={field.onChange}
                          data-testid="input-age" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cinsiyet */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cinsiyet *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-gender">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Kadın">Kadın</SelectItem>
                          <SelectItem value="Erkek">Erkek</SelectItem>
                          <SelectItem value="Diğer">Diğer</SelectItem>
                          <SelectItem value="Belirtmek İstemiyorum">Belirtmek İstemiyorum</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Meslek */}
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meslek *</FormLabel>
                      <FormControl>
                        <Input placeholder="örn., Öğrenci, Çalışan" {...field} data-testid="input-occupation" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Lokasyon */}
                <FormField
                  control={form.control}
                  name="preferredLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tercih Ettiğiniz Lokasyon *</FormLabel>
                      <FormControl>
                        <Input placeholder="örn., Kadıköy, İstanbul" {...field} data-testid="input-preferredLocation" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hakkımda */}
                <FormField
                  control={form.control}
                  name="about"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kısa Tanım *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Kendinizden bahsedin..."
                          className="min-h-[120px]"
                          {...field}
                          data-testid="input-about"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* B. Yaşam Tarzı */}
            <Card>
              <CardHeader>
                <CardTitle>Yaşam Tarzı</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sigara içiyor musunuz? */}
                <FormField
                  control={form.control}
                  name="isSmoker"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sigara içiyor musunuz?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-isSmoker">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Evet</SelectItem>
                          <SelectItem value="false">Hayır</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Evcil hayvanınız var mı? */}
                <FormField
                  control={form.control}
                  name="hasPets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evcil hayvanınız var mı?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-hasPets">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Evet</SelectItem>
                          <SelectItem value="false">Hayır</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* C. Tercihler */}
            <Card>
              <CardHeader>
                <CardTitle>Tercihleriniz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Bütçe */}
                <FormField
                  control={form.control}
                  name="budgetMonthly"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aylık Bütçeniz (₺) *</FormLabel>
                      <FormControl>
                        <NumberInput 
                          placeholder="örn., 5000" 
                          value={field.value}
                          onChange={field.onChange}
                          data-testid="input-budgetMonthly" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sigara tercihi (oda arkadaşı için) */}
                <FormField
                  control={form.control}
                  name="smokingPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oda Arkadaşınızda Sigara Tercihi</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-smokingPreference">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="İçebilir">İçebilir</SelectItem>
                          <SelectItem value="İçemez">İçemez</SelectItem>
                          <SelectItem value="Farketmez">Farketmez</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Evcil hayvan tercihi (oda arkadaşı için) */}
                <FormField
                  control={form.control}
                  name="petPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oda Arkadaşınızda Evcil Hayvan Tercihi</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-petPreference">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Olabilir">Olabilir</SelectItem>
                          <SelectItem value="Olmamalı">Olmamalı</SelectItem>
                          <SelectItem value="Farketmez">Farketmez</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Butonlar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
                style={{ backgroundColor: "#f97316" }}
                data-testid="button-submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  'Kaydet'
                )}
              </Button>

              {isEditMode && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteSeeker}
                  disabled={deleteSeekerMutation.isPending}
                  data-testid="button-delete-seeker"
                >
                  {deleteSeekerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Siliniyor...
                    </>
                  ) : (
                    'İlanı Sil'
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </main>
      
      <Footer />
    </div>
  );
}
