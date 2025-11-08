import { View, ScrollView, Text, StyleSheet } from "react-native";
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
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.contentContainer}>
            <View style={styles.card}>
              <Ionicons name="chatbubbles-outline" size={64} color="#CCCCCC" style={styles.icon} />
              <Text style={styles.title}>Giriş Yap veya Üye Ol</Text>
              <Text style={styles.subtitle}>
                Mesajlaşmak için lütfen giriş yapın
              </Text>
              <PrimaryButton
                title="Giriş Yap"
                onPress={() => router.push("/login")}
                style={styles.button}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          <View style={styles.featureCard}>
            <Ionicons name="chatbubbles" size={64} color="#00A6A6" style={styles.icon} />
            <Text style={styles.featureTitle}>💬 Henüz mesajınız yok</Text>
            <Text style={styles.subtitle}>
              İlan sahipleriyle mesajlaşmaya başladığınızda burada görünecek
            </Text>
            <Text style={styles.note}>
              Mesajlaşma özelliği yakında aktif olacak
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 80,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#00A6A6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
    textAlign: "center",
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00A6A6",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  note: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
    fontStyle: "italic",
  },
  loadingText: {
    color: "#666666",
  },
  button: {
    width: "100%",
  },
});
