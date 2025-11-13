/**
 * Get the API base URL from environment variable
 * Falls back to relative path in development when using same-origin setup
 */
export function getApiUrl(path: string = ''): string {
  const apiBase = import.meta.env.VITE_API_URL || '';
  
  // If no API URL configured, use relative path (same-origin)
  if (!apiBase) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  
  // Ensure apiBase doesn't end with /
  const base = apiBase.replace(/\/$/, '');
  
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${base}${cleanPath}`;
}
