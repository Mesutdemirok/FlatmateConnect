import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export type Seeker = {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  gender?: string;
  age?: number | string;
  budget?: number | string;
  preferredAreas?: string[];
  smokingPreference?: string;
  petPreference?: string;
  bio?: string;
};

async function fetchSeekers(token?: string): Promise<Seeker[]> {
  const base =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://www.odanet.com.tr/api";

  const url = `${base}/users/seekers`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  // ✅ Add Authorization if token available
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { headers });

  if (res.status === 401 || res.status === 403) {
    console.log("❌ Unauthorized: Token required to access seekers.");
    return [];
  }

  if (!res.ok) {
    const text = await res.text();
    console.log("❌ Seekers fetch failed:", res.status, text);
    throw new Error(`Seekers request failed: ${res.status}`);
  }

  const json = await res.json();

  // Detect the correct key
  const seekers =
    json.seekers || json.data?.seekers || json.data || json.results || [];

  if (!Array.isArray(seekers)) {
    console.log("⚠️ Unexpected seekers structure:", json);
    return [];
  }

  console.log(`✅ Loaded ${seekers.length} seekers`);
  return seekers.map((s: any) => ({
    id: String(s.id ?? s._id ?? "unknown"),
    user: {
      firstName: s.user?.firstName || s.firstName || "Kullanıcı",
      lastName: s.user?.lastName || s.lastName || "",
    },
    gender: s.gender,
    age: s.age,
    budget: s.budgetMonthly || s.budget,
    preferredAreas: s.preferredAreas || [s.preferredLocation],
    smokingPreference: s.smokingPreference,
    petPreference: s.petPreference,
    bio: s.bio,
    createdAt: s.createdAt, // ✅ Preserve createdAt for unified feed sorting
    updatedAt: s.updatedAt,
    slug: s.slug,
    fullName: s.fullName,
    profilePhotoUrl: s.profilePhotoUrl,
  }));
}

export function useSeekers() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["seekers"],
    queryFn: () => fetchSeekers(token),
    enabled: !!token, // ✅ only run when logged in
  });
}
