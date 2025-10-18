import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const GA = process.env.NEXT_PUBLIC_GA_ID ?? "G-ME5ES9KLDE"; // fallback so it ALWAYS loads

  return (
    <html lang="tr">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA}', { send_page_view: false });
        `}</Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
