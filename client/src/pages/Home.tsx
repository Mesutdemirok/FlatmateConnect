import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import FeaturedListings from "@/components/FeaturedListings";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: t('errors.unauthorized'),
        description: t('errors.unauthorized_description'),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="home-loading">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-violet-50 to-fuchsia-50" data-testid="home-page">
      <Header />
      <main>
        <Hero />
        <FeaturesSection />
        <FeaturedListings />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
