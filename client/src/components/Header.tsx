import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href="/" data-testid="logo-link">
                <h1 className="text-2xl font-bold text-primary cursor-pointer">Odanet</h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link 
                href="/search" 
                className="text-foreground hover:text-primary transition-colors"
                data-testid="nav-browse-rooms"
              >
                Browse Rooms
              </Link>
              <Link 
                href="/create-listing" 
                className="text-foreground hover:text-primary transition-colors"
                data-testid="nav-list-room"
              >
                List a Room
              </Link>
              <Link 
                href="/how-it-works" 
                className="text-foreground hover:text-primary transition-colors"
                data-testid="nav-how-it-works"
              >
                How it Works
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/favorites" data-testid="favorites-link">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/messages" data-testid="messages-link">
                  <Button variant="ghost" size="icon">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/profile" data-testid="profile-link">
                  <Button variant="outline" className="hidden sm:flex">
                    Profile
                  </Button>
                </Link>
                <a href="/api/logout" data-testid="logout-link">
                  <Button variant="outline" className="hidden sm:flex">
                    Log Out
                  </Button>
                </a>
              </>
            ) : (
              <>
                <a href="/api/login" data-testid="login-link">
                  <Button variant="outline" className="hidden sm:flex">
                    Log In
                  </Button>
                </a>
                <a href="/api/login" data-testid="signup-link">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Sign Up
                  </Button>
                </a>
              </>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={toggleMobileMenu}
              data-testid="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card" data-testid="mobile-menu">
          <div className="px-4 py-4 space-y-4">
            <Link href="/search" className="block text-foreground hover:text-primary transition-colors">
              Browse Rooms
            </Link>
            <Link href="/create-listing" className="block text-foreground hover:text-primary transition-colors">
              List a Room
            </Link>
            <Link href="/how-it-works" className="block text-foreground hover:text-primary transition-colors">
              How it Works
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/profile" className="block text-foreground hover:text-primary transition-colors">
                  Profile
                </Link>
                <a href="/api/logout" className="block text-foreground hover:text-primary transition-colors">
                  Log Out
                </a>
              </>
            ) : (
              <a href="/api/login" className="block text-foreground hover:text-primary transition-colors">
                Log In
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
