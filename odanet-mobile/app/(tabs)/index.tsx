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
// Changed to just use 'top' edge for SafeAreaView inside the fixedHeader
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons"; // Added FontAwesome for better icons
import { useListings } from "../../hooks/useListings";
import { useSeekers } from "../../hooks/useSeekers";
import { ListingCard } from "../../components/ListingCard";
import { SeekerCard } from "../../components/SeekerCard";
import { SearchInput } from "../../components/SearchInput";
// Assuming theme constants are available
import { colors, fonts, borderRadius, spacing } from "../../theme";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();

  const [activeToggle, setActiveToggle] = useState<"room" | "roommate">("room");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Data fetching hooks remain
  const {
    data: listings,
    refetch: refetchListings,
    isLoading: isLoadingListings,
  } = useListings();
  const {
    data: seekers,
    refetch: refetchSeekers,
    isLoading: isLoadingSeekers,
  } = useSeekers();

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeToggle === "room") await refetchListings();
    else await refetchSeekers();
    setRefreshing(false);
  };

  // Data extraction logic remains
  const listingList = Array.isArray(listings)
    ? listings
    : Array.isArray(listings?.data)
      ? listings.data
      : [];
  const seekerList = Array.isArray(seekers)
    ? seekers
    : Array.isArray(seekers?.data)
      ? seekers.data
      : [];

  // Filter logic for both listings and seekers
  const filteredData = useMemo(() => {
    const list = activeToggle === "room" ? listingList : seekerList;
    if (!searchQuery) return list;

    const lowerCaseQuery = searchQuery.toLowerCase();

    if (activeToggle === "room") {
      // Search listings by title, address, city
      return list.filter(
        (item: any) =>
          item.title?.toLowerCase().includes(lowerCaseQuery) ||
          item.address?.toLowerCase().includes(lowerCaseQuery) ||
          item.city?.toLowerCase().includes(lowerCaseQuery),
      );
    } else {
      // Search seekers by name, age, preferred areas
      return list.filter((item: any) => {
        const fullName = item.user
          ? `${item.user.firstName || ""} ${item.user.lastName || ""}`.toLowerCase()
          : "";
        const age = item.age?.toString() || "";
        const preferredAreas = (item.preferredAreas ?? []).join(" ").toLowerCase();
        const occupation = (item.occupation || "").toLowerCase();

        return (
          fullName.includes(lowerCaseQuery) ||
          age.includes(lowerCaseQuery) ||
          preferredAreas.includes(lowerCaseQuery) ||
          occupation.includes(lowerCaseQuery)
        );
      });
    }
  }, [activeToggle, listingList, seekerList, searchQuery]);

  const isLoading =
    activeToggle === "room" ? isLoadingListings : isLoadingSeekers;

  // Function to render the list items with Empty State
  const renderListItems = () => {
    if (filteredData.length === 0 && searchQuery.length > 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="search-off" size={60} color={colors.textLight} />
          <Text style={styles.emptyText}>
            '**{searchQuery}**' için sonuç bulunamadı.
          </Text>
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.resetButton}
          >
            <Text style={styles.resetButtonText}>Aramayı Temizle</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return filteredData.map((item) =>
      activeToggle === "room" ? (
        // Added variant prop for potential different card styling
        <ListingCard key={item.id} listing={item} variant="default" />
      ) : (
        <SeekerCard key={item.id} seeker={item} />
      ),
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. STATUS BAR: Dark content for visibility against light background */}
      <StatusBar barStyle="dark-content" backgroundColor={colors.card} />

      {/* --- FIXED HEADER/SEARCH BLOCK --- */}
      <View style={styles.fixedHeader}>
        {/* TOP BAR - Logo and Profile/Settings */}
        <SafeAreaView edges={["top"]} style={styles.topBarSafeArea}>
          <View style={styles.topBar}>
            {/* Logo remains prominent */}
            <Text style={styles.logo}>Odanet</Text>
            {/* Profile icon */}
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

        {/* 2. SEGMENTED CONTROL / TOGGLE BAR: Moved above the search */}
        <View style={styles.toggleContainerWrapper}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              onPress={() => setActiveToggle("room")}
              style={[
                styles.toggleButton,
                activeToggle === "room" && styles.toggleButtonActive,
              ]}
            >
              {/* Used FontAwesome for cleaner icons */}
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

        {/* 3. SEARCH BOX: Prominent and polished */}
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
        {renderListItems()}
      </ScrollView>

      {/* --- CUSTOM BOTTOM TAB BAR (Hidden Text) --- */}
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
    backgroundColor: colors.background, // Main background is light/off-white
  },

  // --- FIXED HEADER STYLES ---
  fixedHeader: {
    backgroundColor: colors.card, // White background for the fixed header
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    // Add shadow for depth, similar to Airbnb's fixed header
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 10,
  },

  // Fixes the empty line above the logo
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
    background: `linear-gradient(90deg, ${colors.gradientStart}, ${colors.gradientEnd})`,
    color: colors.accent,
  },

  profileButton: {
    padding: spacing.xs,
  },

  // SEGMENTED CONTROL WRAPPER
  toggleContainerWrapper: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: borderRadius.pill,
    padding: 2, // Thinner padding
    gap: 2,
  },

  // TOGGLE BUTTONS - ALL IN ONE LINE
  toggleButton: {
    flex: 1,
    flexDirection: "row", // Align icon and text
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm, // Increased vertical padding for a taller button
    borderRadius: borderRadius.pill,
  },
  toggleButtonActive: {
    backgroundColor: colors.accent, // Accent color for active state
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
    marginLeft: spacing.xs, // Space between icon and text
  },
  toggleTextActive: {
    color: colors.textWhite,
  },

  // SEARCH BOX
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

  // --- SCROLLABLE CONTENT ---
  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl * 3, // More padding to avoid overlap with bottom bar
    gap: spacing.md,
  },

  sectionTitle: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs, // Slight padding to align with cards
  },

  // --- BOTTOM BAR (NO TEXT) ---
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60, // Standard tab bar height
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingBottom: 5, // Account for bottom safe area
  },
  bottomBarButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.xs,
  },

  // --- EMPTY STATE ---
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
