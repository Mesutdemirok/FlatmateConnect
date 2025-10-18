// src/pages/_app.tsx
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Script from "next/script";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const GA = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    const handleRoute = (url: string) => {
      if (typeof window !== "undefined" && (window as any).gtag && GA) {
        (window as any).gtag("config", GA, {
          page_path: url,
          page_location: window.location.href,
          page_title: document.title,
        });
      }
    };
    router.events.on("routeChangeComplete", handleRoute);
    return () => router.events.off("routeChangeComplete", handleRoute);
  }, [router.events, GA]);

  return (
    <>
      {GA && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            // We control SPA page views ourselves:
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { send_page_view: false });
          `}</Script>
        </>
      )}
      <Component {...pageProps} />
    </>
  );
}
