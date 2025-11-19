import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { authUtils } from '@/utils/auth';
import { api } from '@/utils/api';
import { Loader } from '@/components/Loader';

export function AddListingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    city: '',
    district: '',
    rentAmount: '',
    description: '',
  });

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      navigate('/auth/login');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const listingData = {
        ...formData,
        rentAmount: parseFloat(formData.rentAmount),
      };
      await api.createListing(listingData);
      navigate('/profil');
    } catch (err: any) {
      setError(err.message || t('addListing.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const pageTitle = i18n.language === 'tr'
    ? 'İlan Ver - Odanet'
    : 'Add Listing - Odanet';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={t('addListing.description')} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-add-listing-title">
            {t('addListing.title')}
          </h1>
          <p className="text-gray-600 mb-8">{t('addListing.description')}</p>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" data-testid="error-add-listing">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  İlan Başlığı
                </label>
                <input
                  id="title"
                  type="text"
                  className="input"
                  placeholder="Örn: Kadıköy'de Eşyalı Oda"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  data-testid="input-title"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    Şehir
                  </label>
                  <input
                    id="city"
                    type="text"
                    className="input"
                    placeholder="İstanbul"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    data-testid="input-city"
                  />
                </div>

                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                    İlçe
                  </label>
                  <input
                    id="district"
                    type="text"
                    className="input"
                    placeholder="Kadıköy"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    data-testid="input-district"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="rentAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Aylık Kira (₺)
                </label>
                <input
                  id="rentAmount"
                  type="number"
                  className="input"
                  placeholder="5000"
                  value={formData.rentAmount}
                  onChange={handleChange}
                  required
                  data-testid="input-rent"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  id="description"
                  className="input"
                  rows={6}
                  placeholder="İlan detaylarını yazın..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  data-testid="input-description"
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
                data-testid="button-submit-listing"
              >
                {isLoading ? <Loader message="" /> : t('addListing.submit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
