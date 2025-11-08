import { View, ScrollView, StyleSheet } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCurrentUser } from "../../hooks/useAuth";

export default function MessagesScreen() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.emptyContainer}>
          <Card style={styles.emptyCard}>
            <Card.Content>
              <MaterialCommunityIcons
                name="loading"
                size={64}
                color="#00A6A6"
                style={styles.emptyIcon}
              />
            </Card.Content>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.emptyContainer}>
            <Card style={styles.emptyCard}>
              <Card.Content>
                <MaterialCommunityIcons
                  name="message-text-lock"
                  size={80}
                  color="#CCCCCC"
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>Giriş Yapın</Text>
                <Text style={styles.emptySubtitle}>
                  Mesajlarınızı görmek için lütfen giriş yapın
                </Text>
                <Button
                  mode="contained"
                  onPress={() => router.push("/login")}
                  buttonColor="#00A6A6"
                  textColor="#FFFFFF"
                  style={styles.loginButton}
                >
                  Giriş Yap
                </Button>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.emptyContainer}>
          <Card style={styles.featureCard}>
            <Card.Content>
              <MaterialCommunityIcons
                name="message-text-outline"
                size={80}
                color="#00A6A6"
                style={styles.emptyIcon}
              />
              <Text style={styles.featureTitle}>Mesajlaşma Özelliği</Text>
              <Text style={styles.featureSubtitle}>
                İlan sahipleriyle mesajlaşabilmek için bu özellik yakında aktif olacak
              </Text>
              <Text style={styles.featureNote}>
                İlan detay sayfasındaki "İletişime Geç" butonunu kullanarak mesaj gönderebileceksiniz
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    padding: 16,
    marginTop: 80,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 40,
  },
  featureCard: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    paddingVertical: 40,
    borderWidth: 2,
    borderColor: "#00A6A6",
  },
  emptyIcon: {
    alignSelf: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222222",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00A6A6",
    textAlign: "center",
    marginBottom: 12,
  },
  featureSubtitle: {
    fontSize: 16,
    color: "#222222",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  featureNote: {
    fontSize: 13,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },
  loginButton: {
    marginTop: 16,
    borderRadius: 8,
  },
});
