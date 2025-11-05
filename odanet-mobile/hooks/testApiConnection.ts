import Constants from 'expo-constants';

const API_URL = (Constants.expoConfig?.extra as any)?.apiUrl;

export async function testApiConnection() {
  try {
    const res = await fetch(`${API_URL}/listings`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    console.log(`✅ API Connected: ${data.length} listings fetched`);
    return data;
  } catch (err: any) {
    console.error("❌ API Unreachable:", err.message);
    throw err;
  }
}
