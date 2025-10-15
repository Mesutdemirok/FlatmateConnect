import React from "react";
import { COMPANY } from "@/lib/company";
import { Facebook, Instagram, MessageCircle, Mail } from "lucide-react";

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
    rel="noopener noreferrer"
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

export default function Footer() {
  return (
    <footer className="mt-16 bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Brand + Address */}
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight">
              {COMPANY.brand}
            </h3>
            <p className="mt-2 text-white/90">
              {COMPANY.brand}, {COMPANY.legalName} şirketine aittir.
            </p>

            {/* Structured address for SEO */}
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

          {/* Quick links */}
          <nav className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Bağlantılar
            </p>
            <ul className="space-y-2 text-white/90">
              <li>
                <a className="hover:opacity-90" href="/oda-ilani-ver">
                  Oda İlanı Ver
                </a>
              </li>
              <li>
                <a className="hover:opacity-90" href="/oda-arama-ilani-ver">
                  Oda Arama İlanı Ver
                </a>
              </li>
              <li>
                <a className="hover:opacity-90" href="/profil">
                  Profilim
                </a>
              </li>
              <li>
                <a className="hover:opacity-90" href="/yardim">
                  Yardım &amp; Destek
                </a>
              </li>
            </ul>
          </nav>

          {/* Social (dark orange only) */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Sosyal
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Social href="https://instagram.com/odanet" label="Instagram">
                <Instagram className="h-5 w-5" />
              </Social>
              <Social href="https://facebook.com/odanet" label="Facebook">
                <Facebook className="h-5 w-5" />
              </Social>
              <Social href={`${COMPANY.site}/iletisim`} label="İletişim">
                <MessageCircle className="h-5 w-5" />
              </Social>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-6 text-center text-sm text-white/80">
          © {new Date().getFullYear()} {COMPANY.brand}. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
