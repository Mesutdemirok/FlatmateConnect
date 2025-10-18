import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";
import NumberInput from "@/components/forms/NumberInput";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X, Upload, Star } from "lucide-react";
import { z } from "zod";

const editListingSchema = z.object({
  title: z.string().min(10, 'Başlık en az 10 karakter olmalıdır'),
  address: z.string().min(5, 'Lütfen geçerli bir adres giriniz'),
  rentAmount: z.union([z.string(), z.number()]).transform(val => String(val)),
  billsIncluded: z.boolean(),
  propertyType: z.string().min(1, 'Lütfen konut tipini seçiniz'),
  furnishingStatus: z.string().min(1, 'Lütfen eşya durumunu seçiniz'),
  totalRooms: z.union([z.string(), z.number()]).transform(val => Number(val)),
  totalOccupants: z.union([z.string(), z.number()]).transform(val => Number(val)),
  roommatePreference: z.string(),
  smokingPolicy: z.string(),
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
      title: '',
      address: '',
      rentAmount: '0',
      billsIncluded: false,
      propertyType: '',
      furnishingStatus: '',
      totalRooms: 1,
      totalOccupants: 1,
      roommatePreference: '',
      smokingPolicy: '',
    },
  });

  // Populate form when listing loads
  useEffect(() => {
    if (listing) {
      form.reset({
        title: listing.title || '',
        address: listing.address || '',
        rentAmount: listing.rentAmount || '0',
        billsIncluded: listing.billsIncluded || false,
        propertyType: listing.propertyType || '',
        furnishingStatus: listing.furnishingStatus || '',
        totalRooms: listing.totalRooms || 1,
        totalOccupants: listing.totalOccupants || 1,
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
      const response = await apiRequest('PUT', `/api/listings/${id}`, data);
      return response.json();
    },
    onSuccess: async () => {
      // Upload new images if any
      if (newImages.length > 0) {
        try {
          setIsUploading(true);
          const formData = new FormData();
          newImages.forEach(image => formData.append('images', image));
          
          const imageResponse = await fetch(`/api/listings/${id}/images`, {
            method: 'POST',
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
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Başlık</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adres</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Rent Amount */}
                <FormField
                  control={form.control}
                  name="rentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aylık Kira (₺)</FormLabel>
                      <FormControl>
                        <NumberInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Property Type */}
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konut Tipi</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rezidans">Rezidans</SelectItem>
                          <SelectItem value="apartman">Apartman</SelectItem>
                          <SelectItem value="mustakil">Müstakil Ev</SelectItem>
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
