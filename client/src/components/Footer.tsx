import { Link, useLocation } from "wouter";
import { COMPANY } from "@/lib/company";
import { FOOTER_LINKS, SOCIAL_LINKS } from "@/components/FooterLinks";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

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
      inline-flex h-9 w-9 items-center justify-center rounded-full
      bg-gray-200 text-gray-600
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
      case "Facebook":
        return <FaFacebook className="h-4 w-4" />;
      case "Instagram":
        return <FaInstagram className="h-4 w-4" />;
      case "X":
        return <FaXTwitter className="h-4 w-4" />;
      case "LinkedIn":
        return <FaLinkedin className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <footer
      aria-label="Site Footer"
      className="mt-12 sm:mt-16 border-t-4 border-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-gray-50"
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
          <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
            Odanet, güvenli oda kiralama ve ev arkadaşı bulma deneyimini Türkiye'de daha şeffaf ve kolay hale getirir.
          </p>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {FOOTER_LINKS.map((category) => (
            <div key={category.title}>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                {category.title}
              </h3>
              <ul className="space-y-2">
                {category.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <span className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer">
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

        {/* Social Media Icons */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Sosyal Medya
          </h3>
          <div className="flex items-center gap-3">
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
          <p className="text-center text-xs text-gray-500">
            © 2025 {COMPANY.legalNameShort} — Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
