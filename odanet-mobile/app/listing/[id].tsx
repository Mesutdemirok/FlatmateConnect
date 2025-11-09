import { View, ScrollView, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useListing } from "../../hooks/useListings";
import { colors, fonts, borderRadius, spacing } from "../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading, error } = useListing(id!);
  
  // ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURNS
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const flatListRef = useRef<FlatList>(null);
  
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentImageIndex(viewableItems[0].index || 0);
    }
  }).current;
  
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

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

  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : [];

  const renderImageItem = ({ item }: { item: any }) => {
    const hasError = imageErrors.has(item.id);
    // Support both imagePath (current API) and imageUrl (legacy fallback)
    const imageUri = item.imagePath || item.imageUrl;
    
    if (hasError || !imageUri) {
      return (
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.galleryImage}
        >
          <Text style={styles.placeholderIcon}>🏠</Text>
          <Text style={styles.placeholderText}>Fotoğraf Yüklenemedi</Text>
        </LinearGradient>
      );
    }
    
    return (
      <Image
        source={{ uri: imageUri }}
        style={styles.galleryImage}
        resizeMode="cover"
        onError={() => {
          setImageErrors(prev => new Set(prev).add(item.id));
        }}
      />
    );
  };

  const renderPaginationDots = () => (
    <View style={styles.pagination}>
      {images.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === currentImageIndex && styles.paginationDotActive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Image Gallery */}
      {images.length > 0 ? (
        <View style={styles.galleryContainer}>
          <FlatList
            ref={flatListRef}
            data={images}
            renderItem={renderImageItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
          {images.length > 1 && renderPaginationDots()}
        </View>
      ) : (
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.placeholderImage}
        >
          <Text style={styles.placeholderIcon}>🏠</Text>
          <Text style={styles.placeholderText}>Fotoğraf Yok</Text>
        </LinearGradient>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title and Address */}
          <Text style={styles.title}>{listing.title}</Text>

          {listing.address && (
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={20} color={colors.accent} />
              <Text style={styles.address}>{listing.address}</Text>
            </View>
          )}

          {/* Price - Only show if rentAmount is valid */}
          {listing.rentAmount && !isNaN(parseFloat(listing.rentAmount)) && (
            <Text style={styles.price}>
              ₺{parseFloat(listing.rentAmount).toLocaleString("tr-TR")} / ay
            </Text>
          )}

          {/* Property Details - Only show if at least one detail exists */}
          {(listing.propertyType || listing.totalRooms || listing.furnishingStatus || 
            listing.bathroomType || listing.totalOccupants !== undefined || listing.roommatePreference) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Özellikler</Text>
              <View style={styles.detailsGrid}>
                {listing.propertyType && (
                  <View style={styles.detailItem}>
                    <Ionicons name="business-outline" size={20} color={colors.accent} />
                    <Text style={styles.detailLabel}>Konut Tipi</Text>
                    <Text style={styles.detailValue}>{listing.propertyType}</Text>
                  </View>
                )}
                
                {listing.totalRooms && (
                  <View style={styles.detailItem}>
                    <Ionicons name="home-outline" size={20} color={colors.accent} />
                    <Text style={styles.detailLabel}>Oda Sayısı</Text>
                    <Text style={styles.detailValue}>{listing.totalRooms}</Text>
                  </View>
                )}
                
                {listing.furnishingStatus && (
                  <View style={styles.detailItem}>
                    <Ionicons name="bed-outline" size={20} color={colors.accent} />
                    <Text style={styles.detailLabel}>Eşya Durumu</Text>
                    <Text style={styles.detailValue}>{listing.furnishingStatus}</Text>
                  </View>
                )}
                
                {listing.bathroomType && (
                  <View style={styles.detailItem}>
                    <Ionicons name="water-outline" size={20} color={colors.accent} />
                    <Text style={styles.detailLabel}>Banyo</Text>
                    <Text style={styles.detailValue}>{listing.bathroomType}</Text>
                  </View>
                )}
                
                {listing.totalOccupants !== undefined && (
                  <View style={styles.detailItem}>
                    <Ionicons name="people-outline" size={20} color={colors.accent} />
                    <Text style={styles.detailLabel}>Kişi Sayısı</Text>
                    <Text style={styles.detailValue}>{listing.totalOccupants}</Text>
                  </View>
                )}
                
                {listing.roommatePreference && (
                  <View style={styles.detailItem}>
                    <Ionicons name="person-outline" size={20} color={colors.accent} />
                    <Text style={styles.detailLabel}>Tercih</Text>
                    <Text style={styles.detailValue}>{listing.roommatePreference}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Included Services - Only show if at least one service is included */}
          {(listing.billsIncluded || listing.internetIncluded) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dahil Olanlar</Text>
              <View style={styles.badgesContainer}>
                {listing.billsIncluded && (
                  <View style={styles.badge}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={styles.badgeText}>Faturalar Dahil</Text>
                  </View>
                )}
                {listing.internetIncluded && (
                  <View style={styles.badge}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={styles.badgeText}>İnternet</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Amenities */}
          {listing.amenities && listing.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Olanaklar</Text>
              <View style={styles.amenitiesContainer}>
                {listing.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityChip}>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Smoking Policy */}
          {listing.smokingPolicy && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sigara Politikası</Text>
              <Text style={styles.policyText}>{listing.smokingPolicy}</Text>
            </View>
          )}

          {/* Description */}
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
  galleryContainer: {
    height: 300,
    backgroundColor: colors.border,
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: 300,
    backgroundColor: colors.border,
  },
  pagination: {
    position: "absolute",
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  paginationDotActive: {
    backgroundColor: colors.textWhite,
    width: 24,
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
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  detailItem: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  detailLabel: {
    fontSize: fonts.size.xs,
    color: colors.textLight,
    fontWeight: fonts.weight.medium,
  },
  detailValue: {
    fontSize: fonts.size.base,
    color: colors.text,
    fontWeight: fonts.weight.semibold,
    textTransform: "capitalize",
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  badgeText: {
    fontSize: fonts.size.sm,
    color: colors.text,
    fontWeight: fonts.weight.medium,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  amenityChip: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  amenityText: {
    fontSize: fonts.size.sm,
    color: colors.text,
    textTransform: "capitalize",
  },
  policyText: {
    fontSize: fonts.size.base,
    color: colors.textLight,
    textTransform: "capitalize",
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
