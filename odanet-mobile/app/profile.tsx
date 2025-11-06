import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useCurrentUser, useLogout } from "../hooks/useAuth";

export default function Profile() {
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.replace("/login");
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-2xl font-bold text-foreground mb-2">
            Giriş Yapın
          </Text>
          <Text className="text-muted-foreground text-center mb-6">
            Profil bilgilerinizi görmek için giriş yapmalısınız
          </Text>
          <Link href="/login" asChild>
            <TouchableOpacity className="bg-primary px-8 py-4 rounded-xl w-full">
              <Text className="text-white font-bold text-center text-lg">
                Giriş Yap
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="bg-primary p-6">
          <View className="items-center">
            <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4">
              <Text className="text-4xl">
                {user.firstName?.[0]?.toUpperCase() || "U"}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-white">
              {user.firstName} {user.lastName}
            </Text>
            <Text className="text-white/90 mt-1">{user.email}</Text>
          </View>
        </View>

        {/* Profile Options */}
        <View className="p-4 gap-3">
          <TouchableOpacity className="bg-white p-4 rounded-xl border border-gray-200">
            <Text className="font-bold text-foreground">📝 Profili Düzenle</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white p-4 rounded-xl border border-gray-200">
            <Text className="font-bold text-foreground">🏠 İlanlarım</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white p-4 rounded-xl border border-gray-200">
            <Text className="font-bold text-foreground">💬 Mesajlarım</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white p-4 rounded-xl border border-gray-200">
            <Text className="font-bold text-foreground">❤️ Favorilerim</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white p-4 rounded-xl border border-gray-200">
            <Text className="font-bold text-foreground">⚙️ Ayarlar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 p-4 rounded-xl border border-red-200 mt-4"
          >
            <Text className="font-bold text-red-600 text-center">
              🚪 Çıkış Yap
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
