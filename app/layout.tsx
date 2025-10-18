// app/layout.tsx
import Script from "next/script";
import type { Metadata } from "next";
import GAListener from "./ga-listener";

export const metadata: Metadata = {
  title: "Odanet",
  description:
    "Türkiye’nin güvenli oda kiralama ve ev arkadaşı bulma platformu.",
  // optional but good for SEO; set your canonical host
  metadataBase: new URL("https://www.odanet.com.tr"),
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const GA = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="tr">
      <head>
        {/* GA tag loads once globally */}
        {GA && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                // We will send SPA page views ourselves:
                gtag('config', '${GA}', { send_page_view: false });
              `}
            </Script>
          </>
        )}
      </head>
      <body>
        {/* Sends a page_view on every client-side route change */}
        <GAListener />
        {children}
      </body>
    </html>
  );
}
