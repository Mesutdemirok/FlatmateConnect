import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
                <a className="block select-none">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight hover:opacity-90 transition-opacity">
                    Odanet
                  </span>
                </a>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav
              className="hidden md:flex items-center gap-6"
              aria-label="Birincil"
            >
              <Link href={createListingHref}>
                <a
                  className={`
                    transition-colors hover:text-white
                    ${isActive("/ilan-olustur") ? "text-white" : "text-white/90"}
                    ${isActive("/ilan-olustur") ? "underline underline-offset-4 decoration-white/50" : ""}
                  `}
                  data-testid="nav-create-listing"
                >
                  Oda İlanı Ver
                </a>
              </Link>

              <Link href={createSeekerHref}>
                <a
                  className={`
                    transition-colors hover:text-white
                    ${isActive("/oda-arama-ilani-olustur") ? "text-white" : "text-white/90"}
                    ${isActive("/oda-arama-ilani-olustur") ? "underline underline-offset-4 decoration-white/50" : ""}
                  `}
                  data-testid="nav-create-seeker"
                >
                  Oda Arama İlanı Ver
                </a>
              </Link>
            </nav>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* Favorites: dark orange / red pill */}
                <Link href="/favoriler" data-testid="favorites-link">
                  <a aria-label={t("nav.favorites", "Favoriler")}>
                    <Button
                      variant="ghost"
                      size="icon"
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
                  </a>
                </Link>

                {/* Messages */}
                <Link href="/mesajlar" data-testid="messages-link">
                  <a aria-label={t("nav.messages", "Mesajlar")}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-10 w-10 bg-white/15 text-white hover:bg-white/25"
                    >
                      <MessageSquare className="h-5 w-5" strokeWidth={2.5} />
                      <span className="sr-only">
                        {t("nav.messages", "Mesajlar")}
                      </span>
                    </Button>
                  </a>
                </Link>

                {/* Profile + Logout (desktop) */}
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/profil" data-testid="profile-link">
                    <a>
                      <Button
                        variant="outline"
                        className="bg-white text-indigo-700 border-white hover:bg-indigo-50 font-medium"
                      >
                        {t("nav.profile", "Profil")}
                      </Button>
                    </a>
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
              </>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/giris" data-testid="login-link">
                    <a>
                      <Button
                        variant="outline"
                        className="bg-white text-indigo-700 border-white hover:bg-indigo-50 font-medium"
                      >
                        {t("nav.login", "Giriş Yap")}
                      </Button>
                    </a>
                  </Link>
                  <Link href="/uye-ol" data-testid="signup-link">
                    <a>
                      <Button className="bg-white text-indigo-700 hover:bg-indigo-100 font-semibold">
                        {t("nav.sign_up", "Üye Ol")}
                      </Button>
                    </a>
                  </Link>
                </div>
              </>
            )}

            {/* Mobile Menu Button */}
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-white/20 bg-gradient-to-b from-orange-100 to-amber-50 text-gray-800"
          data-testid="mobile-menu"
        >
          <div className="px-4 py-4 space-y-4">
            <Link href={createListingHref}>
              <a className="block rounded-md px-2 py-2 hover:bg-orange-200/50 transition-colors">
                Oda İlanı Ver
              </a>
            </Link>

            <Link href={createSeekerHref}>
              <a className="block rounded-md px-2 py-2 hover:bg-orange-200/50 transition-colors">
                Oda Arama İlanı Ver
              </a>
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/profil">
                  <a className="block rounded-md px-2 py-2 hover:bg-orange-200/50 transition-colors">
                    {t("nav.profile", "Profil")}
                  </a>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-md px-2 py-2 text-left hover:bg-orange-200/50 transition-colors"
                  data-testid="mobile-logout-button"
                >
                  {t("nav.logout", "Çıkış Yap")}
                </button>
              </>
            ) : (
              <>
                <Link href="/giris">
                  <a className="block rounded-md px-2 py-2 hover:bg-orange-200/50 transition-colors">
                    {t("nav.login", "Giriş Yap")}
                  </a>
                </Link>
                <Link href="/uye-ol">
                  <a className="block rounded-md px-2 py-2 hover:bg-orange-200/50 transition-colors">
                    {t("nav.sign_up", "Üye Ol")}
                  </a>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
