"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
declare global {
  interface Window {
    gtag?: (...a: any[]) => void;
  }
}

export default function GAListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    const GA = process.env.NEXT_PUBLIC_GA_ID ?? "G-ME5ES9KLDE";
    const query = searchParams?.toString();
    const page_path = query ? `${pathname}?${query}` : pathname;
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("config", GA, {
        page_path,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [pathname, searchParams]);
  return null;
}
