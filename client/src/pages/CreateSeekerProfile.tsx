import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

const createSeekerSchema = z.object({
  fullName: z.string().min(3, 'Lütfen adınızı ve soyadınızı giriniz'),
  age: z.coerce.number().int().positive('Yaş 0\'dan büyük olmalıdır').max(120, 'Lütfen geçerli bir yaş giriniz'),
  gender: z.string().min(1, 'Lütfen cinsiyetinizi seçiniz'),
  occupation: z.string().min(1, 'Lütfen durumunuzu seçiniz'),
  budgetMonthly: z.coerce.number().positive('Bütçe 0\'dan büyük olmalıdır'),
  about: z.string().min(10, 'Lütfen kendiniz hakkında bilgi veriniz (en az 10 karakter)'),
  preferredLocation: z.string().min(3, 'Lütfen tercih ettiğiniz lokasyonu giriniz'),
});

type CreateSeekerFormData = z.infer<typeof createSeekerSchema>;

export default function CreateSeekerProfile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateSeekerFormData>({
    resolver: zodResolver(createSeekerSchema),
    defaultValues: {
      fullName: '',
      age: 0,
      gender: '',
      occupation: '',
      budgetMonthly: 0,
      about: '',
      preferredLocation: '',
    },
  });

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
      const response = await apiRequest('POST', '/api/seekers', {
        userId: user?.id,
        fullName: data.fullName,
        age: data.age,
        gender: data.gender,
        occupation: data.occupation,
        budgetMonthly: data.budgetMonthly,
        about: data.about,
        preferredLocation: data.preferredLocation,
      });
      return response.json();
    },
    onSuccess: async (seeker) => {
      // Upload profile photo if provided
      if (profilePhoto) {
        try {
          const formData = new FormData();
          formData.append('images', profilePhoto);
          
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
      
      toast({
        title: 'Başarılı!',
        description: 'Profil başarıyla oluşturuldu.'
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
            Oda Arama İlanı Oluştur
          </h1>
          <p className="text-muted-foreground">
            Profilinizi oluşturun ve mükemmel odayı bulun
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
                          placeholder="25" 
                          {...field} 
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
                            placeholder="5000" 
                            className="pl-8"
                            {...field} 
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
                <FormField
                  control={form.control}
                  name="preferredLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>8. Hangi lokasyonda oda/ev arıyorsunuz? *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="örn., Kadıköy, İstanbul" 
                          {...field} 
                          data-testid="input-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
