import { View, Text } from "react-native";

export default function Messages() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 px-6">
      <Text className="text-6xl mb-4">💬</Text>
      <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
        Mesajlar
      </Text>
      <Text className="text-base text-gray-600 text-center">
        Çok yakında! Kısa süre içinde diğer kullanıcılarla mesajlaşabileceksiniz.
      </Text>
    </View>
  );
}
