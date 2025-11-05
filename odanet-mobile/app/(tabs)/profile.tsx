import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";

export default function Profile() {
  const { data: user, isLoading, error } = useCurrentUser();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("token");
    queryClient.clear();
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#EA580C" />
        <Text className="text-gray-600 mt-4">Profil yükleniyor...</Text>
      </View>
    );
  }

  if (error || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-6xl mb-4">🔐</Text>
        <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
          Giriş Yapın
        </Text>
        <Text className="text-base text-gray-600 text-center mb-6">
          Profilinizi görüntülemek için giriş yapmanız gerekiyor
        </Text>
        <TouchableOpacity 
          className="bg-orange-600 px-8 py-3 rounded-lg"
          data-testid="login-button"
        >
          <Text className="text-white font-semibold text-base">Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 pt-16 pb-8">
        {/* Profile Header */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-orange-100 items-center justify-center mb-4">
            <Text className="text-4xl">
              {user.firstName?.[0]?.toUpperCase() || "👤"}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-1" data-testid="user-name">
            {user.firstName} {user.lastName}
          </Text>
          <Text className="text-base text-gray-600" data-testid="user-email">
            {user.email}
          </Text>
          {user.phone && (
            <Text className="text-sm text-gray-500 mt-1" data-testid="user-phone">
              📱 {user.phone}
            </Text>
          )}
        </View>

        {/* Verification Status */}
        <View className="bg-gray-50 px-4 py-3 rounded-lg mb-4">
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">
              {user.verificationStatus === "verified" ? "✅" : "⏳"}
            </Text>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900">
                Doğrulama Durumu
              </Text>
              <Text className="text-sm text-gray-600">
                {user.verificationStatus === "verified" 
                  ? "Hesabınız doğrulandı" 
                  : "Doğrulama bekliyor"}
              </Text>
            </View>
          </View>
        </View>

        {/* Bio */}
        {user.bio && (
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              Hakkımda
            </Text>
            <Text className="text-sm text-gray-700" data-testid="user-bio">
              {user.bio}
            </Text>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <View className="bg-white mt-4 px-4 py-2">
        <TouchableOpacity 
          className="py-4 border-b border-gray-100"
          data-testid="edit-profile-button"
        >
          <Text className="text-base text-gray-900">✏️ Profili Düzenle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="py-4 border-b border-gray-100"
          data-testid="settings-button"
        >
          <Text className="text-base text-gray-900">⚙️ Ayarlar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="py-4"
          onPress={handleLogout}
          data-testid="logout-button"
        >
          <Text className="text-base text-red-600">🚪 Çıkış Yap</Text>
        </TouchableOpacity>
      </View>

      {/* Coming Soon */}
      <View className="bg-orange-50 mx-4 mt-6 p-4 rounded-lg">
        <Text className="text-sm text-orange-900 font-semibold mb-1">
          🚀 Çok Yakında
        </Text>
        <Text className="text-sm text-orange-800">
          Profil düzenleme, fotoğraf yükleme ve daha fazla özellik yakında eklenecek!
        </Text>
      </View>
    </ScrollView>
  );
}
