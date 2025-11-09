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
  
  // Get primary city (first preferred area)
  const primaryCity = seeker.preferredAreas && seeker.preferredAreas.length > 0
    ? seeker.preferredAreas[0]
    : null;
  
  // Roommate preference
  const roommatePreference = seeker.smokingPreference || seeker.petPreference
    ? `${seeker.smokingPreference === "evet" ? "Sigara içiyor" : seeker.smokingPreference === "hayir" ? "Sigara içmiyor" : ""} ${seeker.petPreference === "evet" ? "• Evcil hayvan var" : seeker.petPreference === "hayir" ? "• Evcil hayvan yok" : ""}`.trim()
    : null;
  
  return (
    <TouchableOpacity
      onPress={() => router.push(`/seeker/${seeker.id}`)}
      style={styles.card}
      activeOpacity={0.9}
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
              {seeker.age && seeker.gender && <Text style={styles.separator}>•</Text>}
              {seeker.gender && <Text style={styles.detailText}>{genderDisplay}</Text>}
            </View>
            {/* City display */}
            {primaryCity && (
              <View style={styles.cityRow}>
                <Ionicons name="location-outline" size={14} color="#666666" />
                <Text style={styles.cityText}>{primaryCity}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Budget */}
        <View style={styles.budgetContainer}>
          <Ionicons name="wallet-outline" size={18} color={colors.accent} />
          <Text style={styles.budget}>{budgetDisplay}</Text>
        </View>

        {/* Bio */}
        {seeker.bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {seeker.bio}
          </Text>
        )}

        {/* Roommate Preference */}
        {roommatePreference && (
          <View style={styles.preferenceContainer}>
            <Ionicons name="people-outline" size={16} color={colors.textLight} />
            <Text style={styles.preferenceText} numberOfLines={1}>
              {roommatePreference}
            </Text>
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
    marginHorizontal: spacing.base,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  cardContent: {
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 24,
    marginBottom: 2,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  detailText: {
    fontSize: 14,
    color: "#666666",
  },
  separator: {
    fontSize: 14,
    color: "#666666",
    marginHorizontal: 6,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  cityText: {
    fontSize: 14,
    color: "#666666",
  },
  budgetContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  budget: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7F00FF",
  },
  bio: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  preferenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 4,
  },
  preferenceText: {
    fontSize: 13,
    color: colors.textLight,
    flex: 1,
  },
});
