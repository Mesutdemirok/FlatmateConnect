import { Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#7F00FF",
          tabBarInactiveTintColor: "#666",
          tabBarStyle: {
            backgroundColor: "#fff",
            paddingBottom: 8,
            height: 65,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Ana Sayfa",
            tabBarLabel: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={22} color={color} />
            ),
            headerTitle: "Odanet",
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: "Mesajlar",
            tabBarLabel: "Messages",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubble" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: "Favoriler",
            tabBarLabel: "Favorites",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profil",
            tabBarLabel: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={22} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
