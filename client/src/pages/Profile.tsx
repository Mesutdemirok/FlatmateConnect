"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getAbsoluteImageUrl } from "@/lib/imageUtils";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { User, Home, Heart, Settings, Loader2, Camera, ChevronDown, Edit, Trash2, Calendar, MapPin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// --------------------------------------------------------------
// VALIDATION SCHEMAS
// --------------------------------------------------------------
const personalInfoSchema = z.object({
  firstName: z.string().min(1, "Ad gereklidir"),
  lastName: z.string().min(1, "Soyad gereklidir"),
  phone: z.string().min(10, "Geçerli bir telefon giriniz"),
  city: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().min(1, "Profil fotoğrafı gereklidir"),
});

const lifestylePreferencesSchema = z.object({
  smokingPreference: z.string().optional(),
  petPreference: z.string().optional(),
  cleanlinessLevel: z.string().optional(),
  socialLevel: z.string().optional(),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
type LifestylePreferencesFormData = z.infer<typeof lifestylePreferencesSchema>;

export default function Profile() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [activeTab, setActiveTab] = useState("profile");
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [deleteListingId, setDeleteListingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: t("errors.unauthorized"),
        description: t("errors.unauthorized_description"),
        variant: "destructive",
      });
      setTimeout(() => setLocation("/giris?next=/profil"), 500);
    }
  }, [isAuthenticated, authLoading]);

  // Queries
  const { data: myListings, isLoading: listingsLoading } = useQuery({
    queryKey: ["/api/my-listings"],
    enabled: isAuthenticated,
  });

  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
  });

  const { data: userPreferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ["/api/user-preferences"],
    enabled: isAuthenticated,
  });

  // --------------------------------------------------------------
  // PERSONAL INFO FORM
  // --------------------------------------------------------------
  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      city: "",
      bio: "",
      profileImage: "",
    },
  });

  // Fill form when user loaded
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        city: user.city || "",
        bio: user.bio || "",
        profileImage: user.profileImageUrl || "",
      });
    }
  }, [user]);

  // --------------------------------------------------------------
  // LIFESTYLE PREFERENCES FORM
  // --------------------------------------------------------------
  const preferencesForm = useForm<LifestylePreferencesFormData>({
    resolver: zodResolver(lifestylePreferencesSchema),
    defaultValues: {
      smokingPreference: "",
      petPreference: "",
      cleanlinessLevel: "",
      socialLevel: "",
    },
  });

  // Fill preferences form when data loaded
  useEffect(() => {
    if (userPreferences) {
      preferencesForm.reset({
        smokingPreference: userPreferences.smokingPreference || "",
        petPreference: userPreferences.petPreference || "",
        cleanlinessLevel: userPreferences.cleanlinessLevel || "",
        socialLevel: userPreferences.socialLevel || "",
      });
    }
  }, [userPreferences]);

  // --------------------------------------------------------------
  // AVATAR UPLOAD HANDLER
  // --------------------------------------------------------------
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await apiRequest(
        "POST",
        "/api/users/upload-avatar",
        formData,
        {
          isFormData: true,
        },
      ).then((r) => r.json());

      form.setValue("profileImage", response.data.profile_image);

      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });

      toast({
        title: "Profil fotoğrafı güncellendi",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Fotoğraf yüklenemedi",
        variant: "destructive",
      });
    }
  };

  // --------------------------------------------------------------
  // UPDATE PERSONAL INFO
  // --------------------------------------------------------------
  const updateProfile = useMutation({
    mutationFn: async (data: PersonalInfoFormData) => {
      return apiRequest("PATCH", "/api/users/me", data).then((r) => r.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });

      toast({
        title: "Başarılı",
        description: "Profiliniz güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Bilgiler güncellenemedi.",
        variant: "destructive",
      });
    },
  });

  // --------------------------------------------------------------
  // UPDATE LIFESTYLE PREFERENCES
  // --------------------------------------------------------------
  const updatePreferences = useMutation({
    mutationFn: async (data: LifestylePreferencesFormData) => {
      return apiRequest("POST", "/api/user-preferences", data).then((r) => r.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-preferences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });

      toast({
        title: "Başarılı",
        description: "Tercihleriniz kaydedildi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Tercihler kaydedilemedi.",
        variant: "destructive",
      });
    },
  });

  // --------------------------------------------------------------
  // DELETE LISTING
  // --------------------------------------------------------------
  const deleteListing = useMutation({
    mutationFn: async (listingId: string) => {
      return apiRequest("DELETE", `/api/listings/${listingId}`).then((r) => r.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-listings"] });
      toast({
        title: "Başarılı",
        description: "İlan silindi.",
      });
      setDeleteListingId(null);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "İlan silinemedi.",
        variant: "destructive",
      });
    },
  });

  // --------------------------------------------------------------
  // UPDATE LISTING STATUS
  // --------------------------------------------------------------
  const updateListingStatus = useMutation({
    mutationFn: async ({ listingId, status }: { listingId: string; status: string }) => {
      return apiRequest("PUT", `/api/listings/${listingId}/status`, { status }).then((r) => r.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-listings"] });
      toast({
        title: "Başarılı",
        description: "İlan durumu güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Durum güncellenemedi.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // --------------------------------------------------------------
  // UI
  // --------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <SEOHead
        title="Profilim | Odanet"
        description="Profil bilgilerinizi düzenleyin."
      />

      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Settings className="h-10 w-10 text-amber-700" />
          <div>
            <h1 className="text-3xl font-bold">Profilim</h1>
            <p className="text-muted-foreground">Hesabınızı yönetin</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-3 bg-muted p-1 rounded-xl">
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="mr-2" /> Bilgiler
            </TabsTrigger>
            <TabsTrigger value="listings" data-testid="tab-listings">
              <Home className="mr-2" /> İlanlarım
            </TabsTrigger>
            <TabsTrigger value="favorites" data-testid="tab-favorites">
              <Heart className="mr-2" /> Favorilerim
            </TabsTrigger>
          </TabsList>

          {/* -------------------------------------------------------------- */}
          {/* PROFILE TAB */}
          {/* -------------------------------------------------------------- */}
          <TabsContent value="profile">
            {/* Profile Completion Progress Bar */}
            {user && (
              <div className="mb-6" data-testid="profile-completion">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Profil Tamamlanma</h3>
                  <span className="text-sm text-muted-foreground" data-testid="profile-score">
                    {user.profileScore || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-teal-600 h-3 rounded-full transition-all"
                    style={{ width: `${user.profileScore || 0}%` }}
                    data-testid="profile-progress-bar"
                  />
                </div>
                {(user.profileScore || 0) < 60 && (
                  <p className="text-sm text-amber-600 mt-2" data-testid="profile-warning">
                    ⚠️ İlan oluşturmak için profilinizi en az %60 tamamlamalısınız.
                  </p>
                )}
              </div>
            )}

            {/* Personal Information Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Kişisel Bilgiler</CardTitle>
              </CardHeader>
              <CardContent>
                {/* AVATAR */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <img
                      src={form.watch("profileImage") || "/default-avatar.png"}
                      className="h-20 w-20 rounded-full object-cover border"
                      alt="Profile"
                      data-testid="img-profile-avatar"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                      className="absolute bottom-0 right-0 bg-black/60 p-1 rounded-full"
                      data-testid="button-upload-avatar"
                    >
                      <Camera className="h-4 w-4 text-white" />
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    data-testid="input-avatar-file"
                  />
                </div>

                {/* FORM */}
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((data) =>
                      updateProfile.mutate(data),
                    )}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-first-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Soyad</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-last-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="05XX XXX XX XX" data-testid="input-phone" />
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
                          <FormLabel>Şehir</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="İstanbul, Ankara, İzmir..." data-testid="input-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hakkımda</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Kısa bir tanıtım yazısı"
                              data-testid="input-bio"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={updateProfile.isPending} data-testid="button-save-personal-info">
                      {updateProfile.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        "Kaydet"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Lifestyle Preferences Card */}
            <Card>
              <Collapsible open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
                <CardHeader className="cursor-pointer">
                  <CollapsibleTrigger className="flex items-center justify-between w-full" data-testid="button-toggle-preferences">
                    <CardTitle>Yaşam Tarzı Tercihleri</CardTitle>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        isPreferencesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    {preferencesLoading ? (
                      <Skeleton className="h-48 w-full" />
                    ) : (
                      <Form {...preferencesForm}>
                        <form
                          onSubmit={preferencesForm.handleSubmit((data) =>
                            updatePreferences.mutate(data),
                          )}
                          className="space-y-4"
                        >
                          <FormField
                            control={preferencesForm.control}
                            name="smokingPreference"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sigara</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger data-testid="select-smoking">
                                      <SelectValue placeholder="Seçiniz..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="İçerim">İçerim</SelectItem>
                                    <SelectItem value="İçmem">İçmem</SelectItem>
                                    <SelectItem value="Ara sıra">Ara sıra</SelectItem>
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
                                <FormLabel>Evcil Hayvan</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger data-testid="select-pet">
                                      <SelectValue placeholder="Seçiniz..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Var">Var</SelectItem>
                                    <SelectItem value="Yok">Yok</SelectItem>
                                    <SelectItem value="Pazarlık edilebilir">Pazarlık edilebilir</SelectItem>
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
                                <FormLabel>Temizlik</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger data-testid="select-cleanliness">
                                      <SelectValue placeholder="Seçiniz..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Çok temiz">Çok temiz</SelectItem>
                                    <SelectItem value="Temiz">Temiz</SelectItem>
                                    <SelectItem value="Orta">Orta</SelectItem>
                                    <SelectItem value="Esnek">Esnek</SelectItem>
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
                                <FormLabel>Sosyallik</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger data-testid="select-social">
                                      <SelectValue placeholder="Seçiniz..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Çok sosyal">Çok sosyal</SelectItem>
                                    <SelectItem value="Sosyal">Sosyal</SelectItem>
                                    <SelectItem value="Orta">Orta</SelectItem>
                                    <SelectItem value="Sakin">Sakin</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button type="submit" disabled={updatePreferences.isPending} data-testid="button-save-preferences">
                            {updatePreferences.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Kaydediliyor...
                              </>
                            ) : (
                              "Tercihleri Kaydet"
                            )}
                          </Button>
                        </form>
                      </Form>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </TabsContent>

          {/* -------------------------------------------------------------- */}
          {/* LISTINGS */}
          {/* -------------------------------------------------------------- */}
          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>İlanlarım</CardTitle>
              </CardHeader>
              <CardContent>
                {listingsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-lg" data-testid="skeleton-listing-card" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                  </div>
                ) : !myListings || myListings.length === 0 ? (
                  <div className="text-center py-12" data-testid="empty-listings">
                    <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Henüz İlanınız Yok</h3>
                    <p className="text-muted-foreground mb-6">
                      İlk ilanınızı oluşturarak ev arkadaşı bulmaya başlayın.
                    </p>
                    <Button onClick={() => setLocation("/ilan-olustur")} data-testid="button-create-first-listing">
                      İlan Oluştur
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myListings.map((listing: any) => {
                      const firstImage = listing.images?.[0]?.imagePath;
                      const thumbnailUrl = firstImage
                        ? getAbsoluteImageUrl(firstImage)
                        : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=60";
                      
                      const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
                        active: { label: "Aktif", variant: "default" },
                        paused: { label: "Pasif", variant: "secondary" },
                        rented: { label: "Kiralandı", variant: "outline" },
                        deleted: { label: "Silindi", variant: "destructive" },
                      };
                      
                      const status = statusConfig[listing.status] || statusConfig.active;
                      
                      return (
                        <div
                          key={listing.id}
                          className="flex gap-4 p-4 bg-muted/30 rounded-lg border hover:border-primary/50 transition"
                          data-testid={`listing-card-${listing.id}`}
                        >
                          {/* Thumbnail */}
                          <img
                            src={thumbnailUrl}
                            alt={listing.title}
                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                            data-testid={`listing-thumbnail-${listing.id}`}
                          />
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-lg truncate" data-testid={`listing-title-${listing.id}`}>
                                {listing.title}
                              </h3>
                              <Badge variant={status.variant} data-testid={`listing-status-${listing.id}`}>
                                {status.label}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                              <span className="font-semibold text-primary" data-testid={`listing-rent-${listing.id}`}>
                                {formatCurrency(Number(listing.rentAmount))}
                              </span>
                              {listing.address && (
                                <span className="flex items-center gap-1" data-testid={`listing-address-${listing.id}`}>
                                  <MapPin className="h-3 w-3" />
                                  {listing.address}
                                </span>
                              )}
                              {listing.createdAt && (
                                <span className="flex items-center gap-1" data-testid={`listing-date-${listing.id}`}>
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(new Date(listing.createdAt))}
                                </span>
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setLocation(`/ilan-duzenle/${listing.id}`)}
                                data-testid={`button-edit-${listing.id}`}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Düzenle
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeleteListingId(listing.id)}
                                disabled={deleteListing.isPending}
                                data-testid={`button-delete-${listing.id}`}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Sil
                              </Button>
                              
                              {/* Status Dropdown */}
                              <Select
                                value={listing.status}
                                onValueChange={(value) =>
                                  updateListingStatus.mutate({ listingId: listing.id, status: value })
                                }
                                disabled={updateListingStatus.isPending}
                              >
                                <SelectTrigger className="h-8 w-auto" data-testid={`select-status-${listing.id}`}>
                                  <SelectValue placeholder="Durum" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active" data-testid={`status-option-active-${listing.id}`}>
                                    Aktif
                                  </SelectItem>
                                  <SelectItem value="paused" data-testid={`status-option-paused-${listing.id}`}>
                                    Pasif
                                  </SelectItem>
                                  <SelectItem value="rented" data-testid={`status-option-rented-${listing.id}`}>
                                    Kiralandı
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* -------------------------------------------------------------- */}
          {/* FAVORITES */}
          {/* -------------------------------------------------------------- */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Favorilerim</CardTitle>
              </CardHeader>
              <CardContent>
                {favoritesLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : (
                  <p>Favori ilanlar burada görünecek.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteListingId} onOpenChange={(open) => !open && setDeleteListingId(null)}>
        <AlertDialogContent data-testid="dialog-delete-listing">
          <AlertDialogHeader>
            <AlertDialogTitle>İlanı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteListingId && deleteListing.mutate(deleteListingId)}
              disabled={deleteListing.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteListing.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                "Sil"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
