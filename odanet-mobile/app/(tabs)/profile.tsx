import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCurrentUser, useLogout } from "../../hooks/useAuth";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SecondaryButton } from "../../components/SecondaryButton";

export default function ProfileScreen() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.replace("/(tabs)");
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-odanet-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-odanet-textLight">Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-odanet-background" edges={["top"]}>
        <ScrollView className="flex-1">
          <View className="px-4 py-20">
            <View className="bg-white rounded-2xl p-8 items-center shadow-md">
              <Ionicons name="person-circle-outline" size={80} color="#00A6A6" className="mb-4" />
              <Text className="text-xl font-bold text-odanet-text mb-2 text-center">
                Giriş Yap veya Üye Ol
              </Text>
              <Text className="text-sm text-odanet-textLight text-center mb-6">
                İlan vermek, mesajlaşmak ve favorilere eklemek için giriş yapın
              </Text>
              <PrimaryButton
                title="Giriş Yap"
                onPress={() => router.push("/login")}
                className="w-full mb-3"
              />
              <SecondaryButton
                title="Kayıt Ol"
                onPress={() => router.push("/login")}
                className="w-full"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-odanet-background" edges={["top"]}>
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="bg-white pt-8 pb-6 px-4 items-center border-b border-gray-200">
          <View className="w-20 h-20 rounded-full bg-odanet-primary items-center justify-center mb-3">
            <Text className="text-white text-2xl font-bold">{initials}</Text>
          </View>
          <Text className="text-xl font-bold text-odanet-text mb-1">
            {user.firstName} {user.lastName}
          </Text>
          <Text className="text-sm text-odanet-textLight">{user.email}</Text>
        </View>

        <View className="px-4 py-6">
          {/* Profile Actions */}
          <View className="bg-white rounded-2xl shadow-md mb-4 overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center p-4 border-b border-gray-100 active:bg-gray-50"
              onPress={() => {}}
            >
              <Ionicons name="person-outline" size={22} color="#00A6A6" />
              <Text className="ml-3 flex-1 text-base text-odanet-text">Profili Düzenle</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-4 border-b border-gray-100 active:bg-gray-50"
              onPress={() => {}}
            >
              <Ionicons name="home-outline" size={22} color="#00A6A6" />
              <Text className="ml-3 flex-1 text-base text-odanet-text">İlanlarım</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-4 active:bg-gray-50"
              onPress={() => {}}
            >
              <Ionicons name="settings-outline" size={22} color="#00A6A6" />
              <Text className="ml-3 flex-1 text-base text-odanet-text">Ayarlar</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            className="bg-white rounded-2xl shadow-md p-4 flex-row items-center justify-center active:bg-gray-50"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#DC2626" />
            <Text className="ml-2 text-base font-semibold text-red-600">Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
