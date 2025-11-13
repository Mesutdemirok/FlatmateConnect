import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getToken } from "./auth";

// 🔥 Correct backend API base for Production (Final)
const BACKEND_API_BASE = "https://www.odanet.com.tr/api";

// --- Helper: Build clean URL ---
function buildUrl(path: string): string {
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return `${BACKEND_API_BASE}/${clean}`;
}

// --- Helper: Throw if Response is not OK ---
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// --- Helper: Auth headers ---
export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }
  return {};
}

// --- API request wrapper ---
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
  };

  if (data) {
    headers["Content-Type"] = "application/json";
  }

  const fullUrl = buildUrl(url);

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// --- Query function used by react-query ---
type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey.join("/");
    const fullUrl = buildUrl(path);

    const res = await fetch(fullUrl, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// --- Query Client instance ---
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
