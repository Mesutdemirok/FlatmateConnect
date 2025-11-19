import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { MapPin, Home } from 'lucide-react';
import { api } from '@/utils/api';
import { authUtils } from '@/utils/auth';
import { Listing } from '@/types';
import { Carousel } from '@/components/Carousel';
import { Loader } from '@/components/Loader';
import { ErrorState } from '@/components/ErrorState';

export function ListingDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContactLoading, setIsContactLoading] = useState(false);

  const fetchListing = async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getListingBySlug(slug);
      setListing(data);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [slug]);

  const handleContact = async () => {
    if (!authUtils.isAuthenticated()) {
      navigate('/auth/login');
      return;
    }

    if (!listing) return;

    setIsContactLoading(true);
    try {
      await api.contactOwner(listing.id, 'I am interested in your listing');
      alert(t('auth.loginSuccess'));
    } catch (err: any) {
      alert(err.message || t('common.error'));
    } finally {
      setIsContactLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState message={error || t('common.error')} onRetry={fetchListing} />
      </div>
    );
  }

  const location = [listing.neighborhood, listing.district, listing.city].filter(Boolean).join(', ');
  const pageTitle = i18n.language === 'tr'
    ? `${listing.title} - Odanet`
    : `${listing.title} - Odanet`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={listing.description || listing.title} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={listing.description || listing.title} />
        <meta property="og:type" content="article" />
        {listing.images && listing.images.length > 0 && (
          <meta property="og:image" content={listing.images[0]} />
        )}
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container py-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-primary-600 hover:text-primary-700 font-medium"
            data-testid="button-back"
          >
            ← {t('common.back')}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {listing.images && listing.images.length > 0 ? (
                <Carousel images={listing.images} alt={listing.title} />
              ) : (
                <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <Home className="w-16 h-16 text-gray-400" />
                </div>
              )}

              <div className="card mt-6 p-6">
                <h1 className="text-3xl font-bold mb-4" data-testid="text-listing-title">
                  {listing.title}
                </h1>

                <div className="flex items-center gap-2 text-gray-600 mb-6">
                  <MapPin className="w-5 h-5" />
                  <span data-testid="text-listing-location">{location}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {listing.propertyType && (
                    <div>
                      <p className="text-sm text-gray-600">{t('listing.propertyType')}</p>
                      <p className="font-semibold" data-testid="text-property-type">{listing.propertyType}</p>
                    </div>
                  )}
                  {listing.totalRooms && (
                    <div>
                      <p className="text-sm text-gray-600">{t('listing.totalRooms')}</p>
                      <p className="font-semibold" data-testid="text-total-rooms">{listing.totalRooms}</p>
                    </div>
                  )}
                  {listing.bathroomType && (
                    <div>
                      <p className="text-sm text-gray-600">{t('listing.bathroomType')}</p>
                      <p className="font-semibold" data-testid="text-bathroom-type">{listing.bathroomType}</p>
                    </div>
                  )}
                  {listing.furnishingStatus && (
                    <div>
                      <p className="text-sm text-gray-600">{t('listing.furnishing')}</p>
                      <p className="font-semibold" data-testid="text-furnishing">{listing.furnishingStatus}</p>
                    </div>
                  )}
                  {listing.totalOccupants && (
                    <div>
                      <p className="text-sm text-gray-600">{t('listing.roommates')}</p>
                      <p className="font-semibold" data-testid="text-occupants">{listing.totalOccupants}</p>
                    </div>
                  )}
                  {listing.availableFrom && (
                    <div>
                      <p className="text-sm text-gray-600">{t('listing.availability')}</p>
                      <p className="font-semibold" data-testid="text-availability">
                        {new Date(listing.availableFrom).toLocaleDateString(i18n.language)}
                      </p>
                    </div>
                  )}
                </div>

                {listing.description && (
                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-semibold mb-4">{t('listing.details')}</h2>
                    <p className="text-gray-700 whitespace-pre-wrap" data-testid="text-description">
                      {listing.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-20">
                <div className="mb-6">
                  <p className="text-3xl font-bold text-primary-600" data-testid="text-rent-amount">
                    ₺{listing.rentAmount.toLocaleString('tr-TR')}
                    <span className="text-lg font-normal text-gray-600">{t('listing.month')}</span>
                  </p>
                </div>

                <button
                  onClick={handleContact}
                  className="btn btn-primary w-full mb-4"
                  disabled={isContactLoading}
                  data-testid="button-contact"
                >
                  {isContactLoading ? (
                    <Loader message="" />
                  ) : authUtils.isAuthenticated() ? (
                    t('listing.contactOwner')
                  ) : (
                    t('listing.login')
                  )}
                </button>

                {listing.user && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold mb-2">{t('listing.contactOwner')}</h3>
                    <p className="text-gray-600" data-testid="text-owner-name">{listing.user.fullName}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
