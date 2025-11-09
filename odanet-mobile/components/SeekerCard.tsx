import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Seeker } from "../hooks/useSeekers";
import { colors, fonts, borderRadius, spacing } from "../theme";

interface SeekerCardProps {
  seeker: Seeker;
}

export function SeekerCard({ seeker }: SeekerCardProps) {
  const router = useRouter();
  
  // Get user initials for avatar
  const initials = seeker.user
    ? `${seeker.user.firstName?.[0] || ""}${seeker.user.lastName?.[0] || ""}`.toUpperCase()
    : "?";
  
  // Format name
  const name = seeker.user
    ? `${seeker.user.firstName} ${seeker.user.lastName}`
    : "İsimsiz";
  
  // Gender display
  const genderDisplay = seeker.gender === "erkek" ? "Erkek" : seeker.gender === "kadin" ? "Kadın" : "Diğer";
  
  // Format budget
  const budgetDisplay = seeker.budget
    ? `₺${parseFloat(seeker.budget).toLocaleString("tr-TR")}`
    : "Belirtilmemiş";
  
  return (
    <TouchableOpacity
      onPress={() => router.push(`/seeker/${seeker.id}`)}
      style={styles.card}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Avatar and Name */}
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          
          <View style={styles.headerInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.detailsRow}>
              {seeker.age && <Text style={styles.detailText}>{seeker.age} yaş</Text>}
              {seeker.gender && (
                <>
                  <Text style={styles.separator}>•</Text>
                  <Text style={styles.detailText}>{genderDisplay}</Text>
                </>
              )}
              {seeker.occupation && (
                <>
                  <Text style={styles.separator}>•</Text>
                  <Text style={styles.detailText} numberOfLines={1}>
                    {seeker.occupation}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Budget */}
        <View style={styles.budgetContainer}>
          <Ionicons name="wallet-outline" size={16} color={colors.accent} />
          <Text style={styles.budget}>Bütçe: {budgetDisplay}</Text>
        </View>

        {/* Bio */}
        {seeker.bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {seeker.bio}
          </Text>
        )}

        {/* Preferred Areas */}
        {seeker.preferredAreas && seeker.preferredAreas.length > 0 && (
          <View style={styles.areasContainer}>
            <Ionicons name="location-outline" size={14} color={colors.textLight} />
            <View style={styles.areaChips}>
              {seeker.preferredAreas.slice(0, 3).map((area, index) => (
                <View key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{area}</Text>
                </View>
              ))}
              {seeker.preferredAreas.length > 3 && (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>+{seeker.preferredAreas.length - 3}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    padding: spacing.base,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  avatarText: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.textWhite,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  detailText: {
    fontSize: fonts.size.sm,
    color: colors.textLight,
  },
  separator: {
    fontSize: fonts.size.sm,
    color: colors.textLight,
    marginHorizontal: spacing.xs,
  },
  budgetContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  budget: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    color: colors.accent,
    marginLeft: spacing.xs,
  },
  bio: {
    fontSize: fonts.size.sm,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  areasContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.xs,
  },
  areaChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
    marginLeft: spacing.xs,
  },
  chip: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  chipText: {
    fontSize: fonts.size.xs,
    color: colors.text,
    fontWeight: fonts.weight.medium,
  },
});
