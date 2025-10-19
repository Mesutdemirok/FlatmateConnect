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
      bg-orange-500 text-white ring-2 ring-white/40 shadow-md shadow-orange-900/30
      transition transform hover:-translate-y-0.5 hover:scale-105
      hover:bg-orange-400 hover:ring-turquoise-400
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-turquoise-400
    "
  >
    {children}
  </a>
);

const InternalLink = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => (
  <Link href={to}>
    <span className="hover:opacity-90 focus:outline-none focus:underline cursor-pointer">
      {children}
    </span>
  </Link>
);

function Footer() {
  const [pathname] = useLocation();
  const HIDE_ON = ["/mesaj", "/mesajlar", "/messages", "/chat"];
  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <footer
      role="contentinfo"
      className="mt-12 sm:mt-16 bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand Info */}
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

          {/* Navigation */}
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

          {/* Social */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/90">
              Sosyal
            </p>
            <div className="mt-3 flex items-center gap-3">
              {/* Instagram */}
              <Social
                href="https://www.instagram.com/odanet.com.tr/"
                label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Social>

              {/* Facebook */}
              <Social
                href="https://www.facebook.com/odanet.com.tr/"
                label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Social>

              {/* TikTok */}
              <Social
                href="https://www.tiktok.com/@odanet.com.tr"
                label="TikTok"
              >
                <svg
                  viewBox="0 0 48 48"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M33.9 12.3c-1.9 0-3.8-.6-5.3-1.6v13.2c0 5.7-4.6 10.3-10.3 10.3-2 0-3.8-.6-5.4-1.5v-6.2c1.6 1.1 3.5 1.7 5.5 1.7 2.9 0 5.3-2.4 5.3-5.3V9.5h5.2c1.3 3.1 4.3 5.2 7.7 5.3v4.8z" />
                </svg>
              </Social>

              {/* Pinterest */}
              <Social
                href="https://www.pinterest.com/odanet_/"
                label="Pinterest"
              >
                <svg
                  viewBox="0 0 48 48"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M24 4C12.96 4 4 12.96 4 24c0 8.38 5.22 15.54 12.55 18.41-.17-1.56-.33-3.97.07-5.68.36-1.52 2.33-9.67 2.33-9.67s-.59-1.17-.59-2.89c0-2.7 1.57-4.71 3.53-4.71 1.67 0 2.48 1.26 2.48 2.77 0 1.69-1.08 4.23-1.64 6.59-.47 1.97.99 3.57 2.94 3.57 3.53 0 6.25-3.73 6.25-9.12 0-4.76-3.42-8.1-8.31-8.1-5.66 0-9 4.23-9 8.6 0 1.7.65 3.52 1.46 4.51.16.19.18.36.14.55-.15.6-.49 1.88-.56 2.14-.09.33-.29.4-.67.24-2.48-1.16-4.03-4.79-4.03-7.71 0-6.28 4.56-12.05 13.14-12.05 6.9 0 12.27 4.93 12.27 11.52 0 6.86-4.33 12.39-10.34 12.39-2.02 0-3.92-1.05-4.57-2.28l-1.25 4.77c-.45 1.73-1.67 3.9-2.48 5.22C19.23 43.84 21.56 44 24 44c11.04 0 20-8.96 20-20S35.04 4 24 4z" />
                </svg>
              </Social>

              {/* YouTube */}
              <Social
                href="https://www.youtube.com/@odanet_com_tr"
                label="YouTube"
              >
                <svg
                  viewBox="0 0 48 48"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M19 30V18l12 6-12 6zm24-12s0-4.5-.6-6.6c-.3-1.2-1.2-2.1-2.4-2.4C38 8 24 8 24 8s-14 0-16 1c-1.2.3-2.1 1.2-2.4 2.4C5 13.5 5 18 5 18s0 4.5.6 6.6c.3 1.2 1.2 2.1 2.4 2.4C10 28 24 28 24 28s14 0 16-1c1.2-.3 2.1-1.2 2.4-2.4.6-2.1.6-6.6.6-6.6z" />
                </svg>
              </Social>

              {/* Contact */}
              <Social href={`${COMPANY.site}/iletisim`} label="İletişim">
                <MessageCircle className="h-5 w-5" />
              </Social>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/20 pt-5 text-center text-sm text-white/90">
          © {new Date().getFullYear()} {COMPANY.brand}. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
