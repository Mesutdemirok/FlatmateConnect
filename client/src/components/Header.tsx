import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href="/" data-testid="logo-link">
                <h1 className="text-2xl font-bold text-primary cursor-pointer">Odanet</h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link 
                href="/oda-ilanlari" 
                className="text-foreground hover:text-primary transition-colors"
                data-testid="nav-browse-rooms"
              >
                {t('nav.list_room')}
              </Link>
              <Link 
                href={isAuthenticated ? "/profil" : "/giris?next=/profil"}
                className="text-foreground hover:text-primary transition-colors"
                data-testid="nav-create-seeker"
              >
                {t('nav.browse_rooms')}
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/favoriler" data-testid="favorites-link">
                  <Button variant="ghost" size="icon" aria-label={t('nav.favorites')}>
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/mesajlar" data-testid="messages-link">
                  <Button variant="ghost" size="icon" aria-label={t('nav.messages')}>
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/profil" data-testid="profile-link">
                  <Button variant="outline" className="hidden sm:flex">
                    {t('nav.profile')}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="hidden sm:flex" 
                  onClick={handleLogout}
                  data-testid="logout-button"
                >
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/giris" data-testid="login-link">
                  <Button variant="outline" className="hidden sm:flex">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href="/uye-ol" data-testid="signup-link">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {t('nav.sign_up')}
                  </Button>
                </Link>
              </>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={toggleMobileMenu}
              data-testid="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card" data-testid="mobile-menu">
          <div className="px-4 py-4 space-y-4">
            <Link href="/oda-ilanlari" className="block text-foreground hover:text-primary transition-colors">
              {t('nav.list_room')}
            </Link>
            <Link href={isAuthenticated ? "/profil" : "/giris?next=/profil"} className="block text-foreground hover:text-primary transition-colors">
              {t('nav.browse_rooms')}
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/profil" className="block text-foreground hover:text-primary transition-colors">
                  {t('nav.profile')}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block text-foreground hover:text-primary transition-colors text-left w-full"
                  data-testid="mobile-logout-button"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link href="/giris" className="block text-foreground hover:text-primary transition-colors">
                  {t('nav.login')}
                </Link>
                <Link href="/uye-ol" className="block text-foreground hover:text-primary transition-colors">
                  {t('nav.sign_up')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
