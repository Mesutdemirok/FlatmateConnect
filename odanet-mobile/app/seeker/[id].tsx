import {
  View,
  ScrollView,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { colors, fonts, borderRadius, spacing } from "../../theme";

interface Seeker {
  id: string;
  type?: string;
  user?: {
    firstName: string;
    lastName: string;
  };
  fullName?: string;
  gender?: string;
  age?: number | string;
  budget?: number | string;
  budgetMonthly?: number | string;
  preferredAreas?: string[];
  preferredLocation?: string;
  smokingPreference?: string;
  petPreference?: string;
  bio?: string;
  profilePhotoUrl?: string;
  occupation?: string;
}

async function fetchSeeker(id: string): Promise<Seeker> {
  const base =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://www.odanet.com.tr";
  
  const url = `${base}/api/users/seekers`;
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch seeker ${id}`);
  }
  
  const json = await res.json();
  const seekers = Array.isArray(json) ? json : json.seekers || [];
  
  const seeker = seekers.find((s: any) => String(s.id) === String(id));
  if (!seeker) {
    throw new Error("Seeker not found");
  }
  
  return seeker;
}

export default function SeekerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { data: seeker, isLoading, error } = useQuery({
    queryKey: ["seeker", id],
    queryFn: () => fetchSeeker(id!),
    enabled: !!id,
  });

  const handleGoBack = () => {
    if (router.canGoBack()) router.back();
    else router.push("/(tabs)");
  };

  const handleContact = () => {
    console.log(`Contacting seeker ${id}`);
    router.push(`/messages`);
  };

  // Loading State
  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.muted}>Profil yükleniyor...</Text>
      </View>
    );
  }

  // Error State
  if (error || !seeker) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorHeader}>
          <TouchableOpacity onPress={handleGoBack} style={styles.errorBackBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.errorText}>Profil Detayı</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>Aradığınız profil bulunamadı.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const name = seeker.fullName || 
    `${seeker.user?.firstName || "İsimsiz"} ${seeker.user?.lastName || ""}`.trim();
  const budget = seeker.budgetMonthly || seeker.budget;
  const location = seeker.preferredAreas?.[0] || seeker.preferredLocation || "";
  
  // Normalize photo URL - prepend base if it's a relative path
  const base =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://www.odanet.com.tr";
  const photoUrl = seeker.profilePhotoUrl?.startsWith("http")
    ? seeker.profilePhotoUrl
    : seeker.profilePhotoUrl
      ? `${base}${seeker.profilePhotoUrl}`
      : undefined;

  // Main Content
  return (
    <View style={styles.container}>
      {/* Profile Photo Header */}
      <View style={styles.photoWrapper}>
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={styles.photo}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.photoPlaceholder}
          >
            <Ionicons
              name="person-circle-outline"
              size={80}
              color={colors.textWhite}
            />
          </LinearGradient>
        )}
        
        <LinearGradient
          colors={["rgba(0,0,0,0.4)", "transparent"]}
          style={styles.topGradient}
        />
        
        <SafeAreaView style={styles.floatingHeader}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.floatingButton}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.textWhite}
            />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Scrollable Info */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Name and Budget */}
        <View style={styles.card}>
          <Text style={styles.name}>{name}</Text>
          {budget && (
            <Text style={styles.budget}>
              ₺{parseFloat(String(budget)).toLocaleString("tr-TR")}
              <Text style={styles.budgetSuffix}> / ay bütçe</Text>
            </Text>
          )}
        </View>

        {/* Quick Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bilgiler</Text>
          
          {location && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.accent} />
              <Text style={styles.infoText}>{location}</Text>
            </View>
          )}
          
          {seeker.age && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.accent} />
              <Text style={styles.infoText}>{seeker.age} yaşında</Text>
            </View>
          )}
          
          {seeker.gender && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color={colors.accent} />
              <Text style={styles.infoText}>
                {seeker.gender === "male" ? "Erkek" : seeker.gender === "female" ? "Kadın" : seeker.gender}
              </Text>
            </View>
          )}
          
          {seeker.occupation && (
            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={20} color={colors.accent} />
              <Text style={styles.infoText}>{seeker.occupation}</Text>
            </View>
          )}
        </View>

        {/* Preferences */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tercihler</Text>
          
          {seeker.smokingPreference && (
            <View style={styles.infoRow}>
              <Ionicons name="alert-circle-outline" size={20} color={colors.accent} />
              <Text style={styles.infoText}>
                Sigara: {seeker.smokingPreference === "evet" ? "Evet" : "Hayır"}
              </Text>
            </View>
          )}
          
          {seeker.petPreference && (
            <View style={styles.infoRow}>
              <Ionicons name="paw-outline" size={20} color={colors.accent} />
              <Text style={styles.infoText}>
                Evcil Hayvan: {seeker.petPreference === "evet" ? "Evet" : "Hayır"}
              </Text>
            </View>
          )}
        </View>

        {/* Bio */}
        {seeker.bio && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Hakkında</Text>
            <Text style={styles.bioText}>{seeker.bio}</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Contact Button */}
      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <TouchableOpacity
          onPress={handleContact}
          style={styles.contactButton}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.contactGradient}
          >
            <Ionicons name="chatbubble-outline" size={22} color="white" />
            <Text style={styles.contactText}>İletişime Geç</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  muted: {
    fontSize: fonts.size.base,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  errorHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  errorBackBtn: {
    marginRight: spacing.sm,
  },
  errorText: {
    fontSize: fonts.size.lg,
    color: colors.text,
  },
  photoWrapper: {
    width: "100%",
    height: 300,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.base,
  },
  floatingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: spacing.base,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  budget: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    color: colors.accent,
  },
  budgetSuffix: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.normal,
    color: colors.textLight,
  },
  sectionTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  infoText: {
    fontSize: fonts.size.base,
    color: colors.text,
    flex: 1,
  },
  bioText: {
    fontSize: fonts.size.base,
    color: colors.text,
    lineHeight: 24,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  contactButton: {
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  contactGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.base,
    gap: spacing.sm,
  },
  contactText: {
    color: "white",
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
  },
});
