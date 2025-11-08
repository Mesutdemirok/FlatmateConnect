import { View, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCurrentUser } from "../../hooks/useAuth";
import { PrimaryButton } from "../../components/PrimaryButton";

export default function MessagesScreen() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

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
              <Ionicons name="chatbubbles-outline" size={64} color="#CCCCCC" className="mb-4" />
              <Text className="text-xl font-bold text-odanet-text mb-2 text-center">
                Giriş Yap veya Üye Ol
              </Text>
              <Text className="text-sm text-odanet-textLight text-center mb-6">
                Mesajlaşmak için lütfen giriş yapın
              </Text>
              <PrimaryButton
                title="Giriş Yap"
                onPress={() => router.push("/login")}
                className="w-full"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-odanet-background" edges={["top"]}>
      <ScrollView className="flex-1">
        <View className="px-4 py-20">
          <View className="bg-white rounded-2xl p-8 items-center shadow-md border-2 border-odanet-primary">
            <Ionicons name="chatbubbles" size={64} color="#00A6A6" className="mb-4" />
            <Text className="text-xl font-bold text-odanet-primary mb-2 text-center">
              💬 Henüz mesajınız yok
            </Text>
            <Text className="text-sm text-odanet-textLight text-center mb-4">
              İlan sahipleriyle mesajlaşmaya başladığınızda burada görünecek
            </Text>
            <Text className="text-xs text-odanet-textLight text-center italic">
              Mesajlaşma özelliği yakında aktif olacak
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
