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
import { insertListingSchema } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageUpload from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Home, DollarSign, Calendar, MapPin, Camera, Loader2 } from "lucide-react";
import { z } from "zod";

type CreateListingFormData = z.infer<typeof insertListingSchema> & {
  rentAmount: string;
  bondAmount?: string;
};

export default function CreateListing() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create schema with translated error messages
  const createListingSchema = insertListingSchema.extend({
    rentAmount: z.string().min(1, t('errors.required')),
    bondAmount: z.string().optional(),
  });

  const form = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: '',
      description: '',
      address: '',
      suburb: '',
      city: '',
      state: '',
      postcode: '',
      rentAmount: '',
      bondAmount: '',
      availableFrom: '',
      availableTo: '',
      roomType: '',
      propertyType: '',
      furnished: false,
      billsIncluded: false,
      parkingAvailable: false,
      internetIncluded: false,
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: t('errors.unauthorized'),
        description: t('auth.sign_out'),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateListingFormData) => {
      const response = await apiRequest('POST', '/api/listings', {
        ...data,
        rentAmount: Number(data.rentAmount),
        bondAmount: data.bondAmount ? Number(data.bondAmount) : null,
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
          toast({
            title: t('common.warning', 'Uyarı'),
            description: t('create_listing.image_upload_partial_error', 'İlan oluşturuldu ancak bazı görseller yüklenemedi. Daha sonra ekleyebilirsiniz.'),
            variant: "destructive"
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-listings'] });
      
      toast({
        title: t('common.success', 'Başarılı!'),
        description: t('success.listing_created')
      });
      
      setLocation(`/listing/${listing.id}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t('errors.unauthorized'),
          description: t('auth.sign_out'),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t('common.error', 'Hata'),
        description: t('create_listing.create_error', 'İlan oluşturulurken hata oluştu. Lütfen tekrar deneyin.'),
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: CreateListingFormData) => {
    setIsSubmitting(true);
    createListingMutation.mutate(data);
    setIsSubmitting(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="create-listing-loading">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="create-listing-page">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="page-title">
            {t('create_listing.title')}
          </h1>
          <p className="text-muted-foreground" data-testid="page-subtitle">
            {t('create_listing.subtitle', 'Mükemmel ev arkadaşınızı bulmak için ilan oluşturun')}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  {t('create_listing.basic_info')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('create_listing.listing_title')} *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('create_listing.listing_title_placeholder', 'örn., Kadıköy\'de geniş oda')}
                          {...field}
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormDescription>
                        {t('create_listing.listing_title_desc', 'İlanınız için dikkat çekici bir başlık oluşturun')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('create_listing.description')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('create_listing.description_placeholder', 'Odanızı, evi ve ev arkadaşınızda aradıklarınızı açıklayın...')}
                          className="min-h-[120px]"
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormDescription>
                        {t('create_listing.description_desc', 'Oda, mülk ve tercihleriniz hakkında detay verin')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="roomType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('create_listing.room_type')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-room-type">
                              <SelectValue placeholder={t('create_listing.select_room_type', 'Oda tipini seçin')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="private">{t('hero.room_types.private')}</SelectItem>
                            <SelectItem value="shared">{t('hero.room_types.shared')}</SelectItem>
                            <SelectItem value="ensuite">{t('hero.room_types.ensuite')}</SelectItem>
                            <SelectItem value="studio">{t('hero.room_types.studio')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('create_listing.property_type')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-property-type">
                              <SelectValue placeholder={t('create_listing.select_property_type', 'Mülk tipini seçin')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="house">{t('hero.property_types.house')}</SelectItem>
                            <SelectItem value="apartment">{t('hero.property_types.apartment')}</SelectItem>
                            <SelectItem value="townhouse">{t('hero.property_types.townhouse')}</SelectItem>
                            <SelectItem value="unit">{t('hero.property_types.unit')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t('create_listing.location')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('create_listing.address')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('create_listing.address_placeholder', 'örn., Atatürk Caddesi No: 123')}
                          {...field}
                          data-testid="input-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="suburb"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('create_listing.suburb', 'Semt')} *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('create_listing.suburb_placeholder', 'örn., Kadıköy')}
                            {...field}
                            data-testid="input-suburb"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('create_listing.city')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('create_listing.city_placeholder', 'örn., İstanbul')}
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
                    name="postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('create_listing.postcode')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('create_listing.postcode_placeholder', 'örn., 34710')}
                            {...field}
                            data-testid="input-postcode"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('create_listing.state')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-state">
                            <SelectValue placeholder={t('create_listing.select_state', 'İl seçin')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NSW">{t('options.states.NSW')}</SelectItem>
                          <SelectItem value="VIC">{t('options.states.VIC')}</SelectItem>
                          <SelectItem value="QLD">{t('options.states.QLD')}</SelectItem>
                          <SelectItem value="WA">{t('options.states.WA')}</SelectItem>
                          <SelectItem value="SA">{t('options.states.SA')}</SelectItem>
                          <SelectItem value="TAS">{t('options.states.TAS')}</SelectItem>
                          <SelectItem value="ACT">{t('options.states.ACT')}</SelectItem>
                          <SelectItem value="NT">{t('options.states.NT')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing & Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {t('create_listing.pricing')} & {t('create_listing.availability')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="rentAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('create_listing.weekly_rent')} *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="number"
                              placeholder="1500"
                              className="pl-10"
                              {...field}
                              data-testid="input-rent-amount"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          {t('create_listing.weekly_rent_desc', 'Haftalık tutar (TL)')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bondAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('create_listing.bond')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="number"
                              placeholder="3000"
                              className="pl-10"
                              {...field}
                              data-testid="input-bond-amount"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          {t('create_listing.bond_desc', 'Güvenlik depozitosu tutarı')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="availableFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('create_listing.available_from')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            {...field}
                            data-testid="input-available-from"
                          />
                        </FormControl>
                        <FormDescription>
                          {t('create_listing.available_from_desc', 'Oda ne zaman müsait olacak')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availableTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('create_listing.available_until', 'Müsait Olma Bitiş Tarihi')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            {...field}
                            data-testid="input-available-to"
                          />
                        </FormControl>
                        <FormDescription>
                          {t('create_listing.available_until_desc', 'İsteğe bağlı müsaitlik bitiş tarihi')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Features & Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>{t('create_listing.features')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="furnished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-furnished"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t('create_listing.furnished')}</FormLabel>
                          <FormDescription>
                            {t('create_listing.furnished_desc', 'Oda mobilyalı olarak geliyor')}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="billsIncluded"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-bills-included"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t('create_listing.bills_included', 'Faturalar Dahil')}</FormLabel>
                          <FormDescription>
                            {t('create_listing.bills_included_desc', 'Elektrik, gaz, su dahil')}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="internetIncluded"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-internet-included"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t('create_listing.internet')}</FormLabel>
                          <FormDescription>
                            {t('create_listing.internet_desc', 'WiFi/İnternet dahil')}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parkingAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-parking-available"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t('create_listing.parking')}</FormLabel>
                          <FormDescription>
                            {t('create_listing.parking_desc', 'Araç park alanı mevcut')}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  {t('create_listing.images')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload onImagesChange={setImages} />
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation('/search')}
                data-testid="cancel-button"
              >
                {t('create_listing.cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || createListingMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="submit-button"
              >
                {isSubmitting || createListingMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('create_listing.creating', 'İlan Oluşturuluyor...')}
                  </>
                ) : (
                  t('create_listing.create_button')
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
