import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { api } from '@/utils/api';
import { authUtils } from '@/utils/auth';
import { Loader } from '@/components/Loader';

export function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.login({ email, password });
      authUtils.setToken(response.token);
      authUtils.setUser(response.user);
      navigate('/profil');
    } catch (err: any) {
      setError(err.message || t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const pageTitle = i18n.language === 'tr'
    ? 'Giriş Yap - Odanet'
    : 'Login - Odanet';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={t('auth.login')} />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">O</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-login-title">
              {t('auth.login')}
            </h1>
            <p className="text-gray-600">{t('hero.subtitle')}</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" data-testid="error-login">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  required
                  disabled={isLoading}
                  data-testid="input-email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.password')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  required
                  disabled={isLoading}
                  data-testid="input-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
                data-testid="button-submit-login"
              >
                {isLoading ? <Loader message="" /> : t('auth.login')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700" data-testid="link-forgot-password">
                {t('auth.forgotPassword')}
              </a>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              {t('auth.noAccount')}{' '}
              <a href="/auth/register" className="text-primary-600 hover:text-primary-700 font-medium" data-testid="link-signup">
                {t('auth.signUp')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
