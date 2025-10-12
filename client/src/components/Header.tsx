import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <header
      className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white sticky top-0 z-50 shadow-md"
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href="/" data-testid="logo-link">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight cursor-pointer hover:opacity-90 transition-opacity">
                  Odanet
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              <Link
                href={
                  isAuthenticated
                    ? "/ilan-olustur"
                    : "/giris?next=/ilan-olustur"
                }
                className="text-white/90 hover:text-white transition-colors"
                data-testid="nav-create-listing"
              >
                Oda İlanı Ver
              </Link>
              <Link
                href={
                  isAuthenticated
                    ? "/oda-arama-ilani-olustur"
                    : "/giris?next=/oda-arama-ilani-olustur"
                }
                className="text-white/90 hover:text-white transition-colors"
                data-testid="nav-create-seeker"
              >
                Oda Arama İlanı Ver
              </Link>
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/favoriler" data-testid="favorites-link">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("nav.favorites")}
                    className="text-white hover:bg-white/20 bg-white/10"
                  >
                    <Heart className="h-6 w-6" strokeWidth={2.5} fill="currentColor" />
                  </Button>
                </Link>
                <Link href="/mesajlar" data-testid="messages-link">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("nav.messages")}
                    className="text-white hover:bg-white/20 bg-white/10"
                  >
                    <MessageSquare className="h-6 w-6" strokeWidth={2.5} />
                  </Button>
                </Link>
                <Link href="/profil" data-testid="profile-link">
                  <Button
                    variant="outline"
                    className="hidden sm:flex bg-white text-indigo-700 border-white hover:bg-indigo-50 font-medium"
                  >
                    {t("nav.profile")}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="hidden sm:flex bg-white text-indigo-700 border-white hover:bg-indigo-50 font-medium"
                  onClick={handleLogout}
                  data-testid="logout-button"
                >
                  {t("nav.logout")}
                </Button>
              </>
            ) : (
              <>
                <Link href="/giris" data-testid="login-link">
                  <Button
                    variant="outline"
                    className="hidden sm:flex bg-white text-indigo-700 border-white hover:bg-indigo-50 font-medium"
                  >
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/uye-ol" data-testid="signup-link">
                  <Button className="bg-white text-indigo-700 hover:bg-indigo-100 font-semibold">
                    Üye Ol
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden rounded-full p-2 transition-all duration-300 ${
                isMobileMenuOpen
                  ? "bg-white text-indigo-700"
                  : "bg-white/20 hover:bg-white/30 text-white"
              }`}
              onClick={toggleMobileMenu}
              data-testid="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? (
                <X className="h-8 w-8" />
              ) : (
                <Menu className="h-8 w-8" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden border-t border-white/20 bg-gradient-to-b from-orange-100 to-amber-50 text-gray-800"
          data-testid="mobile-menu"
        >
          <div className="px-4 py-4 space-y-4">
            <Link
              href={
                isAuthenticated ? "/ilan-olustur" : "/giris?next=/ilan-olustur"
              }
              className="block hover:text-orange-600 transition-colors"
            >
              Oda İlanı Ver
            </Link>
            <Link
              href={
                isAuthenticated
                  ? "/oda-arama-ilani-olustur"
                  : "/giris?next=/oda-arama-ilani-olustur"
              }
              className="block hover:text-orange-600 transition-colors"
            >
              Oda Arama İlanı Ver
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/profil"
                  className="block hover:text-orange-600 transition-colors"
                >
                  {t("nav.profile")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block hover:text-orange-600 transition-colors text-left w-full"
                  data-testid="mobile-logout-button"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/giris"
                  className="block hover:text-orange-600 transition-colors"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/uye-ol"
                  className="block hover:text-orange-600 transition-colors"
                >
                  {t("nav.sign_up")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
