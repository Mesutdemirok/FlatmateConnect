import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Home, Upload } from "lucide-react";
import { z } from "zod";

const createListingSchema = z.object({
  address: z.string().min(5, 'Lütfen geçerli bir adres giriniz'),
  title: z.string().min(10, 'Başlık en az 10 karakter olmalıdır'),
  rentAmount: z.coerce.number().positive('Kira tutarı 0\'dan büyük olmalıdır'),
  billsIncluded: z.enum(['yes', 'no']),
  propertyType: z.string().min(1, 'Lütfen konut tipini seçiniz'),
  internetIncluded: z.enum(['yes', 'no']),
  totalRooms: z.coerce.number().int().positive('Oda sayısı 0\'dan büyük olmalıdır'),
  bathroomType: z.string().min(1, 'Lütfen banyo tipini seçiniz'),
  furnishingStatus: z.string().min(1, 'Lütfen eşya durumunu seçiniz'),
  amenities: z.array(z.string()).default([]),
  totalOccupants: z.coerce.number().int().positive('Kişi sayısı 0\'dan büyük olmalıdır'),
  roommatePreference: z.string().min(1, 'Lütfen ev arkadaşı tercihinizi seçiniz'),
  smokingPolicy: z.string().min(1, 'Lütfen sigara politikasını seçiniz'),
});

type CreateListingFormData = z.infer<typeof createListingSchema>;

export default function CreateListing() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      address: '',
      title: '',
      rentAmount: 0,
      billsIncluded: 'no',
      propertyType: '',
      internetIncluded: 'no',
      totalRooms: 0,
      bathroomType: '',
      furnishingStatus: '',
      amenities: [],
      totalOccupants: 0,
      roommatePreference: '',
      smokingPolicy: '',
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: 'Giriş Gerekli',
        description: 'İlan oluşturmak için giriş yapmalısınız',
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation(`/giris?next=${encodeURIComponent('/ilan-olustur')}`);
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast, setLocation]);

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateListingFormData) => {
      const response = await apiRequest('POST', '/api/listings', {
        userId: user?.id,
        address: data.address,
        title: data.title,
        rentAmount: data.rentAmount,
        billsIncluded: data.billsIncluded === 'yes',
        propertyType: data.propertyType,
        internetIncluded: data.internetIncluded === 'yes',
        totalRooms: data.totalRooms,
        bathroomType: data.bathroomType,
        furnishingStatus: data.furnishingStatus,
        amenities: data.amenities,
        totalOccupants: data.totalOccupants,
        roommatePreference: data.roommatePreference,
        smokingPolicy: data.smokingPolicy,
      });
      return response.json();
    },
    onSuccess: async (listing) => {
      // Upload images if any
      if (images.length > 0) {
        try {
          const formData = new FormData();
          images.forEach(image => {
            formData.append('images', image);
          });
          
          await fetch(`/api/listings/${listing.id}/images`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });
        } catch (error) {
          console.error('Error uploading images:', error);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      
      toast({
        title: 'Başarılı!',
        description: 'İlan başarıyla oluşturuldu.'
      });
      
      setLocation(`/oda-ilani/${listing.id}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: 'Giriş Gerekli',
          description: 'İlan oluşturmak için giriş yapmalısınız',
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation(`/giris?next=${encodeURIComponent('/ilan-olustur')}`);
        }, 500);
        return;
      }
      toast({
        title: 'Hata',
        description: 'Bir hata oluştu, lütfen tekrar deneyiniz.',
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (data: CreateListingFormData) => {
    setIsSubmitting(true);
    try {
      await createListingMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      const validFiles = fileList.filter(file => {
        const isValidType = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        return isValidType && isValidSize;
      });
      setImages(validFiles);
      
      if (validFiles.length < fileList.length) {
        toast({
          title: 'Uyarı',
          description: 'Bazı dosyalar geçersiz. Sadece PNG, JPG, WebP formatları ve 5MB altı kabul edilir.',
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

  const amenityOptions = [
    { id: 'yatak', label: 'Yatak' },
    { id: 'dolap', label: 'Dolap' },
    { id: 'masa', label: 'Masa' },
    { id: 'sandalye', label: 'Sandalye' },
    { id: 'klima', label: 'Klima' },
    { id: 'tv', label: 'TV' },
    { id: 'diger', label: 'Diğer' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Oda İlanı Oluştur
          </h1>
          <p className="text-muted-foreground">
            Ev arkadaşınızı bulmak için ilan verin
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  İlan Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 1. İlan adresiniz nedir? */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>1. İlan adresiniz nedir? *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="örn., Kadıköy, İstanbul" 
                          {...field} 
                          data-testid="input-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 2. İlan başlığınız nedir? */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>2. İlan başlığınız nedir? *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="örn., Kadıköy'de geniş ve aydınlık oda" 
                          {...field} 
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 3. Aylık kira bedeli ne kadar? */}
                <FormField
                  control={form.control}
                  name="rentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>3. Aylık kira bedeli ne kadar? *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5">₺</span>
                          <Input 
                            type="number"
                            placeholder="5000" 
                            className="pl-8"
                            {...field} 
                            data-testid="input-rent"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 4. Fiyata faturalar dahil mi? */}
                <FormField
                  control={form.control}
                  name="billsIncluded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>4. Fiyata faturalar dahil mi? *</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="bills-yes" />
                            <Label htmlFor="bills-yes">Evet</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="bills-no" />
                            <Label htmlFor="bills-no">Hayır</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 5. Konut tipi nedir? */}
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>5. Konut tipi nedir? *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-property-type">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rezidans">Rezidans</SelectItem>
                          <SelectItem value="apartman">Apartman</SelectItem>
                          <SelectItem value="daire">Daire</SelectItem>
                          <SelectItem value="mustakil">Müstakil Ev</SelectItem>
                          <SelectItem value="diger">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 6. Evde internet mevcut mu? */}
                <FormField
                  control={form.control}
                  name="internetIncluded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>6. Evde internet mevcut mu? *</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="internet-yes" />
                            <Label htmlFor="internet-yes">Evet</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="internet-no" />
                            <Label htmlFor="internet-no">Hayır</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 7. Evde toplam kaç oda var? */}
                <FormField
                  control={form.control}
                  name="totalRooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>7. Evde toplam kaç oda var? *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-rooms">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 8. Banyo durumu nedir? */}
                <FormField
                  control={form.control}
                  name="bathroomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>8. Banyo durumu nedir? *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-bathroom">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ortak">Ortak</SelectItem>
                          <SelectItem value="ozel">Özel</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 9. Evin eşya durumu nedir? */}
                <FormField
                  control={form.control}
                  name="furnishingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>9. Evin eşya durumu nedir? *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-furnishing">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="esyali">Eşyalı</SelectItem>
                          <SelectItem value="esyasiz">Eşyasız</SelectItem>
                          <SelectItem value="kismen">Kısmen Eşyalı</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 10. Odada hangi eşyalar mevcut? */}
                <FormField
                  control={form.control}
                  name="amenities"
                  render={() => (
                    <FormItem>
                      <FormLabel>10. Odada hangi eşyalar mevcut?</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {amenityOptions.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="amenities"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 11. Evde toplam kaç kişi yaşamaktadır? */}
                <FormField
                  control={form.control}
                  name="totalOccupants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>11. Evde toplam kaç kişi yaşamaktadır? *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="2" 
                          {...field} 
                          data-testid="input-occupants"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 12. Ev arkadaşı tercihiniz nedir? */}
                <FormField
                  control={form.control}
                  name="roommatePreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>12. Ev arkadaşı tercihiniz nedir? *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-roommate">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="kadin">Kadın</SelectItem>
                          <SelectItem value="erkek">Erkek</SelectItem>
                          <SelectItem value="farketmez">Farketmez</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 13. Evde sigara politikası nedir? */}
                <FormField
                  control={form.control}
                  name="smokingPolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>13. Evde sigara politikası nedir? *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-smoking">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="icilebilir">İçilebilir</SelectItem>
                          <SelectItem value="icilemez">İçilemez</SelectItem>
                          <SelectItem value="balkon-dahil-icilemez">Balkon Dahil İçilemez</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 14. İlan için fotoğraflar yükler misiniz? */}
                <FormItem>
                  <FormLabel>14. İlan için fotoğraflar yükler misiniz?</FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <Input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        multiple
                        onChange={handleImageChange}
                        className="cursor-pointer"
                        data-testid="input-images"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        PNG, JPG, WebP (Max 5MB)
                      </p>
                      {images.length > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          {images.length} fotoğraf seçildi
                        </p>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation('/oda-ilanlari')}
                data-testid="button-cancel"
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || createListingMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-submit"
              >
                {isSubmitting || createListingMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    İlan Oluşturuluyor...
                  </>
                ) : (
                  'İlan Oluştur'
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
