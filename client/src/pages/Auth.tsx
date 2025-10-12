import { useState, useEffect } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Home, Mail, Lock, User, Phone } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(1, 'Şifre gereklidir'),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  firstName: z.string().min(1, 'Ad gereklidir'),
  lastName: z.string().min(1, 'Soyad gereklidir'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .regex(/[0-9]/, 'Şifre en az bir sayı içermelidir'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
});

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .regex(/[0-9]/, 'Şifre en az bir sayı içermelidir'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

const phoneSchema = z.object({
  phone: z.string().min(10, 'Geçerli bir telefon numarası girin'),
});

const otpSchema = z.object({
  code: z.string().length(6, 'Doğrulama kodu 6 haneli olmalıdır'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
type PhoneFormData = z.infer<typeof phoneSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

export default function Auth() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/giris');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get('tab');
  const resetToken = searchParams.get('token');
  
  const [activeTab, setActiveTab] = useState(tabParam === 'signup' ? 'signup' : 'login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(!!resetToken);
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const [showOTPVerify, setShowOTPVerify] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
  });

  // Forgot password form
  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  // Reset password form
  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  // Phone form
  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  // OTP form
  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const res = await apiRequest('POST', '/api/auth/login', data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({ title: 'Başarılı', description: 'Giriş yapıldı!' });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      navigate(data.redirect || '/profil');
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Yanlış e-posta veya şifre girdiniz.',
        variant: 'destructive',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const res = await apiRequest('POST', '/api/auth/register', data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Başarılı',
        description: data.message || 'Kayıt işlemi başarıyla tamamlandı. Lütfen e-postanızı doğrulayın.',
      });
      loginForm.setValue('email', registerForm.getValues('email'));
      setActiveTab('login');
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Kayıt işlemi başarısız oldu.',
        variant: 'destructive',
      });
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      const res = await apiRequest('POST', '/api/auth/forgot-password', data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Başarılı',
        description: data.message || 'Sıfırlama bağlantısı e-posta adresinize gönderildi.',
      });
      setShowForgotPassword(false);
      forgotPasswordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'İşlem başarısız oldu.',
        variant: 'destructive',
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      const res = await apiRequest('POST', '/api/auth/reset-password', { ...data, token: resetToken });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Başarılı',
        description: data.message || 'Şifreniz güncellendi. Giriş yapabilirsiniz.',
      });
      setShowResetPassword(false);
      resetPasswordForm.reset();
      navigate('/giris');
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Geçersiz veya süresi dolmuş bağlantı. Lütfen tekrar isteyin.',
        variant: 'destructive',
      });
    },
  });

  // Request OTP mutation
  const requestOTPMutation = useMutation({
    mutationFn: async (data: PhoneFormData) => {
      const res = await apiRequest('POST', '/api/auth/phone/request-otp', data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Başarılı',
        description: data.message || 'Doğrulama kodu gönderildi.',
      });
      setPhoneNumber(phoneForm.getValues('phone'));
      setShowPhoneAuth(false);
      setShowOTPVerify(true);
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'SMS gönderimi başarısız oldu.',
        variant: 'destructive',
      });
    },
  });

  // Verify OTP mutation
  const verifyOTPMutation = useMutation({
    mutationFn: async (data: OTPFormData) => {
      const res = await apiRequest('POST', '/api/auth/phone/verify-otp', { phone: phoneNumber, code: data.code });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({ title: 'Başarılı', description: 'Telefon doğrulandı!' });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      navigate(data.redirect || '/profil');
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Geçersiz doğrulama kodu.',
        variant: 'destructive',
      });
    },
  });

  // Google auth mutation
  const googleAuthMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/google');
      return await res.json();
    },
    onSuccess: (data) => {
      toast({ title: 'Başarılı', description: 'Google ile giriş yapıldı!' });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      navigate(data.redirect || '/profil');
    },
    onError: (error: any) => {
      toast({
        title: 'Bilgi',
        description: error.message || 'Google doğrulaması başarısız. Lütfen tekrar deneyin.',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 via-violet-600 to-fuchsia-600 py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="max-w-md mx-auto mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-white/90 transition-colors" data-testid="link-home">
          <Home className="h-5 w-5" />
          <span>Ana Sayfa</span>
        </Link>
      </div>

      {/* Auth Card */}
      <div className="max-w-md mx-auto bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-white/30 p-6 sm:p-8">
        {/* Welcome Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Odanet'e Hoş Geldiniz</h1>
          <p className="text-slate-600">Gerçek profillerle güvenle eşleşin.</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" data-testid="tab-login">Giriş Yap</TabsTrigger>
            <TabsTrigger value="signup" data-testid="tab-signup">Üye Ol</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="ornek@email.com"
                    className="pl-10"
                    {...loginForm.register('email')}
                    data-testid="input-login-email"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Şifre</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...loginForm.register('password')}
                    data-testid="input-login-password"
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={loginForm.watch('rememberMe')}
                    onCheckedChange={(checked) => loginForm.setValue('rememberMe', checked as boolean)}
                    data-testid="checkbox-remember-me"
                  />
                  <Label htmlFor="remember-me" className="text-sm cursor-pointer">Beni Hatırla</Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-indigo-600 hover:text-indigo-700 p-0"
                  onClick={() => setShowForgotPassword(true)}
                  data-testid="button-forgot-password"
                >
                  Şifremi Unuttum?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">veya</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => googleAuthMutation.mutate()}
                  data-testid="button-google-login"
                >
                  <FcGoogle className="mr-2 h-5 w-5" />
                  Google ile Giriş Yap
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowPhoneAuth(true)}
                  data-testid="button-phone-login"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Telefon ile Giriş Yap
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup">
            <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-firstname">Ad</Label>
                  <Input
                    id="signup-firstname"
                    placeholder="Adınız"
                    {...registerForm.register('firstName')}
                    data-testid="input-signup-firstname"
                  />
                  {registerForm.formState.errors.firstName && (
                    <p className="text-sm text-red-600">{registerForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-lastname">Soyad</Label>
                  <Input
                    id="signup-lastname"
                    placeholder="Soyadınız"
                    {...registerForm.register('lastName')}
                    data-testid="input-signup-lastname"
                  />
                  {registerForm.formState.errors.lastName && (
                    <p className="text-sm text-red-600">{registerForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="ornek@email.com"
                    className="pl-10"
                    {...registerForm.register('email')}
                    data-testid="input-signup-email"
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-red-600">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Şifre</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...registerForm.register('password')}
                    data-testid="input-signup-password"
                  />
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Şifre Tekrar</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...registerForm.register('confirmPassword')}
                    data-testid="input-signup-confirm-password"
                  />
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                disabled={registerMutation.isPending}
                data-testid="button-signup"
              >
                {registerMutation.isPending ? 'Kaydediliyor...' : 'Üye Ol'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>

      {/* Forgot Password Modal */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Şifremi Unuttum</DialogTitle>
            <DialogDescription>
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={forgotPasswordForm.handleSubmit((data) => forgotPasswordMutation.mutate(data))} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">E-posta</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="ornek@email.com"
                {...forgotPasswordForm.register('email')}
                data-testid="input-forgot-email"
              />
              {forgotPasswordForm.formState.errors.email && (
                <p className="text-sm text-red-600">{forgotPasswordForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowForgotPassword(false)}
                data-testid="button-cancel-forgot"
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={forgotPasswordMutation.isPending}
                data-testid="button-submit-forgot"
              >
                {forgotPasswordMutation.isPending ? 'Gönderiliyor...' : 'Gönder'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Şifre Belirle</DialogTitle>
            <DialogDescription>
              Yeni şifrenizi girin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={resetPasswordForm.handleSubmit((data) => resetPasswordMutation.mutate(data))} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">Yeni Şifre</Label>
              <Input
                id="reset-password"
                type="password"
                placeholder="••••••••"
                {...resetPasswordForm.register('password')}
                data-testid="input-reset-password"
              />
              {resetPasswordForm.formState.errors.password && (
                <p className="text-sm text-red-600">{resetPasswordForm.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-confirm-password">Yeni Şifre Tekrar</Label>
              <Input
                id="reset-confirm-password"
                type="password"
                placeholder="••••••••"
                {...resetPasswordForm.register('confirmPassword')}
                data-testid="input-reset-confirm-password"
              />
              {resetPasswordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-600">{resetPasswordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowResetPassword(false);
                  navigate('/giris');
                }}
                data-testid="button-cancel-reset"
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={resetPasswordMutation.isPending}
                data-testid="button-submit-reset"
              >
                {resetPasswordMutation.isPending ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Phone Auth Modal */}
      <Dialog open={showPhoneAuth} onOpenChange={setShowPhoneAuth}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Telefon ile Giriş</DialogTitle>
            <DialogDescription>
              Telefon numaranızı girin, size SMS ile doğrulama kodu gönderelim.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={phoneForm.handleSubmit((data) => requestOTPMutation.mutate(data))} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon Numarası</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+90 5XX XXX XX XX"
                {...phoneForm.register('phone')}
                data-testid="input-phone"
              />
              {phoneForm.formState.errors.phone && (
                <p className="text-sm text-red-600">{phoneForm.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowPhoneAuth(false)}
                data-testid="button-cancel-phone"
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={requestOTPMutation.isPending}
                data-testid="button-submit-phone"
              >
                {requestOTPMutation.isPending ? 'Gönderiliyor...' : 'Kod Gönder'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* OTP Verify Modal */}
      <Dialog open={showOTPVerify} onOpenChange={setShowOTPVerify}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Doğrulama Kodu</DialogTitle>
            <DialogDescription>
              {phoneNumber} numarasına gönderilen 6 haneli kodu girin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={otpForm.handleSubmit((data) => verifyOTPMutation.mutate(data))} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp-code">Doğrulama Kodu</Label>
              <Input
                id="otp-code"
                type="text"
                placeholder="000000"
                maxLength={6}
                {...otpForm.register('code')}
                data-testid="input-otp-code"
              />
              {otpForm.formState.errors.code && (
                <p className="text-sm text-red-600">{otpForm.formState.errors.code.message}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowOTPVerify(false);
                  setShowPhoneAuth(true);
                }}
                data-testid="button-back-otp"
              >
                Geri
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={verifyOTPMutation.isPending}
                data-testid="button-verify-otp"
              >
                {verifyOTPMutation.isPending ? 'Doğrulanıyor...' : 'Doğrula'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
