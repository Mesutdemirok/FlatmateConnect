import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useListings } from "../../hooks/useListings";
import { useSeekers } from "../../hooks/useSeekers";
import { UnifiedCard } from "../../components/ListingCard";
import { colors, fonts, borderRadius, spacing } from "../../theme";

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: listingsData = [],
    refetch: refetchListings,
    isLoading: isLoadingListings,
  } = useListings();

  const {
    data: seekersData = [],
    refetch: refetchSeekers,
    isLoading: isLoadingSeekers,
  } = useSeekers();

  const listings = Array.isArray(listingsData) ? listingsData : [];
  const seekers = Array.isArray(seekersData)
    ? seekersData
    : seekersData?.seekers || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchListings(), refetchSeekers()]);
    setRefreshing(false);
  };

  const combinedFeed = useMemo(() => {
    const listingsWithType = listings.map((item) => ({
      ...item,
      type: "listing",
    }));
    const seekersWithType = seekers.map((item) => ({
      ...item,
      type: "seeker",
    }));
    const combined = [...listingsWithType, ...seekersWithType];
    return combined.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [listings, seekers]);

  const isLoading = isLoadingListings || isLoadingSeekers;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8e44ad" />

      {/* 🌈 Hero Section */}
      <View style={styles.heroWrapper}>
        <LinearGradient
          colors={["#8e44ad", "#7b2cbf"]}
          style={styles.heroBackground}
        >
          <SafeAreaView style={styles.heroSafe}>
            <View style={styles.heroContent}>
              <Text style={styles.heroLogo}>Odanet</Text>
              <Text style={styles.heroTagline}>
                Ev arkadaşı bulmanın en kolay yolu
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      {/* 🏡 Unified Feed */}
      <ScrollView
        contentContainerStyle={styles.feedContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {combinedFeed.length > 0 ? (
          combinedFeed.map((item) => (
            <UnifiedCard key={`${item.type}-${item.id}`} item={item} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="inbox"
              size={48}
              color={colors.textLight}
              style={{ marginBottom: spacing.md }}
            />
            <Text style={styles.emptyText}>
              {isLoading
                ? "Yükleniyor..."
                : "Henüz ilan bulunamadı veya sunucuya erişilemiyor."}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroWrapper: {
    height: 160,
    borderBottomRightRadius: 28,
    borderBottomLeftRadius: 28,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  heroBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heroSafe: {
    width: "100%",
    alignItems: "center",
  },
  heroContent: {
    alignItems: "center",
  },
  heroLogo: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 0.5,
  },
  heroTagline: {
    fontSize: 14,
    color: "#f0e6ff",
    marginTop: 6,
  },
  feedContainer: {
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: fonts.size.base,
    color: colors.textLight,
    textAlign: "center",
  },
});
