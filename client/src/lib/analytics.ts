// Google Analytics 4 tracking functions

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Track page views
export function trackPageView(path: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", "G-ME5ES9KLDE", {
      page_path: path,
    });
  }
}

// Track custom events
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
}

// Predefined event trackers
export const analytics = {
  // Auth events
  trackLogin: () => trackEvent("login", { method: "replit_auth" }),
  trackSignUp: () => trackEvent("sign_up", { method: "replit_auth" }),
  trackLogout: () => trackEvent("logout"),

  // Listing events
  trackViewListing: (listingId: string, listingType: string) =>
    trackEvent("view_item", {
      item_id: listingId,
      item_category: listingType,
    }),
  trackCreateListing: (listingType: string) =>
    trackEvent("create_listing", {
      listing_type: listingType,
    }),
  trackEditListing: (listingId: string) =>
    trackEvent("edit_listing", {
      listing_id: listingId,
    }),
  trackDeleteListing: (listingId: string) =>
    trackEvent("delete_listing", {
      listing_id: listingId,
    }),

  // Seeker profile events
  trackViewSeekerProfile: (seekerId: string) =>
    trackEvent("view_seeker_profile", {
      seeker_id: seekerId,
    }),
  trackCreateSeekerProfile: () =>
    trackEvent("create_seeker_profile"),

  // Search events
  trackSearch: (searchQuery: string, filters?: Record<string, any>) =>
    trackEvent("search", {
      search_term: searchQuery,
      ...filters,
    }),

  // Message events
  trackSendMessage: (recipientType: "listing_owner" | "seeker") =>
    trackEvent("send_message", {
      recipient_type: recipientType,
    }),

  // Favorite events
  trackAddFavorite: (itemId: string, itemType: "listing" | "seeker") =>
    trackEvent("add_to_favorites", {
      item_id: itemId,
      item_type: itemType,
    }),
  trackRemoveFavorite: (itemId: string, itemType: "listing" | "seeker") =>
    trackEvent("remove_from_favorites", {
      item_id: itemId,
      item_type: itemType,
    }),

  // Profile events
  trackUpdateProfile: () => trackEvent("update_profile"),

  // Share events
  trackShare: (contentType: "listing" | "seeker", platform?: string) =>
    trackEvent("share", {
      content_type: contentType,
      method: platform || "unknown",
    }),
};
