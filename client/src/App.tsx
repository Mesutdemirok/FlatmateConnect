import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import ListingDetail from "@/pages/ListingDetail";
import CreateListing from "@/pages/CreateListing";
import Profile from "@/pages/Profile";
import Messages from "@/pages/Messages";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import "./i18n"; // Initialize i18n

function ProtectedRoute({ component: Component, ...rest }: { component: () => JSX.Element; path?: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  if (!isAuthenticated) {
    const currentPath = rest.path || location;
    navigate(`/auth/login?next=${encodeURIComponent(currentPath)}`);
    return null;
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      
      {/* Home route - Landing or Home based on auth */}
      {isLoading ? (
        <Route path="/">
          <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>
        </Route>
      ) : !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Route path="/" component={Home} />
      )}
      
      {/* Protected routes */}
      <Route path="/profile">
        <ProtectedRoute component={Profile} path="/profile" />
      </Route>
      <Route path="/messages">
        <ProtectedRoute component={Messages} path="/messages" />
      </Route>
      <Route path="/create-listing">
        <ProtectedRoute component={CreateListing} path="/create-listing" />
      </Route>
      
      {/* Public routes */}
      <Route path="/search" component={Search} />
      <Route path="/listing/:id" component={ListingDetail} />
      
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
