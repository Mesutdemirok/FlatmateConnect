import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Apple, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const platformLinks = [
    { href: "/search", label: "Browse Rooms" },
    { href: "/create-listing", label: "List a Room" },
    { href: "/how-it-works", label: "How it Works" },
    { href: "/safety", label: "Safety Tips" },
  ];

  const supportLinks = [
    { href: "/help", label: "Help Center" },
    { href: "/contact", label: "Contact Us" },
    { href: "/report", label: "Report Issue" },
    { href: "/verification", label: "Verification" },
  ];

  const legalLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
    { href: "/community", label: "Community Guidelines" },
  ];

  return (
    <footer className="bg-card border-t border-border" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="md:col-span-1">
            <Link href="/">
              <h3 className="text-2xl font-bold text-primary mb-4 cursor-pointer" data-testid="footer-logo">
                Odanet
              </h3>
            </Link>
            <p className="text-muted-foreground mb-4" data-testid="footer-description">
              Connecting people for safe, secure shared accommodation.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="social-facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="social-twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="social-instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Platform links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4" data-testid="platform-links-title">
              Platform
            </h4>
            <ul className="space-y-2">
              {platformLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`platform-link-${index}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4" data-testid="support-links-title">
              Support
            </h4>
            <ul className="space-y-2">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`support-link-${index}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4" data-testid="legal-links-title">
              Legal
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`legal-link-${index}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm" data-testid="copyright">
            &copy; {currentYear} Odanet. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-muted-foreground text-sm" data-testid="app-availability">
              Available on:
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-2"
              data-testid="ios-download"
            >
              <Apple className="h-4 w-4" />
              <span className="text-sm">iOS</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-2"
              data-testid="android-download"
            >
              <Smartphone className="h-4 w-4" />
              <span className="text-sm">Android</span>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
