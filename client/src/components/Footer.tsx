import { Link, useLocation } from "wouter";
import { COMPANY } from "@/lib/company";
import { FOOTER_LINKS, SOCIAL_LINKS } from "@/components/FooterLinks";
import { FaFacebook, FaInstagram, FaTiktok, FaPinterest, FaYoutube } from "react-icons/fa";

type SocialIconProps = {
  href: string;
  label: string;
  children: React.ReactNode;
};

const SocialIcon = ({ href, label, children }: SocialIconProps) => (
  <a
    href={href}
    aria-label={label}
    target="_blank"
    rel="noopener noreferrer"
    className="
      inline-flex h-10 w-10 items-center justify-center rounded-full
      bg-gray-200 text-gray-700
      transition-all duration-200
      hover:bg-indigo-600 hover:text-white hover:scale-110
      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
    "
    data-testid={`social-${label.toLowerCase().replace(/\s+/g, '-')}`}
  >
    {children}
  </a>
);

export default function Footer() {
  const [pathname] = useLocation();

  // Hide footer on messaging routes to save vertical space on mobile
  const HIDE_ON = ["/mesaj", "/mesajlar", "/messages", "/chat"];
  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  // Map social platform names to their respective icons
  const getSocialIcon = (name: string) => {
    switch (name) {
      case "TikTok":
        return <FaTiktok className="h-5 w-5" />;
      case "Facebook":
        return <FaFacebook className="h-5 w-5" />;
      case "Instagram":
        return <FaInstagram className="h-5 w-5" />;
      case "Pinterest":
        return <FaPinterest className="h-5 w-5" />;
      case "YouTube":
        return <FaYoutube className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <footer
      aria-label="Site Footer"
      className="mt-12 sm:mt-16 border-t-4 bg-gray-50"
      style={{
        borderImage: "linear-gradient(to right, rgb(79, 70, 229), rgb(124, 58, 237), rgb(192, 38, 211)) 1",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12 lg:px-8">
        {/* Brand & Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {COMPANY.brand}
          </h2>
          <p className="text-sm text-gray-700 max-w-2xl leading-relaxed">
            Odanet, güvenli oda kiralama ve ev arkadaşı bulma deneyimini Türkiye'de daha şeffaf ve kolay hale getirir.
          </p>
        </div>

        {/* Three Column Layout */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-8 mb-8">
          {FOOTER_LINKS.map((category) => (
            <div key={category.title}>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                {category.title}
              </h3>
              <ul className="space-y-2">
                {category.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <span className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors cursor-pointer">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* Social Media Icons - Centered */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 text-center">
            Sosyal Medya
          </h3>
          <div className="flex items-center justify-center gap-3">
            {SOCIAL_LINKS.map((social) => (
              <SocialIcon
                key={social.name}
                href={social.href}
                label={social.ariaLabel}
              >
                {getSocialIcon(social.name)}
              </SocialIcon>
            ))}
          </div>
        </div>

        {/* Bottom Legal Line */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} {COMPANY.legalNameShort} — Odanet Tüm Hakları Saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
