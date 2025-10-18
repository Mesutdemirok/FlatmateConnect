import React from "react";
import { COMPANY } from "@/lib/company";
import { Facebook, Instagram, MessageCircle, Mail } from "lucide-react";
import { Link, useLocation } from "wouter";

type SocialProps = {
  href: string;
  label: string;
  children: React.ReactNode;
};

const Social = ({ href, label, children }: SocialProps) => (
  <a
    href={href}
    aria-label={label}
    target="_blank"
    rel="noopener noreferrer me"
    className="
      inline-flex h-10 w-10 items-center justify-center rounded-full
      bg-orange-600 text-white ring-1 ring-white/10
      transition hover:bg-orange-700 hover:ring-white/20
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500
    "
  >
    {children}
  </a>
);

// Simple helper for internal (SPA) links
const InternalLink = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => (
  <Link href={to}>
    <a className="hover:opacity-90 focus:outline-none focus:underline">
      {children}
    </a>
  </Link>
);

export default function Footer() {
  const [pathname] = useLocation();

  // Hide footer on messaging routes to save vertical space on mobile
  const HIDE_ON = ["/mesaj", "/mesajlar", "/messages", "/chat"];
  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <footer
      role="contentinfo"
      className="mt-12 sm:mt-16 bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:px-8">
        {/* Brand + Links + Social */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand & Address */}
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight">
              {COMPANY.brand}
            </h3>
            <p className="mt-2 text-white/90">
              {COMPANY.brand}, {COMPANY.legalName} şirketine aittir.
            </p>

            <address
              className="not-italic mt-4 text-white/90 leading-relaxed"
              itemScope
              itemType="https://schema.org/PostalAddress"
            >
              <span itemProp="streetAddress">{COMPANY.street}</span>
              <br />
              <span itemProp="addressLocality">{COMPANY.district}</span> /{" "}
              <span itemProp="addressRegion">{COMPANY.city}</span>
              <br />
              <span itemProp="addressCountry">{COMPANY.country}</span>
              <br />
              <a
                href={`mailto:${COMPANY.email}`}
                className="mt-2 inline-flex items-center gap-2 text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                <Mail className="h-4 w-4" />
                {COMPANY.email}
              </a>
            </address>
          </div>

          {/* Quick links (SPA internal links) */}
          <nav aria-label="Alt menü bağlantıları" className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Bağlantılar
            </p>
            <ul
              className="
                space-y-2 text-white/90
                sm:grid sm:grid-cols-2 sm:gap-y-2 sm:gap-x-6 sm:space-y-0
              "
            >
              <li>
                <InternalLink to="/ilan-olustur">Oda İlanı Ver</InternalLink>
              </li>
              <li>
                <InternalLink to="/oda-arama-ilani-olustur">
                  Oda Arama İlanı Ver
                </InternalLink>
              </li>
              <li>
                <InternalLink to="/oda-ilanlari">Oda İlanları</InternalLink>
              </li>
              <li>
                <InternalLink to="/oda-aramalari">Oda Arayanlar</InternalLink>
              </li>
              <li className="sm:col-span-2">
                <InternalLink to="/profil">Profilim</InternalLink>
              </li>
            </ul>
          </nav>

          {/* Social (dark orange only) */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Sosyal
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Social
                href="https://www.instagram.com/odanet.com.tr/"
                label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Social>
              <Social
                href="https://www.facebook.com/odanet.com.tr/"
                label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Social>
              <Social href={`${COMPANY.site}/iletisim`} label="İletişim">
                <MessageCircle className="h-5 w-5" />
              </Social>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/15 pt-5 text-center text-sm text-white/80">
          © {new Date().getFullYear()} {COMPANY.brand}. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
