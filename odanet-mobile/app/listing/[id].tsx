import { View, ScrollView, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useListingById } from "../../hooks/useListings";
import { colors, fonts, borderRadius, spacing } from "../../theme";

export default function ListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading, error } = useListingById(id!);
  const [imageError, setImageError] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>İlan bulunamadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  const firstImage = listing.images?.[0]?.imageUrl;
  const showPlaceholder = !firstImage || imageError;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {showPlaceholder ? (
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.placeholderImage}
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>{listing.title}</Text>

          {listing.address && (
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={20} color={colors.accent} />
              <Text style={styles.address}>{listing.address}</Text>
            </View>
          )}

          <Text style={styles.price}>
            {parseFloat(listing.rentAmount || "0").toLocaleString("tr-TR")} TL / ay
          </Text>

          {listing.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Açıklama</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </View>
          )}
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: 300,
    backgroundColor: colors.border,
  },
  placeholderImage: {
    width: "100%",
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: 64,
    color: colors.textWhite,
  },
  placeholderText: {
    fontSize: fonts.size.base,
    color: colors.textWhite,
    marginTop: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fonts.size.xxl,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  address: {
    fontSize: fonts.size.base,
    color: colors.textLight,
    flex: 1,
  },
  price: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.accent,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fonts.size.base,
    color: colors.textLight,
    lineHeight: 24,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.textLight,
    marginTop: spacing.base,
  },
  errorText: {
    color: colors.error,
    fontSize: fonts.size.base,
  },
});
