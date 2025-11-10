// ✅ Unified feed: Fetches real seekers data from live Odanet backend
import { useQuery } from "@tanstack/react-query";

// Unified Seeker type that matches SeekerCard
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

function normalizeSeekers(raw: any): Seeker[] {
  try {
    // 1️⃣ Handle arrays or common wrappers
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.seekers)) return raw.seekers;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.items)) return raw.items;

    // 2️⃣ Handle object maps (keyed by id)
    if (raw && typeof raw === "object") {
      const values = Object.values(raw) as any[];
      if (Array.isArray(values) && values.length > 0) return values;
    }
  } catch (_) {
    /* ignore */
  }
  return [];
}

async function fetchSeekers(): Promise<Seeker[]> {
  const base =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://www.odanet.com.tr";

  const url = `${base}/api/users/seekers`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });

  if (!res.ok) {
    const text = await res.text();
    console.log("❌ /seekers failed:", res.status, text);
    throw new Error(`Seekers request failed: ${res.status}`);
  }

  const json = await res.json();
  const rawSeekers = normalizeSeekers(json);

  // 3️⃣ Normalize to match SeekerCard fields
  const safe: Seeker[] = rawSeekers.map((s: any, idx: number) => {
    const fullName =
      s.fullName ||
      s.name ||
      s.displayName ||
      `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() ||
      "Kullanıcı";

    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ");

    return {
      id: String(s.id ?? s._id ?? `seeker-${idx}`),
      type: "seeker", // ✅ Explicit type for UnifiedCard type guard
      user: {
        firstName: firstName || "Kullanıcı",
        lastName: lastName || "",
      },
      gender: s.gender || s.genderPreference || "",
      age:
        s.age ||
        s.agePreference ||
        s.agePreferenceMin ||
        s.agePreferenceMax ||
        "",
      budget: s.budgetMonthly || s.budget || s.price || "",
      preferredAreas:
        s.preferredAreas || (s.preferredLocation ? [s.preferredLocation] : []),
      smokingPreference:
        s.smokingPreference === true || s.smokingPreference === "evet"
          ? "evet"
          : s.smokingPreference === false || s.smokingPreference === "hayir"
            ? "hayir"
            : "",
      petPreference:
        s.petPreference === true || s.petPreference === "evet"
          ? "evet"
          : s.petPreference === false || s.petPreference === "hayir"
            ? "hayir"
            : "",
      bio: s.bio || s.description || "",
      // ✅ Preserve metadata for chronological sorting and navigation
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      slug: s.slug,
      fullName: fullName,
      profilePhotoUrl: s.profilePhotoUrl || s.profilePhoto || s.avatar,
    };
  });

  console.log(`✅ Seekers normalized: ${safe.length}`);
  if (safe.length > 0) console.log("🧩 First seeker:", safe[0]);
  else console.log("⚠️ No valid seekers found. Raw payload:", json);

  return safe;
}

export function useSeekers() {
  const q = useQuery({
    queryKey: ["seekers"],
    queryFn: fetchSeekers,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  return {
    data: Array.isArray(q.data) ? q.data : [],
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
