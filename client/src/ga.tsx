// GA ID (use env if present; fallback keeps things working)
export const GA_ID = (import.meta as any).env?.VITE_GA_ID || "G-ME5ES9KLDE";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function sendPageView(path?: string) {
  if (
    typeof window === "undefined" ||
    typeof window.gtag !== "function" ||
    !GA_ID
  )
    return;
  const page_path = path ?? location.pathname + location.search;
  window.gtag("config", GA_ID, {
    page_path,
    page_location: location.href,
    page_title: document.title,
  });
}
