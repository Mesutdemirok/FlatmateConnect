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
import { User, Home, Heart, Settings, Loader2, Camera } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// --------------------------------------------------------------
// VALIDATION SCHEMA WITH REQUIRED IMAGE
// --------------------------------------------------------------
const personalInfoSchema = z.object({
  firstName: z.string().min(1, "Ad gereklidir"),
  lastName: z.string().min(1, "Soyad gereklidir"),
  phone: z.string().min(10, "Geçerli bir telefon giriniz"),
  bio: z.string().optional(),
  profileImage: z.string().min(1, "Profil fotoğrafı gereklidir"),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

export default function Profile() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [activeTab, setActiveTab] = useState("profile");
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

  // --------------------------------------------------------------
  // FORM
  // --------------------------------------------------------------
  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
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
        bio: user.bio || "",
        profileImage: user.profile_image || "",
      });
    }
  }, [user]);

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
            <TabsTrigger value="profile">
              <User /> Bilgiler
            </TabsTrigger>
            <TabsTrigger value="listings">
              <Home /> İlanlarım
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart /> Favorilerim
            </TabsTrigger>
          </TabsList>

          {/* -------------------------------------------------------------- */}
          {/* PROFILE TAB */}
          {/* -------------------------------------------------------------- */}
          <TabsContent value="profile">
            <Card>
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
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                      className="absolute bottom-0 right-0 bg-black/60 p-1 rounded-full"
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
                              <Input {...field} />
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
                              <Input {...field} />
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
                            <Input {...field} placeholder="05XX XXX XX XX" />
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
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={updateProfile.isPending}>
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
                  <Skeleton className="h-48 w-full" />
                ) : (
                  <p>İlanlar burada görünecek.</p>
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
    </div>
  );
}
