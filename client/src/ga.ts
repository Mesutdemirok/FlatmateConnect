// Google Analytics integration wrapper
import { trackPageView } from "./lib/analytics";

export function sendPageView() {
  if (typeof window !== "undefined") {
    trackPageView(window.location.pathname + window.location.search);
  }
}
