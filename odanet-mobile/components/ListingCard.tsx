import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons"; // Added for better icons
import { Listing } from "../hooks/useListings";
import { colors, fonts, borderRadius, spacing } from "../theme";

// --- Custom Hook for robust image handling ---
// This centralizes image state logic and handles both loading and error states.
const useListingImage = (imagePath: string | undefined) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Memoized callbacks for efficient state updates
  const handleLoad = useCallback(() => setLoading(false), []);
  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  const firstImageUri = imagePath;
  const showPlaceholder = !firstImageUri || error;

  return { firstImageUri, loading, showPlaceholder, handleLoad, handleError };
};

// --- Component Interface ---
interface ListingCardProps {
  listing: Listing;
  // Optional prop for different card styles (e.g., featured, compact)
  variant?: "default" | "featured";
}

// --- Main Component ---
export function ListingCard({
  listing,
  variant = "default",
}: ListingCardProps) {
  const router = useRouter();

  // 1. Robust Image Handling: Use the custom hook
  const firstImage = listing.images?.[0]?.imagePath;
  const { firstImageUri, loading, showPlaceholder, handleLoad, handleError } =
    useListingImage(firstImage);

  // Memoized navigation handler for performance
  const navigateToDetails = useCallback(() => {
    // Safely navigate using optional chaining and boundary checks
    if (listing.id) {
      router.push(`/listing/${listing.id}`);
    } else {
      console.warn("Attempted to navigate to a listing without an ID.");
      // Optional: Show a toast notification to the user
    }
  }, [router, listing.id]);

  // 2. Dynamic Styling: Handle variants
  const cardStyle =
    variant === "featured" ? styles.containerFeatured : styles.containerDefault;

  // Function to safely format the price (Improved Number Formatting)
  const formatPrice = (amount: string | number | undefined) => {
    const rent = parseFloat((amount || "0").toString());
    if (isNaN(rent) || rent <= 0) {
      return "Fiyat Belirtilmemiş"; // Handle invalid/missing price gracefully
    }
    // Improved: Uses a compact currency display for better readability (optional)
    return `${rent.toLocaleString("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0, // No cents for rent prices
    })} / ay`;
  };

  return (
    <TouchableOpacity
      // 3. Performance & UX: Use memoized handler and proper accessibility props
      onPress={navigateToDetails}
      activeOpacity={0.75} // Slightly softer active opacity
      style={[styles.containerBase, cardStyle]}
      accessibilityRole="button"
      accessibilityLabel={`İlan detaylarına git: ${listing.title}`}
    >
      {/* --- Image/Placeholder Section --- */}
      <View style={styles.imageWrapper}>
        {showPlaceholder ? (
          // 4. Enhanced Placeholder: Better icon and clearer messaging
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.placeholderContainer}
          >
            <MaterialIcons
              name="image-not-supported"
              size={48}
              color={colors.textWhite}
            />
            <Text style={styles.placeholderText}>Görsel Yok</Text>
          </LinearGradient>
        ) : (
          <>
            <Image
              source={{ uri: firstImageUri }}
              style={styles.image}
              resizeMode="cover"
              // 5. Loading State: Show indicator while image is fetching
              onLoad={handleLoad}
              onError={handleError}
            />
            {/* Show an activity indicator on top of the image container while loading */}
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            )}
          </>
        )}
      </View>

      {/* --- Content Section --- */}
      <View style={styles.content}>
        {/* 6. Truncation and Accessibility: Ensure long titles don't break layout */}
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {listing.title}
        </Text>

        {/* 7. Conditional Rendering: More concise logic */}
        {listing.address && (
          <View style={styles.detailRow}>
            <MaterialIcons
              name="location-pin"
              size={14}
              color={colors.textLight}
            />
            <Text style={styles.address} numberOfLines={1}>
              {listing.address}
            </Text>
          </View>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(listing.rentAmount)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// --- Stylesheet Enhancements ---
const styles = StyleSheet.create({
  // Base style for all variants
  containerBase: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.sm, // Slightly less padding globally
    marginBottom: spacing.base,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  // Default variant styling (can be empty if Base is enough)
  containerDefault: {
    // specific styles for default
  },
  // Featured variant styling (example: larger size, different shadow)
  containerFeatured: {
    backgroundColor: colors.card,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.accent + "33", // Subtle accent border
  },
  imageWrapper: {
    width: "100%",
    height: 160,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    overflow: "hidden", // Ensures everything stays within bounds
    backgroundColor: colors.border,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: colors.textWhite,
    fontSize: fonts.size.sm,
    marginTop: spacing.sm,
    fontWeight: fonts.weight.medium,
  },
  content: {
    paddingHorizontal: spacing.xs, // Slight padding adjustment
    gap: 6, // Increased gap for better spacing
  },
  title: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold, // Bolder title
    color: colors.text,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  address: {
    fontSize: fonts.size.sm,
    color: colors.textLight,
    flexShrink: 1, // Allows text to shrink if needed
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  price: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.accent,
  },
});
