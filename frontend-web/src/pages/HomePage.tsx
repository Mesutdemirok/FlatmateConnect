import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { Search } from 'lucide-react';
import { api } from '@/utils/api';
import { FeedItem } from '@/types';
import { ListingCard } from '@/components/ListingCard';
import { Loader } from '@/components/Loader';
import { ErrorState } from '@/components/ErrorState';

export function HomePage() {
  const { t, i18n } = useTranslation();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFeed = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getFeed();
      setFeed(data);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const filteredFeed = feed.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    if (item.type === 'listing') {
      return (
        item.title?.toLowerCase().includes(query) ||
        item.city?.toLowerCase().includes(query) ||
        item.district?.toLowerCase().includes(query) ||
        item.neighborhood?.toLowerCase().includes(query)
      );
    }

    return (
      item.displayName?.toLowerCase().includes(query) ||
      item.preferredLocation?.toLowerCase().includes(query)
    );
  });

  /* -----------------------------
     SEO Title + Description
  ------------------------------*/
  const pageTitle =
    i18n.language === 'tr'
      ? 'Odanet – Yeni Nesil Oda ve Ev Arkadaşı Arama Deneyimi'
      : 'Odanet – Next-Generation Room & Flatmate Search Experience';

  const pageDescription =
    i18n.language === 'tr'
      ? 'Odanet, Türkiye’nin en güvenilir olan oda ve - ev arkadaşı bulma platformudur. Doğrulanmış ilanlar, güvenli iletişim ve şeffaf bilgilerle aradığınız uyumlu yaşam arkadaşını bulun.'
      : 'Odanet is Turkey’s most trusted platform for finding rooms and flatmates. Verified listings, safe communication, and transparent information to help you find the perfect match.';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="min-h-screen flex flex-col">

        {/* -------------------------------- HERO -------------------------------- */}
        <header className="bg-gradient-to-br from-red-600 to-red-800 text-white py-20 md:py-28 shadow-xl">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow">
                {i18n.language === 'tr'
                  ? 'Yeni Nesil Oda ve Ev Arkadaşı Arama Deneyimi'
                  : 'A New Generation of Room & Flatmate Search'}
              </h1>

              <p className="text-lg md:text-xl text-red-100 opacity-90">
                {i18n.language === 'tr'
                  ? 'Türkiye’de güvenilir, şeffaf ve modern bir oda arama deneyimi.'
                  : 'A modern, transparent, and trusted room search experience in Turkey.'}
              </p>

              {/* SEARCH BOX */}
              <div className="bg-white rounded-xl p-3 flex items-center shadow-2xl">
                <Search className="w-6 h-6 text-gray-400 ml-3" />
                <input
                  type="text"
                  placeholder={t('hero.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 text-gray-900 outline-none"
                  data-testid="input-search"
                />
                <button className="btn btn-primary ml-2" data-testid="button-search">
                  {t('hero.searchButton')}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* -------------------------------- FEED -------------------------------- */}
        <section className="container mx-auto px-4 py-16 flex-1">
          <h2 className="text-3xl md:text-4xl font-bold mb-10">
            {t('home.title')}
          </h2>

          {isLoading && <Loader />}
          {error && <ErrorState message={error} onRetry={fetchFeed} />}

          {!isLoading && !error && filteredFeed.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {t('home.noListings')}
              </p>
            </div>
          )}

          {!isLoading && !error && filteredFeed.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredFeed.map((item) => (
                <ListingCard key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}