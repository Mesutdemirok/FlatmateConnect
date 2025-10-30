import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { LogIn, UserPlus, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Auth() {
  const [, navigate] = useLocation();
  const { login, register, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Register state
  const [registerFormData, setRegisterFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  // Get next path from URL params
  const params = new URLSearchParams(window.location.search);
  const nextPath = params.get('next') || '/profil';

  // Default tab based on URL
  const [activeTab, setActiveTab] = useState<string>(
    window.location.pathname === '/uye-ol' ? 'register' : 'login'
  );

  // Redirect authenticated users to /profil
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/profil');
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);

    try {
      await login(loginEmail, loginPassword);
      const userName = loginEmail.split('@')[0];
      toast({
        title: t('auth.login_success'),
        description: `Hoş geldiniz, ${userName}!`,
      });
      navigate(nextPath);
    } catch (error: any) {
      toast({
        title: t('auth.login_failed'),
        description: error.message || t('auth.invalid_credentials'),
        variant: "destructive",
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterFormData({
      ...registerFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerFormData.password !== registerFormData.confirmPassword) {
      toast({
        title: t('auth.password_mismatch'),
        description: t('auth.password_mismatch_description'),
        variant: "destructive",
      });
      return;
    }

    if (registerFormData.password.length < 8) {
      toast({
        title: t('auth.password_too_short'),
        description: t('auth.password_min_length'),
        variant: "destructive",
      });
      return;
    }

    setIsRegisterLoading(true);

    try {
      await register({
        email: registerFormData.email,
        password: registerFormData.password,
        firstName: registerFormData.firstName,
        lastName: registerFormData.lastName,
      });
      toast({
        title: t('auth.registration_success'),
        description: t('auth.welcome'),
      });
      navigate(nextPath);
    } catch (error: any) {
      toast({
        title: t('auth.registration_failed'),
        description: error.message || t('auth.registration_error'),
        variant: "destructive",
      });
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Store next path in sessionStorage for OAuth callback
    if (nextPath && nextPath !== '/profil') {
      sessionStorage.setItem('oauth_next_path', nextPath);
    }
    // Redirect to Google OAuth endpoint with next parameter
    const next = encodeURIComponent(nextPath);
    window.location.href = `/api/oauth/google/redirect?next=${next}`;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-md mx-auto">
          {/* Back to home link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            data-testid="link-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana sayfaya geri dön
          </Link>

          <Card className="w-full">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold text-center">
                Odanet'e Hoş Geldiniz
              </CardTitle>
              <CardDescription className="text-center text-base">
                Güvenli ve kolay oda arama deneyimi
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Google Login Button - Prominent position */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 md:h-12 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                onClick={handleGoogleLogin}
                data-testid="button-google-auth"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google ile devam et
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">veya e-posta ile</span>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
                    data-testid="tab-login"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Giriş Yap
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
                    data-testid="tab-register"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Üye Ol
                  </TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login" className="space-y-4 mt-0">
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t('auth.email')}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="ornek@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="w-full"
                        data-testid="input-login-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t('auth.password')}</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full"
                        data-testid="input-login-password"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      disabled={isLoginLoading}
                      data-testid="button-login-submit"
                    >
                      {isLoginLoading ? t('auth.logging_in') : t('auth.login')}
                    </Button>
                  </form>
                </TabsContent>

                {/* Register Form */}
                <TabsContent value="register" className="space-y-4 mt-0">
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{t('auth.first_name')}</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={registerFormData.firstName}
                          onChange={handleRegisterChange}
                          required
                          className="w-full"
                          data-testid="input-firstname"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{t('auth.last_name')}</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={registerFormData.lastName}
                          onChange={handleRegisterChange}
                          required
                          className="w-full"
                          data-testid="input-lastname"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">{t('auth.email')}</Label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="ornek@email.com"
                        value={registerFormData.email}
                        onChange={handleRegisterChange}
                        required
                        className="w-full"
                        data-testid="input-register-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">{t('auth.password')}</Label>
                      <Input
                        id="register-password"
                        name="password"
                        type="password"
                        value={registerFormData.password}
                        onChange={handleRegisterChange}
                        required
                        minLength={8}
                        className="w-full"
                        data-testid="input-register-password"
                      />
                      <p className="text-xs text-muted-foreground">{t('auth.password_requirements')}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t('auth.confirm_password')}</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={registerFormData.confirmPassword}
                        onChange={handleRegisterChange}
                        required
                        minLength={8}
                        className="w-full"
                        data-testid="input-confirm-password"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      disabled={isRegisterLoading}
                      data-testid="button-register-submit"
                    >
                      {isRegisterLoading ? t('auth.registering') : t('auth.sign_up')}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
