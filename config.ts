// 🌍 Global API configuration for Odanet (shared by web + mobile)
export const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://www.odanet.com.tr"
    : "http://localhost:5000";

/**
 * Simple deterministic hash function for string distribution
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * 🖼️ Ensures consistent absolute image URLs across platforms
 * Adds dynamic fallback photos for seekers without uploaded images.
 * 
 * @param path - Image path (relative or absolute)
 * @param type - Content type for fallback selection
 * @param id - Unique ID for deterministic fallback selection
 */
export function getImageUrl(
  path?: string | null, 
  type: "listing" | "seeker" = "listing", 
  id?: string
): string {
  // Already absolute URL
  if (path && (path.startsWith("http://") || path.startsWith("https://"))) {
    return path;
  }

  // Relative path - normalize to absolute
  if (path) {
    const baseUrl = API_URL.replace(/\/api$/, ""); // Remove /api suffix if present
    return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  }

  // Generate unique fallback photos based on seeker ID hash (ensures variety)
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

  // Default fallback for listings or when no ID provided
  return type === "seeker" 
    ? "https://cdn.odanet.com.tr/placeholders/seeker1.jpg"
    : "https://cdn.odanet.com.tr/placeholders/listing-default.jpg";
}

/**
 * Get API endpoint URL
 * @param path - API endpoint path (e.g., '/listings' or 'listings')
 * @returns Full API URL
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const apiBase = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;
  return `${apiBase}${cleanPath}`;
}
