import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, getAuthHeaders } from "@/lib/queryClient";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Home, Upload, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { z } from "zod";
import { cn } from "@/lib/utils";

const createListingSchema = z.object({
  // Basic Information
  title: z.string().min(10, 'Başlık en az 10 karakter olmalıdır'),
  description: z.string().min(50, 'Açıklama en az 50 karakter olmalıdır'),
  
  // Location
  address: z.string().min(5, 'Lütfen geçerli bir adres giriniz'),
  city: z.string().min(2, 'Şehir gereklidir'),
  district: z.string().min(2, 'İlçe gereklidir'),
  neighborhood: z.string().optional(),
  
  // Pricing & Terms
  rentAmount: z.coerce.number().positive('Kira tutarı 0\'dan büyük olmalıdır'),
  deposit: z.coerce.number().nonnegative('Depozito 0 veya daha büyük olmalıdır'),
  moveInDate: z.date({
    required_error: "Taşınma tarihi gereklidir",
  }),
  minStayMonths: z.coerce.number().int().positive('Minimum kalış süresi en az 1 ay olmalıdır'),
  
  // Bills & Utilities
  billsIncluded: z.enum(['yes', 'no']),
  excludedBills: z.array(z.string()).optional().default([]),
  
  // Property Details
  propertyType: z.string().min(1, 'Lütfen konut tipini seçiniz'),
  internetIncluded: z.enum(['yes', 'no']),
  totalRooms: z.coerce.number().int().positive('Oda sayısı 0\'dan büyük olmalıdır'),
  bathroomType: z.string().min(1, 'Lütfen banyo tipini seçiniz'),
  furnishingStatus: z.string().min(1, 'Lütfen eşya durumunu seçiniz'),
  amenities: z.array(z.string()).default([]),
  
  // Roommate Preferences
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
      title: '',
      description: '',
      address: '',
      city: '',
      district: '',
      neighborhood: '',
      rentAmount: 0,
      deposit: 0,
      moveInDate: undefined,
      minStayMonths: 3,
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
        title: data.title,
        description: data.description,
        address: data.address,
        city: data.city,
        district: data.district,
        neighborhood: data.neighborhood || '',
        rentAmount: data.rentAmount.toString(),
        deposit: data.deposit.toString(),
        moveInDate: data.moveInDate.toISOString().split('T')[0],
        minStayMonths: data.minStayMonths,
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
    onSuccess: async (listing) => {
      // Upload images if any
      if (images.length > 0) {
        try {
          const formData = new FormData();
          images.forEach(image => {
            formData.append('images', image);
          });
          
          const imageResponse = await fetch(`/api/uploads/listings/${listing.id}/images`, {
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
              description: 'Resimler yüklenemedi. Lütfen daha sonra düzenleyerek ekleyiniz.',
              variant: "destructive"
            });
          } else {
            console.log('✅ Images uploaded successfully');
          }
        } catch (error) {
          console.error('Error uploading images:', error);
          toast({
            title: 'Resim Yükleme Hatası',
            description: 'Resimler yüklenemedi. Lütfen daha sonra düzenleyerek ekleyiniz.',
            variant: "destructive"
          });
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
    // ✅ Enforce mandatory image requirement before submission
    if (images.length === 0) {
      toast({
        title: 'Fotoğraf Gerekli',
        description: 'En az bir oda fotoğrafı eklemelisiniz.',
        variant: "destructive"
      });
      return;
    }
    
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
                          placeholder="örn., Caferağa Mahallesi, Moda Caddesi No:123" 
                          {...field} 
                          data-testid="input-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* City, District, Neighborhood */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şehir *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="İstanbul" 
                            {...field} 
                            data-testid="input-city"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İlçe *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Kadıköy" 
                            {...field} 
                            data-testid="input-district"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mahalle</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Caferağa" 
                            {...field} 
                            data-testid="input-neighborhood"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>3. İlan açıklaması *</FormLabel>
                      <FormDescription>
                        Odanızı ve evinizi detaylı bir şekilde tanıtın (min. 50 karakter)
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="Örn: Kadıköy merkezde, denize yakın, ulaşımı kolay bir lokasyonda bulunan evimizde boş odamızı paylaşmak istiyoruz..."
                          {...field}
                          rows={5}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 4. Aylık kira bedeli ne kadar? */}
                <FormField
                  control={form.control}
                  name="rentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>4. Aylık kira bedeli ne kadar? *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5">₺</span>
                          <NumberInput 
                            placeholder="5000" 
                            className="pl-8"
                            value={field.value?.toString() || ''}
                            onChange={(val) => field.onChange(parseFloat(val) || 0)}
                            data-testid="input-rent"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Deposit */}
                <FormField
                  control={form.control}
                  name="deposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>5. Depozito tutarı *</FormLabel>
                      <FormDescription>
                        Depozito yoksa 0 giriniz
                      </FormDescription>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5">₺</span>
                          <NumberInput 
                            placeholder="0" 
                            className="pl-8"
                            value={field.value?.toString() || ''}
                            onChange={(val) => field.onChange(parseFloat(val) || 0)}
                            data-testid="input-deposit"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Move In Date */}
                <FormField
                  control={form.control}
                  name="moveInDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>6. Taşınma tarihi *</FormLabel>
                      <FormDescription>
                        Oda ne zaman müsait olacak?
                      </FormDescription>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="button-move-in-date"
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: tr })
                              ) : (
                                <span>Tarih seçiniz</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Minimum Stay */}
                <FormField
                  control={form.control}
                  name="minStayMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>7. Minimum kalış süresi (ay) *</FormLabel>
                      <FormDescription>
                        En az kaç ay kalmak istiyorsunuz?
                      </FormDescription>
                      <FormControl>
                        <NumberInput 
                          placeholder="3" 
                          value={field.value?.toString() || ''}
                          onChange={(val) => field.onChange(parseInt(val) || 0)}
                          data-testid="input-min-stay"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 8. Fiyata faturalar dahil mi? */}
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

                {/* 4b. Dahil olmayan faturalar (conditional) */}
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
                      <FormControl>
                        <NumberInput
                          placeholder="örn., 3"
                          value={field.value?.toString() || ''}
                          onChange={(val) => field.onChange(parseInt(val) || 0)}
                          data-testid="input-total-rooms"
                        />
                      </FormControl>
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
                        <NumberInput 
                          placeholder="2" 
                          value={field.value?.toString() || ''}
                          onChange={(val) => field.onChange(parseInt(val) || 0)}
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
