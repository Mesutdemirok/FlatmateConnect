import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { trackPageView } from "@/lib/analytics";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import SeekerList from "@/pages/SeekerList";
import ListingDetail from "@/pages/ListingDetail";
import SeekerDetail from "@/pages/SeekerDetail";
import CreateListing from "@/pages/CreateListing";
import EditListing from "@/pages/EditListing";
import CreateSeekerProfile from "@/pages/CreateSeekerProfile";
import Profile from "@/pages/Profile";
import Messages from "@/pages/Messages";
import Auth from "@/pages/Auth";
import Hakkimizda from "@/pages/hakkimizda";
import Iletisim from "@/pages/iletisim";
import KullanimKosullari from "@/pages/kullanim-kosullari";
import IlanYayinlamaKurallari from "@/pages/ilan-yayinlama-kurallari";
import GizlilikPolitikasi from "@/pages/GizlilikPolitikasi";
import CerezPolitikasi from "@/pages/cerez-politikasi";
import YardimMerkezi from "@/pages/yardim-merkezi";
import GuvenliIlanRehberi from "@/pages/guvenli-ilan-rehberi";
import "./i18n"; // Initialize i18n

function ProtectedRoute({ component: Component, ...rest }: { component: () => JSX.Element; path?: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = rest.path || location;
      navigate(`/giris?next=${encodeURIComponent(currentPath)}`);
    }
  }, [isLoading, isAuthenticated, location, navigate, rest.path]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Track pageviews on route change (Google Analytics)
  useEffect(() => {
    trackPageView(location);
  }, [location]);

  return (
    <Switch>
      {/* Auth routes - Turkish URLs - Unified auth page */}
      <Route path="/giris" component={Auth} />
      <Route path="/uye-ol" component={Auth} />
      
      {/* Home route - Same for all users */}
      <Route path="/" component={Home} />
      
      {/* Protected routes - Turkish URLs */}
      <Route path="/profil">
        <ProtectedRoute component={Profile} path="/profil" />
      </Route>
      <Route path="/mesajlar">
        <ProtectedRoute component={Messages} path="/mesajlar" />
      </Route>
      <Route path="/ilan-olustur">
        <ProtectedRoute component={CreateListing} path="/ilan-olustur" />
      </Route>
      <Route path="/ilan-duzenle/:id">
        <ProtectedRoute component={EditListing} path="/ilan-duzenle/:id" />
      </Route>
      <Route path="/oda-arama-ilani-olustur">
        <ProtectedRoute component={CreateSeekerProfile} path="/oda-arama-ilani-olustur" />
      </Route>
      
      {/* Public routes - Turkish URLs */}
      <Route path="/oda-ilanlari" component={Search} />
      <Route path="/oda-aramalari" component={SeekerList} />
      <Route path="/oda-ilani/:slug" component={ListingDetail} />
      <Route path="/oda-arayan/:slug" component={SeekerDetail} />
      
      {/* Footer pages - Static content */}
      <Route path="/hakkimizda" component={Hakkimizda} />
      <Route path="/iletisim" component={Iletisim} />
      <Route path="/kullanim-kosullari" component={KullanimKosullari} />
      <Route path="/ilan-yayinlama-kurallari" component={IlanYayinlamaKurallari} />
      <Route path="/gizlilik-politikasi" component={GizlilikPolitikasi} />
      <Route path="/cerez-politikasi" component={CerezPolitikasi} />
      <Route path="/yardim-merkezi" component={YardimMerkezi} />
      <Route path="/guvenli-ilan-rehberi" component={GuvenliIlanRehberi} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
