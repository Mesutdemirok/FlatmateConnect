// 🌍 Global API configuration for Odanet (shared by web + mobile)

export const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://www.odanet.com.tr"
    : "https://www.odanet.com.tr"; // Always use live API for mobile (Expo tunnel can't access localhost)

/**
 * Simple deterministic hash function for generating consistent fallback image selections
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * 🖼️ Normalizes image URLs across platforms
 * Ensures proper absolute URLs and assigns dynamic fallback placeholders.
 *
 * @param path - Relative or absolute image path
 * @param type - 'listing' | 'seeker' (used for fallback choice)
 * @param id - Unique ID for deterministic fallback selection
 */
export function getImageUrl(
  path?: string | null,
  type: "listing" | "seeker" = "listing",
  id?: string,
): string {
  // 1️⃣ Already absolute (skip processing)
  if (path && (path.startsWith("http://") || path.startsWith("https://"))) {
    return path;
  }

  // 2️⃣ Relative path — normalize to full absolute URL
  if (path) {
    const baseUrl = API_URL.replace(/\/api$/, ""); // Remove /api suffix if present
    return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  }

  // 3️⃣ Dynamic fallback for seekers
  if (type === "seeker" && id) {
    const fallbackImages = [
      "https://cdn.odanet.com.tr/placeholders/seeker1.jpg",
      "https://cdn.odanet.com.tr/placeholders/seeker2.jpg",
      "https://cdn.odanet.com.tr/placeholders/seeker3.jpg",
      "https://cdn.odanet.com.tr/placeholders/seeker4.jpg",
      "https://cdn.odanet.com.tr/placeholders/seeker5.jpg",
    ];
    const index = simpleHash(id) % fallbackImages.length;
    return fallbackImages[index];
  }

  // 4️⃣ Default placeholders
  return type === "seeker"
    ? "https://cdn.odanet.com.tr/placeholders/seeker1.jpg"
    : "https://cdn.odanet.com.tr/placeholders/listing-default.jpg";
}

/**
 * 🔗 Builds consistent API endpoint URLs for both web + mobile
 *
 * @param path - Endpoint path (e.g. '/listings' or 'seekers/public')
 * @returns Full absolute API URL
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const apiBase = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;
  return `${apiBase}${cleanPath}`;
}
