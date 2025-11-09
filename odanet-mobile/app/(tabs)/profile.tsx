import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { colors, fonts, borderRadius, spacing } from "../../theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      "Çıkış Yap",
      "Çıkış yapmak istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/login");
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.loginPrompt}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginPromptText}>Giriş yapın</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            {user.email && (
              <Text style={styles.userEmail}>{user.email}</Text>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.menuCard}>
            <Ionicons name="person-outline" size={24} color={colors.accent} />
            <Text style={styles.menuText}>Profili Düzenle</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard}>
            <Ionicons name="home-outline" size={24} color={colors.accent} />
            <Text style={styles.menuText}>İlanlarım</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard}>
            <Ionicons name="settings-outline" size={24} color={colors.accent} />
            <Text style={styles.menuText}>Ayarlar</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingBottom: spacing.xxxl,
  },
  headerContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.textWhite,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.base,
  },
  avatarText: {
    fontSize: fonts.size.xxl,
    fontWeight: fonts.weight.bold,
    color: colors.accent,
  },
  userName: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: fonts.size.sm,
    color: colors.textWhite,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.base,
    marginTop: -spacing.lg,
    paddingBottom: spacing.xl,
  },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuText: {
    flex: 1,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.medium,
    color: colors.text,
    marginLeft: spacing.base,
  },
  logoutButton: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    alignItems: "center",
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    color: colors.error,
  },
  loadingText: {
    color: colors.textLight,
    textAlign: "center",
    marginTop: spacing.xxxl,
  },
  loginPrompt: {
    margin: spacing.xl,
    padding: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  loginPromptText: {
    fontSize: fonts.size.base,
    color: colors.accent,
    fontWeight: fonts.weight.semibold,
  },
});
