import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

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
                href="/search" 
                className="text-foreground hover:text-primary transition-colors"
                data-testid="nav-browse-rooms"
              >
                {t('nav.browse_rooms')}
              </Link>
              <Link 
                href="/create-listing" 
                className="text-foreground hover:text-primary transition-colors"
                data-testid="nav-list-room"
              >
                {t('nav.list_room')}
              </Link>
              <Link 
                href="/how-it-works" 
                className="text-foreground hover:text-primary transition-colors"
                data-testid="nav-how-it-works"
              >
                {t('nav.how_it_works')}
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/favorites" data-testid="favorites-link">
                  <Button variant="ghost" size="icon" aria-label={t('nav.favorites')}>
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/messages" data-testid="messages-link">
                  <Button variant="ghost" size="icon" aria-label={t('nav.messages')}>
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/profile" data-testid="profile-link">
                  <Button variant="outline" className="hidden sm:flex">
                    {t('nav.profile')}
                  </Button>
                </Link>
                <a href="/api/logout" data-testid="logout-link">
                  <Button variant="outline" className="hidden sm:flex">
                    {t('nav.logout')}
                  </Button>
                </a>
              </>
            ) : (
              <>
                <a href="/api/login" data-testid="login-link">
                  <Button variant="outline" className="hidden sm:flex">
                    {t('nav.login')}
                  </Button>
                </a>
                <a href="/api/login" data-testid="signup-link">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {t('nav.sign_up')}
                  </Button>
                </a>
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
            <Link href="/search" className="block text-foreground hover:text-primary transition-colors">
              {t('nav.browse_rooms')}
            </Link>
            <Link href="/create-listing" className="block text-foreground hover:text-primary transition-colors">
              {t('nav.list_room')}
            </Link>
            <Link href="/how-it-works" className="block text-foreground hover:text-primary transition-colors">
              {t('nav.how_it_works')}
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/profile" className="block text-foreground hover:text-primary transition-colors">
                  {t('nav.profile')}
                </Link>
                <a href="/api/logout" className="block text-foreground hover:text-primary transition-colors">
                  {t('nav.logout')}
                </a>
              </>
            ) : (
              <a href="/api/login" className="block text-foreground hover:text-primary transition-colors">
                {t('nav.login')}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
