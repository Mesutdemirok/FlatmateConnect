import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { colors, fonts, borderRadius, spacing } from "../theme";
import { getImageUrl } from "../config";
import { useState, useEffect } from "react";

// Helper: check if date is within N days
const isWithinDays = (date: string | Date | undefined, days: number): boolean => {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays < days;
};

export function ListingCard({ listing }: { listing: any }) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  // Reset error state when listing changes
  useEffect(() => {
    setImageError(false);
  }, [listing.id]);

  // Determine badge text
  let badge = null;
  if (isWithinDays(listing.updatedAt, 7)) badge = "GÜNCELLEND İ";
  else if (isWithinDays(listing.createdAt, 7)) badge = "YENİ";

  // Get primary image
  const primaryImage = listing.images?.find((img: any) => img.isPrimary) ?? listing.images?.[0];
  const imageUri = getImageUrl(primaryImage?.imagePath, "listing", listing.id);

  // Format location with fallback to address
  const location = (() => {
    const cityDistrict = [listing.district, listing.city].filter(Boolean).join(", ");
    if (cityDistrict) return cityDistrict;
    // Fallback: show first part of address (before comma or first 40 chars)
    if (listing.address) {
      const addressPart = listing.address.split(",")[0];
      return addressPart.length > 40 ? addressPart.substring(0, 37) + "..." : addressPart;
    }
    return "";
  })();

  // Format price
  const amount = parseFloat(listing.rentAmount || 0);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/listing/${listing.id}`)}
      style={styles.card}
      activeOpacity={0.9}
    >
      {/* HERO IMAGE */}
      <View style={styles.imageContainer}>
        {!imageError ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <LinearGradient
            colors={["#7F00FF", "#E100FF"]}
            style={styles.placeholder}
          >
            <Text style={styles.placeholderText}>Görsel bulunamadı</Text>
          </LinearGradient>
        )}

        {/* NEW/UPDATED BADGE */}
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}

        {/* BOTTOM WHITE OVERLAY */}
        <View style={styles.overlay}>
          <Text style={styles.title} numberOfLines={2}>
            {listing.title}
          </Text>

          {location ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color="#009688" />
              <Text style={styles.location} numberOfLines={1}>
                {location}
              </Text>
            </View>
          ) : null}

          <Text style={styles.price}>
            ₺{amount.toLocaleString("tr-TR")}
            <Text style={styles.priceUnit}>/ay</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Keep SeekerCard separate (from original UnifiedCard logic)
export function SeekerCard({ seeker }: { seeker: any }) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [seeker.id]);

  const imageUri = getImageUrl(seeker.profilePhotoUrl, "seeker", seeker.id);
  const title = `${seeker.user?.firstName || "İsimsiz"} ${seeker.user?.lastName || ""}`;
  const subtitle = seeker.preferredLocation || seeker.city || "";
  const price = `₺${parseFloat(seeker.budgetMonthly || 0).toLocaleString("tr-TR")}/ay bütçe`;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/seeker/${seeker.id}`)}
      style={styles.card}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {!imageError ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <LinearGradient
            colors={["#7F00FF", "#E100FF"]}
            style={styles.placeholder}
          >
            <MaterialIcons name="image-not-supported" size={40} color="#FFF" />
            <Text style={styles.placeholderText}>Görsel Yüklenemedi</Text>
          </LinearGradient>
        )}

        <View style={[styles.badge, { backgroundColor: "#6A1B9A" }]}>
          <Text style={styles.badgeText}>Oda Arkadaşı Arıyor</Text>
        </View>

        <View style={styles.overlay}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          {subtitle ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color="#009688" />
              <Text style={styles.location} numberOfLines={1}>
                {subtitle}
              </Text>
            </View>
          ) : null}

          <Text style={styles.price}>
            {price}
          </Text>

          {seeker.about ? (
            <Text style={styles.bio} numberOfLines={2}>
              {seeker.about}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
  },
  image: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  placeholder: {
    width: "100%",
    aspectRatio: 16 / 9,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#009688",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 12,
    right: 12,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  price: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6A1B9A",
  },
  priceUnit: {
    fontSize: 16,
    fontWeight: "400",
    color: "#6B7280",
  },
  bio: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },
});

// Unified card component that renders either ListingCard or SeekerCard based on type
export function UnifiedCard({ item }: { item: any }) {
  if (item.type === "seeker") {
    return <SeekerCard seeker={item} />;
  }
  return <ListingCard listing={item} />;
}
