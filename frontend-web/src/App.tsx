import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { trackPageView } from "@/lib/analytics";

// 🧭 Pages
import NotFound from "@/pages/not-found";
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
import AuthCallback from "@/pages/AuthCallback";
import BlogList from "@/pages/BlogList";
import BlogPost from "@/pages/BlogPost";
import Hakkimizda from "@/pages/hakkimizda";
import Iletisim from "@/pages/iletisim";
import KullanimKosullari from "@/pages/kullanim-kosullari";
import IlanYayinlamaKurallari from "@/pages/ilan-yayinlama-kurallari";
import GizlilikPolitikasi from "@/pages/GizlilikPolitikasi";
import CerezPolitikasi from "@/pages/cerez-politikasi";
import YardimMerkezi from "@/pages/yardim-merkezi";
import GuvenliIlanRehberi from "@/pages/guvenli-ilan-rehberi";

import "./i18n"; // 🌐 Initialize translations

/* ---------------------------------------------------------
   🔒 Protected Route Wrapper
--------------------------------------------------------- */
function ProtectedRoute({
  component: Component,
  path,
}: {
  component: () => JSX.Element;
  path?: string;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = path || location;
      navigate(`/giris?next=${encodeURIComponent(currentPath)}`);
    }
  }, [isLoading, isAuthenticated, location, navigate, path]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Yükleniyor...
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <Component />;
}

/* ---------------------------------------------------------
   🌐 Main Router
--------------------------------------------------------- */
function Router() {
  const [location] = useLocation();

  // Google Analytics pageview tracking
  useEffect(() => {
    trackPageView(location);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  return (
    <Switch>
      {/* Authentication Routes */}
      <Route path="/giris" component={Auth} />
      <Route path="/uye-ol" component={Auth} />
      <Route path="/auth" component={Auth} />
      <Route path="/auth/register" component={Auth} />
      <Route path="/auth/callback" component={AuthCallback} />

      {/* Public Pages */}
      <Route path="/" component={Home} />
      <Route path="/oda-ilanlari" component={Search} />
      <Route path="/oda-aramalari" component={SeekerList} />
      <Route path="/oda-ilani/:slug" component={ListingDetail} />
      <Route path="/oda-arayan/:slug" component={SeekerDetail} />

      {/* Protected User Pages */}
      <Route path="/profil">
        <ProtectedRoute component={Profile} path="/profil" />
      </Route>
      <Route path="/mesajlar">
        <ProtectedRoute component={Messages} path="/mesajlar" />
      </Route>
      <Route path="/mesajlar/:userId">
        <ProtectedRoute component={Messages} path="/mesajlar/:userId" />
      </Route>

      {/* ✅ Listing Creation Pages */}
      <Route path="/ilan-olustur">
        <ProtectedRoute component={CreateListing} path="/ilan-olustur" />
      </Route>
      <Route path="/oda-ilani-olustur">
        <ProtectedRoute component={CreateListing} path="/oda-ilani-olustur" />
      </Route>
      <Route path="/ilan-duzenle/:id">
        <ProtectedRoute component={EditListing} path="/ilan-duzenle/:id" />
      </Route>

      {/* ✅ Seeker (Room Search) Creation */}
      <Route path="/oda-arama-ilani-olustur">
        <ProtectedRoute
          component={CreateSeekerProfile}
          path="/oda-arama-ilani-olustur"
        />
      </Route>

      {/* Blog Routes */}
      <Route path="/blog" component={BlogList} />
      <Route path="/blog/:slug" component={BlogPost} />

      {/* Static Info Pages */}
      <Route path="/hakkimizda" component={Hakkimizda} />
      <Route path="/iletisim" component={Iletisim} />
      <Route path="/kullanim-kosullari" component={KullanimKosullari} />
      <Route
        path="/ilan-yayinlama-kurallari"
        component={IlanYayinlamaKurallari}
      />
      <Route path="/gizlilik-politikasi" component={GizlilikPolitikasi} />
      <Route path="/cerez-politikasi" component={CerezPolitikasi} />
      <Route path="/yardim-merkezi" component={YardimMerkezi} />
      <Route path="/guvenli-ilan-rehberi" component={GuvenliIlanRehberi} />

      {/* 404 Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

/* ---------------------------------------------------------
   🌍 Root App Wrapper
--------------------------------------------------------- */
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
