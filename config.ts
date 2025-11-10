/**
 * Centralized API Configuration for Odanet Platform
 * Used by both web (Vite) and mobile (Expo) frontends
 */

export const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://www.odanet.com.tr"
    : process.env.API_URL || "http://localhost:5000";

/**
 * Normalize image URLs to absolute paths
 * @param imagePath - Relative or absolute image path
 * @returns Full absolute URL to the image
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return "";
  }

  // Already absolute URL
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Relative path - prepend API base
  const baseUrl = API_URL.replace(/\/api$/, ""); // Remove /api suffix if present
  return `${baseUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
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
