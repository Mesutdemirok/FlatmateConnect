import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useListings } from "../../hooks/useListings";
import { useSeekers } from "../../hooks/useSeekers";
import { ListingCard } from "../../components/ListingCard";
import { SeekerCard } from "../../components/SeekerCard"; // ✅ FIXED named import
import { colors, fonts, borderRadius, spacing } from "../../theme";

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch both listings and seekers
  const {
    data: listingsData = [],
    refetch: refetchListings,
    isLoading: isLoadingListings,
  } = useListings();

  const {
    data: seekersData = [],
    refetch: refetchSeekers,
    isLoading: isLoadingSeekers,
    error: seekersError,
  } = useSeekers();

  // Safely normalize both data sources
  const listings = Array.isArray(listingsData) ? listingsData : [];
  const seekers = Array.isArray(seekersData)
    ? seekersData
    : seekersData?.seekers || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([refetchListings(), refetchSeekers()]);
    setRefreshing(false);
  };

  // Combine and sort chronologically (newest first)
  const combinedFeed = useMemo(() => {
    const listingsWithType = listings.map((item: any) => ({
      ...item,
      type: "listing",
    }));

    const seekersWithType = seekers.map((item: any) => ({
      ...item,
      type: "seeker",
    }));

    const combined = [...listingsWithType, ...seekersWithType];
    return combined.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Newest first
    });
  }, [listings, seekers]);

  const isLoading = isLoadingListings || isLoadingSeekers;
  const showEmpty = !isLoading && (combinedFeed.length === 0 || seekersError);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.card} />

      {/* HEADER */}
      <View style={styles.fixedHeader}>
        <SafeAreaView edges={["top"]} style={styles.topBarSafeArea}>
          <View style={styles.topBar}>
            <View>
              <Text style={styles.logo}>Odanet</Text>
              <Text style={styles.tagline}>
                Güvenilir ve şeffaf oda arama deneyimi
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              style={styles.profileButton}
            >
              <MaterialIcons
                name="person-outline"
                size={26}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* UNIFIED FEED */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        <Text style={styles.sectionTitle}>Tüm İlanlar</Text>

        {isLoading ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="hourglass-empty"
              size={48}
              color={colors.textLight}
              style={{ marginBottom: spacing.md }}
            />
            <Text style={styles.emptyText}>Yükleniyor...</Text>
          </View>
        ) : showEmpty ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="inbox"
              size={48}
              color={colors.textLight}
              style={{ marginBottom: spacing.md }}
            />
            <Text style={styles.emptyText}>
              Henüz ilan bulunamadı veya sunucuya erişilemiyor.
            </Text>
          </View>
        ) : (
          combinedFeed.map((item: any) =>
            item.type === "listing" ? (
              <ListingCard key={`listing-${item.id}`} listing={item} />
            ) : (
              <SeekerCard key={`seeker-${item.id}`} seeker={item} />
            ),
          )
        )}
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBarButton}>
          <MaterialIcons name="home" size={24} color={colors.accent} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBarButton}
          onPress={() => router.push("/messages")}
        >
          <MaterialIcons name="message" size={24} color={colors.inactive} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton}>
          <MaterialIcons
            name="favorite-border"
            size={24}
            color={colors.inactive}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBarButton}
          onPress={() => router.push("/profile")}
        >
          <MaterialIcons
            name="person-outline"
            size={24}
            color={colors.inactive}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fixedHeader: {
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 10,
  },
  topBarSafeArea: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.base,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  logo: {
    fontSize: fonts.size.xxl,
    fontWeight: fonts.weight.bold,
    color: colors.accent,
  },
  tagline: {
    fontSize: fonts.size.xs,
    color: colors.textLight,
    marginTop: 2,
  },
  profileButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl * 3,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingBottom: 5,
  },
  bottomBarButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  emptyContainer: {
    padding: spacing.xxl,
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  emptyText: {
    fontSize: fonts.size.base,
    color: colors.textLight,
    textAlign: "center",
  },
});
