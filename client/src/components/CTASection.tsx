import { Button } from "@/components/ui/button";
import { Search, Home } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function CTASection() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-background" data-testid="cta-section">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="cta-title">
          {t('cta.title')}
        </h2>
        <p className="text-lg text-muted-foreground mb-8" data-testid="cta-subtitle">
          {t('cta.subtitle')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow" data-testid="search-cta-card">
            <Search className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2" data-testid="search-cta-title">{t('cta.looking_for_room')}</h3>
            <p className="text-muted-foreground mb-4" data-testid="search-cta-description">
              {t('cta.browse_verified_listings')}
            </p>
            <Link href="/search">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" data-testid="start-searching-button">
                {t('cta.start_searching')}
              </Button>
            </Link>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow" data-testid="list-cta-card">
            <Home className="h-12 w-12 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2" data-testid="list-cta-title">{t('cta.have_room')}</h3>
            <p className="text-muted-foreground mb-4" data-testid="list-cta-description">
              {t('cta.list_your_space')}
            </p>
            {isAuthenticated ? (
              <Link href="/create-listing">
                <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="list-room-button">
                  {t('cta.list_your_room')}
                </Button>
              </Link>
            ) : (
              <a href="/api/login">
                <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="list-room-login-button">
                  {t('cta.list_your_room')}
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
