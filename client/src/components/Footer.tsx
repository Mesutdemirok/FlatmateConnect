import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Apple, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const platformLinks = [
    { href: "/search", labelKey: "footer.links.browse_rooms" },
    { href: "/create-listing", labelKey: "footer.links.list_room" },
    { href: "/how-it-works", labelKey: "footer.links.how_it_works" },
    { href: "/safety", labelKey: "footer.links.safety_tips" },
  ];

  const supportLinks = [
    { href: "/help", labelKey: "footer.links.help_center" },
    { href: "/contact", labelKey: "footer.links.contact_us" },
    { href: "/report", labelKey: "footer.links.report_issue" },
    { href: "/verification", labelKey: "footer.links.verification" },
  ];

  const legalLinks = [
    { href: "/privacy", labelKey: "footer.links.privacy_policy" },
    { href: "/terms", labelKey: "footer.links.terms_of_service" },
    { href: "/cookies", labelKey: "footer.links.cookie_policy" },
    { href: "/community", labelKey: "footer.links.community_guidelines" },
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
              {t('footer.description')}
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
              {t('footer.platform')}
            </h4>
            <ul className="space-y-2">
              {platformLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`platform-link-${index}`}
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4" data-testid="support-links-title">
              {t('footer.support')}
            </h4>
            <ul className="space-y-2">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`support-link-${index}`}
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4" data-testid="legal-links-title">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`legal-link-${index}`}
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm" data-testid="copyright">
            &copy; {currentYear} Odanet. {t('footer.all_rights_reserved')}
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-muted-foreground text-sm" data-testid="app-availability">
              {t('footer.available_on')}
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
