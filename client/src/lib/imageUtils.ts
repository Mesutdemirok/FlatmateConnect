/**
 * Converts relative image paths to absolute URLs for production compatibility
 * @param path - The image path (can be relative or absolute)
 * @returns Absolute URL with the production domain
 */
export function getAbsoluteImageUrl(path: string | null | undefined): string {
  // Default fallback image
  const FALLBACK = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=60";
  
  if (!path) return FALLBACK;
  
  // If already absolute URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  
  // If relative path, prepend production domain
  // This ensures images work both in preview (.replit.dev) and production (www.odanet.com.tr)
  const domain = "https://www.odanet.com.tr";
  return `${domain}${path.startsWith("/") ? path : `/${path}`}`;
}
