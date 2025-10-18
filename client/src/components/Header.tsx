// ODANET Revizyon — Header: Turuncu Hamburger + Mesajlar + İyileştirilmiş Mobil Menü
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Header() {
  const [pathname] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  // Close mobile menu whenever route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  // active link helper
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}?`);

  const createListingHref = isAuthenticated
    ? "/ilan-olustur"
    : "/giris?next=/ilan-olustur";
  const createSeekerHref = isAuthenticated
    ? "/oda-arama-ilani-olustur"
    : "/giris?next=/oda-arama-ilani-olustur";
  
  const messagesHref = isAuthenticated ? "/mesajlar" : "/giris?next=/mesajlar";

  return (
    <header
      className="
        sticky top-0 inset-x-0 z-50
        bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600
        text-white shadow-md
        supports-[backdrop-filter]:bg-white/10 supports-[backdrop-filter]:backdrop-blur-xl
      "
      data-testid="header"
    >
      {/* Skip link for a11y */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-indigo-700"
      >
        {t("nav.skip_to_content", "İçeriğe geç")}
      </a>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Left: Brand + desktop nav */}
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <Link href="/" data-testid="logo-link">
                <span className="block select-none text-3xl sm:text-4xl font-extrabold tracking-tight hover:opacity-90 transition-opacity cursor-pointer">
                  Odanet
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav
              className="hidden md:flex items-center gap-6"
              aria-label="Birincil"
            >
              <Link href={createListingHref}>
                <span
                  className={`
                    cursor-pointer transition-colors hover:text-white
                    ${isActive("/ilan-olustur") ? "text-white" : "text-white/90"}
                    ${isActive("/ilan-olustur") ? "underline underline-offset-4 decoration-white/50" : ""}
                  `}
                  data-testid="nav-create-listing"
                >
                  Oda İlanı Ver
                </span>
              </Link>

              <Link href={createSeekerHref}>
                <span
                  className={`
                    cursor-pointer transition-colors hover:text-white
                    ${isActive("/oda-arama-ilani-olustur") ? "text-white" : "text-white/90"}
                    ${isActive("/oda-arama-ilani-olustur") ? "underline underline-offset-4 decoration-white/50" : ""}
                  `}
                  data-testid="nav-create-seeker"
                >
                  Oda Arama İlanı Ver
                </span>
              </Link>
            </nav>
          </div>

          {/* Right: actions - Consistent for all users */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Favorites: Always visible */}
            <Link href={isAuthenticated ? "/favoriler" : "/giris?next=/favoriler"} data-testid="favorites-link">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("nav.favorites", "Favoriler")}
                className="
                  rounded-full h-10 w-10 sm:h-10 sm:w-10
                  bg-gradient-to-br from-[#FF3B30] to-[#FF7A00]
                  hover:from-[#FF2820] hover:to-[#FF6A00]
                  text-white shadow-md ring-1 ring-white/30
                "
              >
                <Heart
                  className="h-5 w-5"
                  strokeWidth={2.5}
                  fill="currentColor"
                />
                <span className="sr-only">
                  {t("nav.favorites", "Favoriler")}
                </span>
              </Button>
            </Link>

            {/* Messages: Always visible */}
            <Link href={messagesHref} data-testid="messages-link">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("nav.messages", "Mesajlar")}
                className="rounded-full h-10 w-10 bg-violet-100 text-violet-600 hover:bg-violet-200 shadow-md"
              >
                <MessageSquare className="h-5 w-5" strokeWidth={2.5} />
                <span className="sr-only">
                  {t("nav.messages", "Mesajlar")}
                </span>
              </Button>
            </Link>

            {/* Desktop: Auth-specific buttons */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/profil" data-testid="profile-link">
                  <Button
                    variant="outline"
                    className="bg-white text-indigo-700 border-white hover:bg-indigo-50 font-medium"
                  >
                    {t("nav.profile", "Profil")}
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="bg-white text-indigo-700 border-white hover:bg-indigo-50 font-medium"
                  onClick={handleLogout}
                  data-testid="logout-button"
                >
                  {t("nav.logout", "Çıkış Yap")}
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/giris" data-testid="login-link">
                  <Button
                    variant="outline"
                    className="bg-white text-indigo-700 border-white hover:bg-indigo-50 font-medium"
                  >
                    {t("nav.login", "Giriş Yap")}
                  </Button>
                </Link>
                <Link href="/uye-ol" data-testid="signup-link">
                  <Button className="bg-white text-indigo-700 hover:bg-indigo-100 font-semibold">
                    {t("nav.sign_up", "Üye Ol")}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle - Always visible */}
            <Button
              variant="ghost"
              size="icon"
              className={`
                md:hidden rounded-full p-2 transition-all duration-300
                ${isMobileMenuOpen ? "bg-white text-indigo-700" : "bg-white/20 hover:bg-white/30 text-white"}
              `}
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={
                isMobileMenuOpen
                  ? t("nav.close_menu", "Menüyü kapat")
                  : t("nav.open_menu", "Menüyü aç")
              }
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

      {/* Mobile Menu - Always available for all users */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-white/20 bg-gradient-to-b from-violet-50 via-fuchsia-50 to-indigo-50 text-gray-800"
          data-testid="mobile-menu"
        >
          <div className="px-4 py-4 space-y-2">
            {/* Favoriler - İkonlu */}
            <Link href={isAuthenticated ? "/favoriler" : "/giris?next=/favoriler"}>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-orange-100/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 text-[#f97316]">
                  <Heart className="h-5 w-5" fill="currentColor" />
                </div>
                <span className="font-medium">{t("nav.favorites", "Favoriler")}</span>
              </div>
            </Link>

            {/* Mesajlar - İkonlu */}
            <Link href={messagesHref}>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-violet-100/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-50 text-violet-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="font-medium">{t("nav.messages", "Mesajlar")}</span>
              </div>
            </Link>

            {/* Oda İlanı Ver */}
            <Link href={createListingHref}>
              <div className="block rounded-lg px-3 py-2.5 hover:bg-indigo-100/50 transition-colors cursor-pointer font-medium">
                Oda İlanı Ver
              </div>
            </Link>

            {/* Oda Arama İlanı Ver */}
            <Link href={createSeekerHref}>
              <div className="block rounded-lg px-3 py-2.5 hover:bg-fuchsia-100/50 transition-colors cursor-pointer font-medium">
                Oda Arama İlanı Ver
              </div>
            </Link>

            {/* Auth-specific menu items */}
            {isAuthenticated ? (
              <>
                {/* Profil */}
                <Link href="/profil">
                  <div className="block rounded-lg px-3 py-2.5 hover:bg-violet-100/50 transition-colors cursor-pointer font-medium">
                    {t("nav.profile", "Profil")}
                  </div>
                </Link>

                {/* Çıkış Yap */}
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2.5 text-left hover:bg-red-100/50 transition-colors font-medium text-red-600"
                  data-testid="mobile-logout-button"
                >
                  {t("nav.logout", "Çıkış Yap")}
                </button>
              </>
            ) : (
              <>
                {/* Giriş Yap */}
                <Link href="/giris">
                  <div className="block rounded-lg px-3 py-2.5 hover:bg-indigo-100/50 transition-colors cursor-pointer font-medium">
                    {t("nav.login", "Giriş Yap")}
                  </div>
                </Link>

                {/* Üye Ol */}
                <Link href="/uye-ol">
                  <div className="block rounded-lg px-3 py-2.5 hover:bg-fuchsia-100/50 transition-colors cursor-pointer font-medium">
                    {t("nav.sign_up", "Üye Ol")}
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
