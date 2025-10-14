import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Header() {
  const [location] = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  // Glass button (kept for non-orange icons)
  const iconBtn =
    "bg-white/10 hover:bg-white/20 text-white rounded-full ring-1 ring-white/15 hover:ring-white/25 " +
    "shadow-sm transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/40";

  // Red-orange solid pill for Message + Menu + Üye Ol
  const iconBtnOrange =
    "bg-orange-600 hover:bg-orange-500 text-white rounded-full ring-1 ring-white/20 " +
    "shadow-sm transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/40";

  const messagesHref = isAuthenticated ? "/mesajlar" : "/giris?next=/mesajlar";
  const toggleMobileMenu = () => setIsMobileMenuOpen((s) => !s);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <header
      data-testid="header"
      className="sticky top-0 z-50 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 text-white shadow-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: brand + desktop nav */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link
                href="/"
                data-testid="logo-link"
                className="flex items-center"
              >
                {/* ALL-CAPS, thinner white text logo */}
                <span
                  className="
                    uppercase font-semibold tracking-tight leading-none select-none
                    text-white drop-shadow-sm
                    text-[1.85rem] sm:text-[2.05rem] md:text-[2.2rem]
                  "
                  // a slightly different sans family feel without adding webfonts
                  style={{
                    fontFamily:
                      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  }}
                  aria-label="Odanet"
                >
                  ODANET
                </span>
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

          {/* Right: icon buttons + auth actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && (
              <Link href="/favoriler" data-testid="favorites-link">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("nav.favorites")}
                  className={`${iconBtn} h-11 w-11`}
                >
                  <Heart
                    className="h-5 w-5"
                    strokeWidth={2.5}
                    fill="currentColor"
                  />
                </Button>
              </Link>
            )}

            {/* MESSAGE = red-orange pill */}
            <Link href={messagesHref} data-testid="messages-link">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("nav.messages")}
                className={`${iconBtnOrange} h-11 w-11`}
              >
                <MessageSquare className="h-5 w-5" strokeWidth={2.5} />
              </Button>
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/profil" data-testid="profile-link">
                  <Button
                    variant="outline"
                    className="hidden sm:flex bg-white text-indigo-700 border-white hover:bg-white/90 font-medium"
                  >
                    {t("nav.profile")}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="hidden sm:flex bg-white text-indigo-700 border-white hover:bg-white/90 font-medium"
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
                    className="hidden sm:flex bg-white text-indigo-700 border-white hover:bg-white/90 font-semibold"
                  >
                    Giriş Yap
                  </Button>
                </Link>
                {/* ÜYE OL = red-orange solid */}
                <Link href="/uye-ol" data-testid="signup-link">
                  <Button className="bg-orange-600 hover:bg-orange-500 text-white font-semibold">
                    Üye Ol
                  </Button>
                </Link>
              </>
            )}

            {/* MENU = red-orange pill */}
            <Button
              variant="ghost"
              size="icon"
              className={`${iconBtnOrange} md:hidden h-11 w-11`}
              onClick={toggleMobileMenu}
              data-testid="mobile-menu-toggle"
              aria-label="Menü"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (purple) */}
      {isMobileMenuOpen && (
        <div
          data-testid="mobile-menu"
          className="md:hidden bg-gradient-to-b from-indigo-700 via-indigo-600 to-violet-600 border-t border-white/10 text-white"
        >
          <div className="px-4 py-4 space-y-4">
            <Link
              href={
                isAuthenticated ? "/ilan-olustur" : "/giris?next=/ilan-olustur"
              }
              className="block hover:opacity-90 transition-opacity"
            >
              Oda İlanı Ver
            </Link>
            <Link
              href={
                isAuthenticated
                  ? "/oda-arama-ilani-olustur"
                  : "/giris?next=/oda-arama-ilani-olustur"
              }
              className="block hover:opacity-90 transition-opacity"
            >
              Oda Arama İlanı Ver
            </Link>
            <Link
              href={messagesHref}
              className="block hover:opacity-90 transition-opacity"
            >
              {t("nav.messages")}
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/profil"
                  className="block hover:opacity-90 transition-opacity"
                >
                  {t("nav.profile")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block hover:opacity-90 transition-opacity text-left w-full"
                  data-testid="mobile-logout-button"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/giris"
                  className="block hover:opacity-90 transition-opacity"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/uye-ol"
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold transition"
                >
                  Üye Ol
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
