import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getAuthHeaders } from "@/lib/queryClient";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";
import NumberInput from "@/components/forms/NumberInput";
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
import { Loader2, X, Upload, Star, Home } from "lucide-react";
import { z } from "zod";

const editListingSchema = z.object({
  address: z.string().min(5, 'Lütfen geçerli bir adres giriniz'),
  title: z.string().min(10, 'Başlık en az 10 karakter olmalıdır'),
  rentAmount: z.coerce.number().positive('Kira tutarı 0\'dan büyük olmalıdır'),
  billsIncluded: z.enum(['yes', 'no']),
  excludedBills: z.array(z.string()).optional().default([]),
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

type EditListingFormData = z.infer<typeof editListingSchema>;

export default function EditListing() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch listing
  const { data: listing, isLoading: listingLoading } = useQuery({
    queryKey: ['/api/listings', id],
    queryFn: async () => {
      const res = await fetch(`/api/listings/${id}`);
      if (!res.ok) throw new Error('İlan bulunamadı');
      return res.json();
    },
    enabled: !!id,
  });

  const form = useForm<EditListingFormData>({
    resolver: zodResolver(editListingSchema),
    defaultValues: {
      address: '',
      title: '',
      rentAmount: 0,
      billsIncluded: 'no',
      excludedBills: [],
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

  // Watch billsIncluded field to show/hide excluded bills
  const billsIncluded = form.watch('billsIncluded');

  // Populate form when listing loads
  useEffect(() => {
    if (listing) {
      form.reset({
        address: listing.address || '',
        title: listing.title || '',
        rentAmount: parseFloat(listing.rentAmount) || 0,
        billsIncluded: listing.billsIncluded ? 'yes' : 'no',
        excludedBills: listing.excludedBills || [],
        propertyType: listing.propertyType || '',
        internetIncluded: listing.internetIncluded ? 'yes' : 'no',
        totalRooms: listing.totalRooms || 0,
        bathroomType: listing.bathroomType || '',
        furnishingStatus: listing.furnishingStatus || '',
        amenities: listing.amenities || [],
        totalOccupants: listing.totalOccupants || 0,
        roommatePreference: listing.roommatePreference || '',
        smokingPolicy: listing.smokingPolicy || '',
      });
    }
  }, [listing, form]);

  // Check authorization
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: 'Giriş Gerekli',
        description: 'İlan düzenlemek için giriş yapmalısınız',
        variant: "destructive",
      });
      setLocation(`/giris?next=${encodeURIComponent(`/ilan-duzenle/${id}`)}`);
    } else if (listing && user && listing.userId !== user.id) {
      toast({
        title: 'Yetki Hatası',
        description: 'Bu ilanı düzenleme yetkiniz yok',
        variant: "destructive",
      });
      setLocation(`/oda-ilani/${id}`);
    }
  }, [isAuthenticated, authLoading, listing, user, id, toast, setLocation]);

  const updateListingMutation = useMutation({
    mutationFn: async (data: EditListingFormData) => {
      const response = await apiRequest('PUT', `/api/listings/${id}`, {
        address: data.address,
        title: data.title,
        rentAmount: data.rentAmount.toString(),
        billsIncluded: data.billsIncluded === 'yes',
        excludedBills: data.excludedBills || [],
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
    onSuccess: async () => {
      // Upload new images if any
      if (newImages.length > 0) {
        try {
          setIsUploading(true);
          const formData = new FormData();
          newImages.forEach(image => formData.append('images', image));
          
          const imageResponse = await fetch(`/api/uploads/listings/${id}/images`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
            credentials: 'include',
          });

          if (!imageResponse.ok) {
            const errorData = await imageResponse.json();
            console.error('Image upload failed:', errorData);
            toast({
              title: 'Resim Yükleme Hatası',
              description: 'Yeni resimler yüklenemedi.',
              variant: "destructive"
            });
          } else {
            console.log('✅ New images uploaded successfully');
            toast({
              title: 'Başarılı',
              description: 'Resimler başarıyla yüklendi.'
            });
          }
        } catch (error) {
          console.error('Image upload error:', error);
          toast({
            title: 'Resim Yükleme Hatası',
            description: 'Yeni resimler yüklenemedi.',
            variant: "destructive"
          });
        } finally {
          setIsUploading(false);
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/listings', id] });
      
      toast({
        title: 'Başarılı',
        description: 'İlan güncellendi',
      });
      
      setLocation(`/oda-ilani/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'İlan güncellenemedi',
        variant: "destructive",
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      await apiRequest('DELETE', `/api/listings/${id}/images/${imageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings', id] });
      toast({ title: 'Fotoğraf silindi' });
    },
  });

  const setPrimaryImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      await apiRequest('PUT', `/api/listings/${id}/images/${imageId}/primary`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings', id] });
      toast({ title: 'Ana fotoğraf ayarlandı' });
    },
  });

  const deleteListingMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/listings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      toast({
        title: 'Başarılı',
        description: 'İlan silindi',
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

  const handleDeleteListing = () => {
    if (window.confirm('Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      deleteListingMutation.mutate();
    }
  };

  const onSubmit = (data: EditListingFormData) => {
    updateListingMutation.mutate(data);
  };

  if (authLoading || listingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>İlanı Düzenle</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* 1. Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>1. İlan adresiniz nedir? *</FormLabel>
                      <FormControl>
                        <Input placeholder="örn., Kadıköy, İstanbul" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 2. Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>2. İlan başlığınız nedir? *</FormLabel>
                      <FormControl>
                        <Input placeholder="örn., Kadıköy'de geniş ve aydınlık oda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 3. Rent Amount */}
                <FormField
                  control={form.control}
                  name="rentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>3. Aylık kira bedeli ne kadar? *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5">₺</span>
                          <NumberInput 
                            placeholder="5000" 
                            className="pl-8"
                            value={field.value?.toString() || ''}
                            onChange={(val) => field.onChange(parseFloat(val) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 4. Bills Included */}
                <FormField
                  control={form.control}
                  name="billsIncluded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>4. Fiyata faturalar dahil mi? *</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value}>
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

                {/* 4b. Excluded Bills (conditional) */}
                {billsIncluded === 'no' && (
                  <FormField
                    control={form.control}
                    name="excludedBills"
                    render={() => (
                      <FormItem>
                        <div className="mb-3">
                          <FormLabel className="text-base">Hangi faturalar dahil değil?</FormLabel>
                          <FormDescription>Dahil olmayan faturaları işaretleyin</FormDescription>
                        </div>
                        <div className="space-y-3">
                          {['Su', 'Elektrik', 'Telefon', 'Doğalgaz', 'İnternet'].map((bill) => (
                            <FormField
                              key={bill}
                              control={form.control}
                              name="excludedBills"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={bill}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(bill)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, bill])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== bill
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {bill}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* 5. Property Type */}
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>5. Konut tipi nedir? *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rezidans">Rezidans</SelectItem>
                          <SelectItem value="daire">Daire</SelectItem>
                          <SelectItem value="mustakil">Müstakil Ev</SelectItem>
                          <SelectItem value="diger">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 6. Internet Included */}
                <FormField
                  control={form.control}
                  name="internetIncluded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>6. Evde internet mevcut mu? *</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value}>
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

                {/* 7. Total Rooms */}
                <FormField
                  control={form.control}
                  name="totalRooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>7. Evde toplam kaç oda var? *</FormLabel>
                      <FormControl>
                        <NumberInput
                          placeholder="örn., 3"
                          value={field.value?.toString() || ''}
                          onChange={(val) => field.onChange(parseInt(val) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 8. Bathroom Type */}
                <FormField
                  control={form.control}
                  name="bathroomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>8. Banyo durumu nedir? *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
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

                {/* 9. Furnishing Status */}
                <FormField
                  control={form.control}
                  name="furnishingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>9. Evin eşya durumu nedir? *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Eşyalı">Eşyalı</SelectItem>
                          <SelectItem value="Eşyasız">Eşyasız</SelectItem>
                          <SelectItem value="Kısmen Eşyalı">Kısmen Eşyalı</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 10. Amenities */}
                <FormField
                  control={form.control}
                  name="amenities"
                  render={() => (
                    <FormItem>
                      <FormLabel>10. Odada hangi eşyalar mevcut?</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: 'yatak', label: 'Yatak' },
                          { id: 'dolap', label: 'Dolap' },
                          { id: 'masa', label: 'Masa' },
                          { id: 'sandalye', label: 'Sandalye' },
                          { id: 'klima', label: 'Klima' },
                          { id: 'tv', label: 'TV' },
                          { id: 'diger', label: 'Diğer' },
                        ].map((item) => (
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

                {/* 11. Total Occupants */}
                <FormField
                  control={form.control}
                  name="totalOccupants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>11. Evde toplam kaç kişi yaşamaktadır? *</FormLabel>
                      <FormControl>
                        <NumberInput 
                          placeholder="2" 
                          value={field.value?.toString() || ''}
                          onChange={(val) => field.onChange(parseInt(val) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 12. Roommate Preference */}
                <FormField
                  control={form.control}
                  name="roommatePreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>12. Ev arkadaşı tercihiniz nedir? *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Kadın">Kadın</SelectItem>
                          <SelectItem value="Erkek">Erkek</SelectItem>
                          <SelectItem value="Farketmez">Farketmez</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 13. Smoking Policy */}
                <FormField
                  control={form.control}
                  name="smokingPolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>13. Evde sigara politikası nedir? *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="İçilir">İçilir</SelectItem>
                          <SelectItem value="İçilmez">İçilmez</SelectItem>
                          <SelectItem value="Farketmez">Farketmez</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mevcut Fotoğraflar */}
                {listing?.images && listing.images.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Mevcut Fotoğraflar</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {listing.images.map((image: any) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={getAbsoluteImageUrl(image.imagePath)}
                            alt="Listing"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          {image.isPrimary && (
                            <Star className="absolute top-2 left-2 w-5 h-5 text-yellow-400 fill-yellow-400" />
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            {!image.isPrimary && (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => setPrimaryImageMutation.mutate(image.id)}
                              >
                                Ana Yap
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteImageMutation.mutate(image.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Yeni Fotoğraf Ekle */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Yeni Fotoğraf Ekle</label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        setNewImages(Array.from(e.target.files));
                      }
                    }}
                  />
                  {newImages.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">{newImages.length} fotoğraf seçildi</p>
                  )}
                </div>

                {/* Submit */}
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={updateListingMutation.isPending || isUploading}
                      className="flex-1"
                    >
                      {(updateListingMutation.isPending || isUploading) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Kaydet
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation(`/oda-ilani/${id}`)}
                    >
                      İptal
                    </Button>
                  </div>
                  
                  {/* Delete Listing Button */}
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteListing}
                    disabled={deleteListingMutation.isPending}
                    className="w-full"
                    data-testid="button-delete-listing"
                  >
                    {deleteListingMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    İlanı Sil
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
