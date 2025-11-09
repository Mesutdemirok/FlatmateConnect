import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useListings } from "../../hooks/useListings";
import { useSeekers } from "../../hooks/useSeekers";
import { ListingCard } from "../../components/ListingCard";
import { SeekerCard } from "../../components/SeekerCard";
import { SearchInput } from "../../components/SearchInput";
import { colors, fonts, borderRadius, spacing } from "../../theme";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();

  const [activeToggle, setActiveToggle] = useState<"room" | "roommate">("room");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Default arrays to prevent undefined crashes
  const {
    data: listings = [],
    refetch: refetchListings,
    isLoading: isLoadingListings,
  } = useListings();

  const {
    data: seekers = [],
    refetch: refetchSeekers,
    isLoading: isLoadingSeekers,
  } = useSeekers();

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeToggle === "room") await refetchListings();
    else await refetchSeekers();
    setRefreshing(false);
  };

  // ✅ Filter logic (unchanged but simplified with guaranteed arrays)
  const filteredData = useMemo(() => {
    const list = activeToggle === "room" ? listings : seekers;
    if (!searchQuery) return list;

    const lowerCaseQuery = searchQuery.toLowerCase();

    if (activeToggle === "room") {
      return list.filter(
        (item: any) =>
          item.title?.toLowerCase().includes(lowerCaseQuery) ||
          item.address?.toLowerCase().includes(lowerCaseQuery) ||
          item.city?.toLowerCase().includes(lowerCaseQuery),
      );
    } else {
      return list.filter((item: any) => {
        const fullName = item.user
          ? `${item.user.firstName || ""} ${item.user.lastName || ""}`.toLowerCase()
          : "";
        const age = item.age?.toString() || "";
        const preferredAreas = (item.preferredAreas ?? [])
          .join(" ")
          .toLowerCase();
        const occupation = (item.occupation || "").toLowerCase();

        return (
          fullName.includes(lowerCaseQuery) ||
          age.includes(lowerCaseQuery) ||
          preferredAreas.includes(lowerCaseQuery) ||
          occupation.includes(lowerCaseQuery)
        );
      });
    }
  }, [activeToggle, listings, seekers, searchQuery]);

  const isLoading =
    activeToggle === "room" ? isLoadingListings : isLoadingSeekers;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.card} />

      {/* --- FIXED HEADER --- */}
      <View style={styles.fixedHeader}>
        <SafeAreaView edges={["top"]} style={styles.topBarSafeArea}>
          <View style={styles.topBar}>
            <Text style={styles.logo}>Odanet</Text>
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

        {/* --- TOGGLE BAR --- */}
        <View style={styles.toggleContainerWrapper}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              onPress={() => setActiveToggle("room")}
              style={[
                styles.toggleButton,
                activeToggle === "room" && styles.toggleButtonActive,
              ]}
            >
              <FontAwesome
                name="home"
                size={16}
                color={
                  activeToggle === "room" ? colors.textWhite : colors.textLight
                }
              />
              <Text
                style={[
                  styles.toggleText,
                  activeToggle === "room" && styles.toggleTextActive,
                ]}
              >
                Oda İlanları
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveToggle("roommate")}
              style={[
                styles.toggleButton,
                activeToggle === "roommate" && styles.toggleButtonActive,
              ]}
            >
              <MaterialIcons
                name="people-outline"
                size={18}
                color={
                  activeToggle === "roommate"
                    ? colors.textWhite
                    : colors.textLight
                }
              />
              <Text
                style={[
                  styles.toggleText,
                  activeToggle === "roommate" && styles.toggleTextActive,
                ]}
              >
                Arkadaş Arayanlar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- SEARCH BOX --- */}
        <View style={styles.searchBoxWrapper}>
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={
              activeToggle === "room"
                ? "İlan, Şehir veya Semt Ara..."
                : "İsim, Şehir veya Yaş Ara..."
            }
            style={styles.searchInputCustom}
          />
        </View>
      </View>

      {/* --- SCROLLABLE CONTENT --- */}
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
        <Text style={styles.sectionTitle}>
          {activeToggle === "room"
            ? "Tavsiye Edilen Odalar"
            : "Popüler Oda Arkadaşları"}
        </Text>

        {/* --- FIXED SEEKERS & LISTINGS SECTION --- */}
        {(activeToggle === "room" ? listings : seekers).length > 0 ? (
          (activeToggle === "room" ? listings : seekers)
            .slice(0, 6)
            .map((item) =>
              activeToggle === "room" ? (
                <ListingCard key={item.id} listing={item} />
              ) : (
                <SeekerCard key={item.id} seeker={item} />
              ),
            )
        ) : (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text
              style={{ color: colors.textLight, fontSize: fonts.size.base }}
            >
              {activeToggle === "room"
                ? "Henüz oda ilanı bulunamadı."
                : "Henüz oda arayan bulunamadı."}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* --- BOTTOM BAR --- */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBarButton}>
          <MaterialIcons name="home" size={24} color={colors.accent} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton}>
          <MaterialIcons name="message" size={24} color={colors.inactive} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton}>
          <MaterialIcons
            name="favorite-border"
            size={24}
            color={colors.inactive}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton}>
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
    paddingVertical: spacing.xs,
  },
  logo: {
    fontSize: fonts.size.xxl,
    fontWeight: fonts.weight.bold,
    color: colors.accent,
  },
  profileButton: {
    padding: spacing.xs,
  },
  toggleContainerWrapper: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: borderRadius.pill,
    padding: 2,
    gap: 2,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  toggleButtonActive: {
    backgroundColor: colors.accent,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleText: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    color: colors.textLight,
    marginLeft: spacing.xs,
  },
  toggleTextActive: {
    color: colors.textWhite,
  },
  searchBoxWrapper: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  searchInputCustom: {
    height: 44,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.accent + "20",
    fontSize: fonts.size.base,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
    marginBottom: spacing.md,
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  resetButtonText: {
    color: colors.textWhite,
    fontWeight: fonts.weight.semibold,
  },
});
