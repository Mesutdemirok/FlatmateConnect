import React from "react";
import { Helmet } from "react-helmet";

interface SEOHeadProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

const BASE_URL = "https://www.odanet.com.tr";
const DEFAULT_TITLE = "Odanet – Güvenli, kolay ve şeffaf oda & ev arkadaşı bul";
const DEFAULT_DESC =
  "Doğrulanmış profiller ve gerçek ilanlarla sana en uygun oda ya da ev arkadaşını hemen bul.";
const DEFAULT_IMAGE = `${BASE_URL}/og/og-home.jpg`;

export default function SEOHead({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  url = BASE_URL,
  image = DEFAULT_IMAGE,
}: SEOHeadProps) {
  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph (Facebook, LinkedIn) */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Odanet" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <meta name="theme-color" content="#5B21B6" />

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Odanet",
          url: "https://www.odanet.com.tr",
          logo: "https://www.odanet.com.tr/og/og-home.jpg",
          description:
            "Odanet – Güvenli, kolay ve şeffaf oda & ev arkadaşı bulma platformu.",
          address: {
            "@type": "PostalAddress",
            streetAddress:
              "Zümrütevler Mah. Ural Sk. Nas Plaza No: 24 İç Kapı No: 6",
            addressLocality: "Maltepe",
            addressRegion: "İstanbul",
            postalCode: "34844",
            addressCountry: "TR",
          },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+90-534-824-5155",
            contactType: "customer support",
            availableLanguage: "Turkish",
          },
          sameAs: [
            "https://www.instagram.com/odanet.com.tr/",
            "https://www.facebook.com/odanet.com.tr/",
            "https://www.tiktok.com/@odanet.com.tr",
            "https://www.pinterest.com/odanet_/",
            "https://www.youtube.com/@odanet_com_tr",
            "https://www.linkedin.com/company/odanet",
          ],
        })}
      </script>
    </Helmet>
  );
}
