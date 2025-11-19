import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe } from 'lucide-react';
import { authUtils } from '@/utils/auth';

export function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = authUtils.isAuthenticated();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    authUtils.logout();
    window.location.href = '/';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2" data-testid="link-home">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">O</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Odanet</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
              data-testid="link-nav-home"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/oda-arkadasi-ara"
              className={`text-sm font-medium transition-colors ${
                isActive('/oda-arkadasi-ara') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
              data-testid="link-find-roommate"
            >
              {t('nav.findRoommate')}
            </Link>
            <Link
              to="/oda-ilani-ver"
              className={`text-sm font-medium transition-colors ${
                isActive('/oda-ilani-ver') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
              data-testid="link-add-listing"
            >
              {t('nav.addListing')}
            </Link>

            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              data-testid="button-language-toggle"
            >
              <Globe className="w-4 h-4" />
              <span>{i18n.language.toUpperCase()}</span>
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/profil"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/profil') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                  }`}
                  data-testid="link-profile"
                >
                  {t('nav.profile')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary text-sm"
                  data-testid="button-logout"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link to="/auth/login" className="btn btn-primary text-sm" data-testid="link-login">
                {t('nav.login')}
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-gray-200">
            <Link
              to="/"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="link-mobile-home"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/oda-arkadasi-ara"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="link-mobile-roommate"
            >
              {t('nav.findRoommate')}
            </Link>
            <Link
              to="/oda-ilani-ver"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="link-mobile-listing"
            >
              {t('nav.addListing')}
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profil"
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-testid="link-mobile-profile"
                >
                  {t('nav.profile')}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  data-testid="button-mobile-logout"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link
                to="/auth/login"
                className="block px-4 py-2 text-sm font-medium text-primary-600 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-mobile-login"
              >
                {t('nav.login')}
              </Link>
            )}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 w-full"
              data-testid="button-mobile-language"
            >
              <Globe className="w-4 h-4" />
              <span>{i18n.language === 'tr' ? 'English' : 'Türkçe'}</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
