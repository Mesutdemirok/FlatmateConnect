import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { Loader } from '@/components/Loader';

export function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 IMPORTANT: SAFE BASE URL
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalı');
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/api/auth/register", {
        email,
        password,
        firstName,
        lastName,
      });

      navigate("/auth/login");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Kayıt başarısız. Lütfen tekrar deneyiniz.";

      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const pageTitle =
    i18n.language === "tr"
      ? "Kayıt Ol - Odanet"
      : "Register - Odanet";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={t("auth.signUp")} />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">O</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("auth.signUp")}
            </h1>
            <p className="text-gray-600">{t("hero.subtitle")}</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ad</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Soyad</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("auth.email")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("auth.password")}
                </label>
                <input
                  type="password"
                  value={password}
                  minLength={8}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Şifre Tekrar</label>
                <input
                  type="password"
                  value={confirmPassword}
                  minLength={8}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  required
                  disabled={isLoading}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                {isLoading ? <Loader /> : t("auth.signUp")}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              {t("auth.login")}{" "}
              <a href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
                {t("auth.login")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}