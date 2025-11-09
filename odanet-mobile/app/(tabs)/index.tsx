import { View, ScrollView, Text, RefreshControl, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useListings } from "../../hooks/useListings";
import { useSeekers } from "../../hooks/useSeekers";
import { ListingCard } from "../../components/ListingCard";
import { SeekerCard } from "../../components/SeekerCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SecondaryButton } from "../../components/SecondaryButton";
import { SearchInput } from "../../components/SearchInput";
import { colors, fonts, borderRadius, spacing } from "../../theme";

export default function HomeScreen() {
  const router = useRouter();
  const [activeToggle, setActiveToggle] = useState<"room" | "roommate">("room");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch listings and seekers
  const { data: listings, isLoading: listingsLoading, error: listingsError, refetch: refetchListings } = useListings();
  const { data: seekers, isLoading: seekersLoading, error: seekersError, refetch: refetchSeekers } = useSeekers();
  
  // Determine active data based on toggle
  const isLoading = activeToggle === "room" ? listingsLoading : seekersLoading;
  const error = activeToggle === "room" ? listingsError : seekersError;

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeToggle === "room") {
      await refetchListings();
    } else {
      await refetchSeekers();
    }
    setRefreshing(false);
  };

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
            <Text style={styles.logo}>Odanet</Text>
            <Text style={styles.tagline}>Güvenilir ve şeffaf oda arama deneyimi</Text>

            {/* Toggle Buttons */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                onPress={() => setActiveToggle("room")}
                style={[
                  styles.toggleButton,
                  activeToggle === "room" && styles.toggleButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    activeToggle === "room" && styles.toggleTextActive,
                  ]}
                >
                  Oda Ara
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveToggle("roommate")}
                style={[
                  styles.toggleButton,
                  activeToggle === "roommate" && styles.toggleButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    activeToggle === "roommate" && styles.toggleTextActive,
                  ]}
                >
                  Oda Arkadaşı Ara
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.accent]}
          />
        }
      >
        <View style={styles.content}>
          {/* Search */}
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Şehir veya semt ara..."
          />

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <PrimaryButton
              title="Oda arıyorum"
              onPress={() => {}}
              style={styles.buttonSpacing}
            />
            <SecondaryButton
              title="Oda veriyorum"
              onPress={() => {}}
            />
          </View>

          {/* Content Section - Listings or Seekers */}
          <View style={styles.listingsSection}>
            <Text style={styles.sectionTitle}>
              {activeToggle === "room" ? "🏡 Güncel İlanlar" : "👥 Oda Arkadaşı Arayanlar"}
            </Text>

            {isLoading && !refreshing && (
              <View style={styles.centerContainer}>
                <Text style={styles.loadingText}>Yükleniyor...</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>Hata Oluştu</Text>
                <Text style={styles.errorText}>
                  {activeToggle === "room" 
                    ? "İlanlar yüklenirken bir hata oluştu"
                    : "Oda arkadaşı arayanlar yüklenirken bir hata oluştu"}
                </Text>
                <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                  <Text style={styles.retryText}>Tekrar Dene</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Show Listings */}
            {activeToggle === "room" && listings && listings.length > 0 ? (
              <>
                {listings.slice(0, 5).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
                <SecondaryButton
                  title="Tüm İlanları Gör"
                  onPress={() => router.push("/listings")}
                  style={styles.viewAllButton}
                />
              </>
            ) : activeToggle === "room" && !isLoading && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  Henüz ilan bulunmamaktadır
                </Text>
              </View>
            )}

            {/* Show Seekers */}
            {activeToggle === "roommate" && seekers && seekers.length > 0 ? (
              <>
                {seekers.slice(0, 5).map((seeker) => (
                  <SeekerCard key={seeker.id} seeker={seeker} />
                ))}
                {seekers.length > 5 && (
                  <SecondaryButton
                    title="Tümünü Gör"
                    onPress={() => router.push("/seekers")}
                    style={styles.viewAllButton}
                  />
                )}
              </>
            ) : activeToggle === "roommate" && !isLoading && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  Henüz oda arkadaşı arayan bulunmamaktadır
                </Text>
              </View>
            )}
          </View>
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
    paddingBottom: spacing.xl,
  },
  headerContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    alignItems: "center",
  },
  logo: {
    fontSize: fonts.size.xxxl,
    fontWeight: fonts.weight.bold,
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: fonts.size.sm,
    color: colors.textWhite,
    textAlign: "center",
    marginBottom: spacing.lg,
    opacity: 0.9,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: borderRadius.pill,
    padding: 4,
    gap: 8,
  },
  toggleButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  toggleButtonActive: {
    backgroundColor: colors.textWhite,
  },
  toggleText: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.medium,
    color: colors.textWhite,
  },
  toggleTextActive: {
    color: colors.accent,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xl,
    gap: spacing.lg,
  },
  buttonsContainer: {
    gap: spacing.md,
  },
  buttonSpacing: {
    marginBottom: spacing.sm,
  },
  listingsSection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
  },
  loadingText: {
    color: colors.textLight,
    fontSize: fonts.size.base,
  },
  errorCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: "center",
  },
  errorTitle: {
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.sm,
    fontWeight: fonts.weight.semibold,
    fontSize: fonts.size.base,
  },
  errorText: {
    color: colors.textLight,
    textAlign: "center",
    fontSize: fonts.size.sm,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textLight,
    textAlign: "center",
    fontSize: fonts.size.base,
  },
  viewAllButton: {
    marginTop: spacing.sm,
  },
  retryButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
  },
  retryText: {
    color: colors.textWhite,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
  },
});
