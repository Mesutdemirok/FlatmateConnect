import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <span className="text-xl font-bold text-white">Odanet</span>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              {t('hero.subtitle')}
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t('nav.home')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-white transition-colors" data-testid="link-footer-home">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/oda-arkadasi-ara" className="text-sm hover:text-white transition-colors" data-testid="link-footer-roommate">
                  {t('nav.findRoommate')}
                </Link>
              </li>
              <li>
                <Link to="/oda-ilani-ver" className="text-sm hover:text-white transition-colors" data-testid="link-footer-listing">
                  {t('nav.addListing')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.about')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors" data-testid="link-footer-about">
                  {t('footer.about')}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors" data-testid="link-footer-contact">
                  {t('footer.contact')}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors" data-testid="link-footer-terms">
                  {t('footer.terms')}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors" data-testid="link-footer-privacy">
                  {t('footer.privacy')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <p className="text-sm text-gray-400 text-center" data-testid="text-copyright">
            {t('footer.copyright').replace('2024', currentYear.toString())}
          </p>
        </div>
      </div>
    </footer>
  );
}
