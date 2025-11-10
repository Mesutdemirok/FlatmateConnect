import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { colors, fonts, borderRadius, spacing } from "../theme";
import { getImageUrl } from "../config"; // ✅ Fixed import path
import { useState, useEffect } from "react";

// Helpers: detect type
const isListing = (item: any) => item?.type === "listing" || !!item?.rentAmount;
const isSeeker = (item: any) =>
  item?.type === "seeker" || !!item?.budget || !!item?.bio;

export function UnifiedCard({ item }: { item: any }) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  // Reset error state when item changes
  useEffect(() => {
    setImageError(false);
  }, [item.id]);

  // Navigation logic
  const handlePress = () => {
    if (isListing(item)) router.push(`/listing/${item.id}`);
    else if (isSeeker(item)) router.push(`/seeker/${item.id}`);
  };

  // Image URL handling
  const imageUri = isListing(item)
    ? getImageUrl(item.images?.[0]?.imagePath, "listing", item.id)
    : getImageUrl(item.profilePhotoUrl, "seeker", item.id);

  const title = isListing(item)
    ? item.title
    : `${item.user?.firstName || "İsimsiz"} ${item.user?.lastName || ""}`;

  const subtitle = isListing(item)
    ? item.address
    : item.preferredAreas?.[0] || item.city || "";

  const price = isListing(item)
    ? `₺${parseFloat(item.rentAmount || 0).toLocaleString("tr-TR")}/ay`
    : `₺${parseFloat(item.budget || 0).toLocaleString("tr-TR")}/ay bütçe`;

  const label = isListing(item) ? "Oda İlanı" : "Oda Arkadaşı Arıyor";

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.card}
      activeOpacity={0.9}
    >
      <View style={styles.imageWrapper}>
        {!imageError ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.placeholderContainer}
          >
            <MaterialIcons
              name="image-not-supported"
              size={40}
              color={colors.textWhite}
            />
            <Text style={styles.placeholderText}>Görsel Yüklenemedi</Text>
          </LinearGradient>
        )}

        {/* Top-right badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{label}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {subtitle ? (
          <View style={styles.detailRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.textLight}
            />
            <Text style={styles.address} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        ) : null}

        <Text style={styles.price}>{price}</Text>

        {isSeeker(item) && item.bio ? (
          <Text style={styles.bio} numberOfLines={2}>
            {item.bio}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.md,
    marginHorizontal: spacing.base,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  imageWrapper: {
    borderRadius: borderRadius.md,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  placeholderContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: colors.textWhite,
    fontSize: fonts.size.sm,
    marginTop: 4,
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: "white",
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.medium,
  },
  content: {
    marginTop: spacing.sm,
    gap: 4,
  },
  title: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  address: {
    fontSize: 14,
    color: colors.textLight,
    flexShrink: 1,
  },
  price: {
    fontSize: fonts.size.base,
    fontWeight: "700",
    color: colors.accent,
    marginTop: 2,
  },
  bio: {
    fontSize: fonts.size.sm,
    color: colors.textLight,
  },
});

// ✅ Wrappers
export function ListingCard({ listing }: { listing: any }) {
  return <UnifiedCard item={listing} />;
}

export function SeekerCard({ seeker }: { seeker: any }) {
  return <UnifiedCard item={seeker} />;
}
