import { View, ScrollView, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, borderRadius, spacing } from "../../theme";

export default function FavoritesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorilerim</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.emptyCard}>
            <Ionicons name="heart-outline" size={64} color={colors.accent} />
            <Text style={styles.emptyTitle}>Henüz Favori Yok</Text>
            <Text style={styles.emptyText}>
              Beğendiğiniz ilanları favorilere ekleyebilirsiniz
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
  },
});
