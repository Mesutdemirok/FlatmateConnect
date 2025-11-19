import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { User as UserIcon, Home, Heart, MessageCircle, Settings } from 'lucide-react';
import { api } from '@/utils/api';
import { authUtils } from '@/utils/auth';
import { User } from '@/types';
import { Loader } from '@/components/Loader';
import { ErrorState } from '@/components/ErrorState';

export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      navigate('/auth/login');
      return;
    }

    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
        authUtils.setUser(userData);
      } catch (err: any) {
        setError(err.message || t('common.error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState message={error} />
      </div>
    );
  }

  const pageTitle = i18n.language === 'tr' ? 'Profilim - Odanet' : 'My Profile - Odanet';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={t('profile.title')} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-8" data-testid="text-profile-title">
            {t('profile.title')}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="card p-6">
                <div className="flex flex-col items-center text-center">
                  {user?.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt={user.fullName}
                      className="w-24 h-24 rounded-full object-cover mb-4"
                      data-testid="img-profile-picture"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                      <UserIcon className="w-12 h-12 text-primary-600" />
                    </div>
                  )}
                  <h2 className="text-xl font-semibold mb-1" data-testid="text-user-name">
                    {user?.fullName}
                  </h2>
                  <p className="text-gray-600 mb-4" data-testid="text-user-email">
                    {user?.email}
                  </p>
                  {user?.bio && (
                    <p className="text-sm text-gray-700 mb-4" data-testid="text-user-bio">
                      {user.bio}
                    </p>
                  )}
                  <button className="btn btn-secondary w-full" data-testid="button-edit-profile">
                    <Settings className="w-4 h-4 mr-2" />
                    {t('profile.settings')}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer" data-testid="card-my-listings">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Home className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{t('profile.myListings')}</h3>
                      <p className="text-gray-600 text-sm">0 {t('home.title').toLowerCase()}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{t('addListing.description')}</p>
                </div>

                <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer" data-testid="card-favorites">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{t('profile.favorites')}</h3>
                      <p className="text-gray-600 text-sm">0 {t('common.noData').toLowerCase()}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{t('profile.favorites')}</p>
                </div>

                <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer" data-testid="card-messages">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{t('profile.messages')}</h3>
                      <p className="text-gray-600 text-sm">0 {t('common.noData').toLowerCase()}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{t('profile.messages')}</p>
                </div>

                <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer" data-testid="card-settings">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{t('profile.settings')}</h3>
                      <p className="text-gray-600 text-sm">{t('profile.settings')}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{t('profile.settings')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
