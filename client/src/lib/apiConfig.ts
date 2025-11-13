/**
 * Get the API base URL from environment variable
 * Falls back to relative path in development when using same-origin setup
 */
export function getApiUrl(path: string = ''): string {
  const apiBase = import.meta.env.VITE_API_URL || '';
  
  // If no API URL configured, use relative path (same-origin)
  if (!apiBase) {
    const result = path.startsWith('/') ? path : `/${path}`;
    console.log(`🔧 getApiUrl('${path}') => '${result}' (same-origin)`);
    return result;
  }
  
  // Ensure apiBase doesn't end with /
  const base = apiBase.replace(/\/$/, '');
  
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  const result = `${base}${cleanPath}`;
  console.log(`🔧 getApiUrl('${path}') => '${result}' (external API)`);
  return result;
}
