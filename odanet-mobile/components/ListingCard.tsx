import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Listing } from "../hooks/useListings";
import { colors, fonts, borderRadius, spacing } from "../theme";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter();
  const firstImage = listing.images?.[0]?.imagePath;
  const [imageError, setImageError] = useState(false);

  const showPlaceholder = !firstImage || imageError;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/listing/${listing.id}`)}
      activeOpacity={0.7}
      style={styles.container}
    >
      {showPlaceholder ? (
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.placeholderContainer}
        >
          <Text style={styles.placeholderIcon}>🏠</Text>
          <Text style={styles.placeholderText}>Fotoğraf Yok</Text>
        </LinearGradient>
      ) : (
        <Image
          source={{ uri: firstImage }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{listing.title}</Text>
        {listing.address && (
          <Text style={styles.address}>{listing.address}</Text>
        )}
        <Text style={styles.price}>
          {parseFloat(listing.rentAmount || "0").toLocaleString("tr-TR")} TL / ay
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.base,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.border,
  },
  placeholderContainer: {
    width: "100%",
    height: 160,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    color: colors.textWhite,
    fontSize: 48,
  },
  placeholderText: {
    color: colors.textWhite,
    fontSize: fonts.size.sm,
    marginTop: spacing.sm,
  },
  content: {
    gap: 4,
  },
  title: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  address: {
    fontSize: fonts.size.sm,
    color: colors.textLight,
    marginBottom: 4,
  },
  price: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    color: colors.accent,
  },
});
