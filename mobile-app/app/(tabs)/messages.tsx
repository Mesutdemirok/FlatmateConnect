import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { colors, fonts, borderRadius, spacing } from "../../theme";

export default function MessagesScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mesajlar</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.emptyCard}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.accent} />
            <Text style={styles.emptyTitle}>Giriş Yapın</Text>
            <Text style={styles.emptyText}>
              Mesajlarınızı görmek için giriş yapmalısınız
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.loginButtonText}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mesajlar</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.emptyCard}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.accent} />
            <Text style={styles.emptyTitle}>Henüz Mesaj Yok</Text>
            <Text style={styles.emptyText}>
              Mesajlarınız burada görünecektir
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
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xxxl,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xxxl,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fonts.size.base,
    color: colors.textLight,
    textAlign: "center",
    marginBottom: spacing.base,
  },
  loginButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.base,
  },
  loginButtonText: {
    color: colors.textWhite,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xxxl,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xxxl,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fonts.size.base,
    color: colors.textLight,
    textAlign: "center",
  },
});
