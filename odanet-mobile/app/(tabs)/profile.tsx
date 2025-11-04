import { View, Text } from "react-native";

export default function Profile() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 px-6">
      <Text className="text-6xl mb-4">👤</Text>
      <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
        Profil
      </Text>
      <Text className="text-base text-gray-600 text-center">
        Çok yakında! Profilinizi düzenleyebilir ve hesap ayarlarınızı yönetebileceksiniz.
      </Text>
    </View>
  );
}
