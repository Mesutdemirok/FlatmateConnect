/**
 * Converts relative image paths to absolute URLs using Cloudflare R2
 * @param path - The image path (can be relative or absolute)
 * @returns Absolute URL with the R2 CDN
 */
export function getAbsoluteImageUrl(path: string | null | undefined): string {
  // Default fallback image
  const FALLBACK = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=60";
  
  if (!path) return FALLBACK;
  
  // If already absolute URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  
  // Use R2 public URL from environment variable (with fallback)
  // Fix missing protocol if needed
  let r2BaseUrl = import.meta.env.VITE_R2_PUBLIC_URL || "";
  
  // Add https: if the URL starts with //
  if (r2BaseUrl.startsWith("//")) {
    r2BaseUrl = `https:${r2BaseUrl}`;
  }
  
  // If R2 URL is available, use it directly
  if (r2BaseUrl) {
    const cleanPath = path.replace(/^\/+/, "");
    return `${r2BaseUrl}/${cleanPath}`;
  }
  
  // Fallback: use current origin (shouldn't happen in production)
  const domain = typeof window !== 'undefined' ? window.location.origin : "https://www.odanet.com.tr";
  return `${domain}${path.startsWith("/") ? path : `/${path}`}`;
}
