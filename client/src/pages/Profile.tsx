import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Settings, Heart, Home, Loader2 } from "lucide-react";

// —————————————————————————————————————————————————————————
// Zod schema for validation
// —————————————————————————————————————————————————————————
const personalInfoSchema = z.object({
  firstName: z.string().min(1, "Ad gereklidir"),
  lastName: z.string().min(1, "Soyad gereklidir"),
  phone: z.string().optional(),
  bio: z.string().optional(),
});
type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

export default function Profile() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("profile");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: t("errors.unauthorized"),
        description: t("errors.unauthorized_description"),
        variant: "destructive",
      });
      setTimeout(() => setLocation("/giris?next=/profil"), 500);
    }
  }, [isAuthenticated, authLoading, toast, setLocation]);

  // Queries
  const { data: myListings, isLoading: listingsLoading } = useQuery({
    queryKey: ["/api/my-listings"],
    enabled: isAuthenticated,
  });
  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
  });

  // Form setup
  const personalInfoForm = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: { firstName: "", lastName: "", phone: "", bio: "" },
  });

  useEffect(() => {
    if (user) {
      personalInfoForm.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
  }, [user, personalInfoForm]);

  const updatePersonalInfo = useMutation({
    mutationFn: async (data: PersonalInfoFormData) => {
      const response = await apiRequest("PATCH", "/api/users/me", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Başarılı!", description: "Bilgileriniz güncellendi." });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t("errors.unauthorized"),
          description: t("errors.unauthorized_description"),
          variant: "destructive",
        });
        setTimeout(() => setLocation("/giris?next=/profil"), 500);
      } else {
        toast({
          title: "Hata",
          description: "Bilgiler güncellenemedi",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: PersonalInfoFormData) =>
    updatePersonalInfo.mutate(data);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <SEOHead
        title="Profilim | Odanet"
        description="Profil bilgilerinizi görüntüleyin ve düzenleyin."
        url="https://www.odanet.com.tr/profil"
      />
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="relative mb-8 overflow-hidden rounded-2xl border bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-teal-500/15 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl p-[2px] bg-gradient-to-br from-violet-500 via-fuchsia-500 to-indigo-500">
              <div className="h-full w-full rounded-[0.65rem] bg-background grid place-items-center">
                <Settings className="h-6 w-6 text-amber-700" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Profilim</h1>
              <p className="text-muted-foreground">
                Hesabınızı yönetin, ilanlarınızı kontrol edin.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted/60 p-1">
            <TabsTrigger value="profile">
              <User className="h-4 w-4" /> Bilgiler
            </TabsTrigger>
            <TabsTrigger value="listings">
              <Home className="h-4 w-4" /> İlanlarım
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="h-4 w-4" /> Favorilerim
            </TabsTrigger>
          </TabsList>

          {/* Personal Info */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Kişisel Bilgiler</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...personalInfoForm}>
                  <form
                    onSubmit={personalInfoForm.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={personalInfoForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Adınız" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={personalInfoForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Soyad</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Soyadınız" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={personalInfoForm.control}
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
                      control={personalInfoForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hakkımda</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Kısa bir tanıtım yazısı..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2 pt-2">
                      <Button
                        type="submit"
                        disabled={updatePersonalInfo.isPending}
                      >
                        {updatePersonalInfo.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                            Kaydediliyor...
                          </>
                        ) : (
                          "Kaydet"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => personalInfoForm.reset()}
                        disabled={updatePersonalInfo.isPending}
                      >
                        İptal
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings */}
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

          {/* Favorites */}
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
