"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// (Optional) TS hint so window.gtag doesn't error in TS projects
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function GAListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const GA = process.env.NEXT_PUBLIC_GA_ID;
    if (
      !GA ||
      typeof window === "undefined" ||
      typeof window.gtag !== "function"
    )
      return;

    const query = searchParams?.toString();
    const page_path = query ? `${pathname}?${query}` : pathname;

    window.gtag("config", GA, {
      page_path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}
