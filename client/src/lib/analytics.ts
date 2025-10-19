// Google Analytics 4 - Event Tracking Helper
// GA Measurement ID: G-ME5ES9KLDE

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Safe wrapper for gtag function
const gtag = (...args: any[]) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
};

// ✅ Manual pageview tracking (for SPA routing with Wouter)
export const trackPageView = (url: string) => {
  gtag("config", "G-ME5ES9KLDE", {
    page_path: url,
    page_location: window.location.href,
    page_title: document.title,
  });
};

// ✅ User registration (Üye Ol)
export const trackSignup = (method: string = "email") => {
  gtag("event", "sign_up", { method });
};

// ✅ User login (Giriş Yap)
export const trackLogin = (method: string = "email") => {
  gtag("event", "login", { method });
};

// ✅ Create new room listing (Oda İlanı Ver)
export const trackCreateListing = () => {
  gtag("event", "click_ilan_ekle", {
    event_category: "Listing",
    event_label: "Oda İlanı Ver",
  });
};

// ✅ Send message (Mesaj Gönder)
export const trackMessageSend = () => {
  gtag("event", "message_send", {
    event_category: "Messaging",
    event_label: "User sent message",
  });
};

// ✅ Search action (Oda Arama)
export const trackSearch = (searchValue: string) => {
  gtag("event", "search", {
    search_term: searchValue,
    event_category: "Search",
  });
};

// ✅ Generic custom event tracker
export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  gtag("event", eventName, params);
};
