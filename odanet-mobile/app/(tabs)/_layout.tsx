import { Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getToken } from "../../lib/auth";

export default function TabsLayout() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const t = await getToken();
      if (!t) router.replace("/(auth)/login");
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "İlanlar" }} />
      <Tabs.Screen name="search" options={{ title: "Arama" }} />
      <Tabs.Screen name="messages" options={{ title: "Mesajlar" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
    </Tabs>
  );
}
