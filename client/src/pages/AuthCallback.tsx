import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [, navigate] = useLocation();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      // Check URL for error parameters
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');
      
      if (error) {
        console.error('OAuth error:', error);
        navigate('/auth?error=' + error);
        return;
      }

      // Wait a moment for cookie to be set
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh auth state
      await refreshUser();

      // Restore next path from sessionStorage
      const nextPath = sessionStorage.getItem('oauth_next_path');
      if (nextPath) {
        sessionStorage.removeItem('oauth_next_path');
        navigate(nextPath);
      } else {
        // Default to profile page
        navigate('/profil');
      }
    };

    handleCallback();
  }, [navigate, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Giriş Yapılıyor...</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground text-center">
            Google hesabınızla giriş yapılıyor, lütfen bekleyin.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
