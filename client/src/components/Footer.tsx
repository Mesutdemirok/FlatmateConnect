import React from "react";
import { COMPANY } from "@/lib/company";
import { Facebook, Instagram, MessageCircle, Mail } from "lucide-react";

type SocialProps = {
  href: string;
  label: string;
  size?: number; // tailwind size token (10 -> h-10 w-10)
  children: React.ReactNode;
};

const Social = ({ href, label, size = 10, children }: SocialProps) => (
  <a
    href={href}
    aria-label={label}
    target="_blank"
    rel="noopener noreferrer"
    className={[
      "inline-flex items-center justify-center rounded-full",
      "bg-orange-600 text-white ring-1 ring-white/10",
      "transition hover:bg-orange-700 hover:ring-white/20",
      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500",
      `h-${size} w-${size}`, // dynamic size
    ].join(" ")}
  >
    {children}
  </a>
);

export default function Footer() {
  return (
    <footer className="mt-10 bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Brand + Address + Social */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Brand + Legal */}
          <div>
            <h3 className="text-xl font-extrabold tracking-tight">
              {COMPANY.brand}
            </h3>
            <p className="mt-1 text-white/90 text-sm leading-relaxed">
              {COMPANY.brand},{" "}
              <span className="font-medium">
                MESTOK BİLİŞİM VE E-TİCARET ANONİM ŞİRKETİ
              </span>{" "}
              bünyesindedir.
            </p>

            {/* Structured address for SEO */}
            <address
              className="not-italic mt-3 text-white/90 text-sm leading-relaxed"
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
                className="mt-2 inline-flex items-center gap-2 underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                <Mail className="h-4 w-4" />
                {COMPANY.email}
              </a>
            </address>
          </div>

          {/* Quick links (title removed as requested) */}
          <nav className="flex md:justify-center">
            <ul className="space-y-1 text-white/90 text-sm">
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

          {/* Social */}
          <div className="md:justify-self-end">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
              Sosyal
            </p>
            <div className="mt-2 flex items-center gap-3">
              <Social href="https://instagram.com/odanet" label="Instagram">
                <Instagram className="h-5 w-5" />
              </Social>

              {/* Updated Facebook link */}
              <Social
                href="https://www.facebook.com/odanet"
                label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Social>

              {/* Emphasize contact (slightly larger button) */}
              <Social
                href={`${COMPANY.site}/iletisim`}
                label="İletişim"
                size={11}
              >
                <MessageCircle className="h-5 w-5" />
              </Social>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-white/15 pt-4 text-center text-xs text-white/80">
          © {new Date().getFullYear()} {COMPANY.brand}. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
