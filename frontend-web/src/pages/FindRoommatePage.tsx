import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { Search } from 'lucide-react';
import { api } from '@/utils/api';
import { Loader } from '@/components/Loader';
import { ErrorState } from '@/components/ErrorState';

export function FindRoommatePage() {
  const { t, i18n } = useTranslation();
  const [seekers, setSeekers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSeekers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getSeekers();
      setSeekers(data);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeekers();
  }, []);

  const filteredSeekers = seekers.filter((seeker) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      seeker.fullName?.toLowerCase().includes(query) ||
      seeker.preferredLocation?.toLowerCase().includes(query)
    );
  });

  const pageTitle = i18n.language === 'tr'
    ? 'Oda Arkadaşı Ara - Odanet'
    : 'Find Roommate - Odanet';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={t('findRoommate.description')} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-red-600 to-red-800 text-white py-12">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-roommate-title">
              {t('findRoommate.title')}
            </h1>
            <p className="text-lg text-red-100 mb-6">{t('findRoommate.description')}</p>
            <div className="bg-white rounded-lg p-2 flex items-center shadow-lg max-w-2xl">
              <Search className="w-5 h-5 text-gray-400 ml-3" />
              <input
                type="text"
                placeholder={t('hero.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 text-gray-900 outline-none"
                data-testid="input-search-roommate"
              />
            </div>
          </div>
        </section>

        <section className="container py-12">
          {isLoading && <Loader />}

          {error && <ErrorState message={error} onRetry={fetchSeekers} />}

          {!isLoading && !error && filteredSeekers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600" data-testid="text-no-results">
                {t('findRoommate.noResults')}
              </p>
            </div>
          )}

          {!isLoading && !error && filteredSeekers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSeekers.map((seeker) => (
                <div
                  key={seeker.id}
                  className="card p-6 hover:shadow-md transition-shadow"
                  data-testid={`card-seeker-${seeker.id}`}
                >
                  <h3 className="font-semibold text-lg mb-2" data-testid={`text-seeker-name-${seeker.id}`}>
                    {seeker.fullName}
                  </h3>
                  {seeker.preferredLocation && (
                    <p className="text-sm text-gray-600 mb-2" data-testid={`text-seeker-location-${seeker.id}`}>
                      {seeker.preferredLocation}
                    </p>
                  )}
                  {seeker.budgetMonthly && (
                    <p className="text-lg font-bold text-primary-600" data-testid={`text-seeker-budget-${seeker.id}`}>
                      ₺{parseFloat(seeker.budgetMonthly).toLocaleString('tr-TR')}
                      <span className="text-sm font-normal text-gray-600">{t('common.perMonth')}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
