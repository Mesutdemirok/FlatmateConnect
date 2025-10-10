import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import FeaturedListings from "@/components/FeaturedListings";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Landing() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-violet-50 to-fuchsia-50" data-testid="landing-page">
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
