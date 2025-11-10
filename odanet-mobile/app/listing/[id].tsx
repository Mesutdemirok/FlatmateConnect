import {
  View,
  ScrollView,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useListing } from "../../hooks/useListings";
import { colors, fonts, borderRadius, spacing } from "../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const STATUS_BAR_HEIGHT = Platform.OS === "ios" ? 44 : 0;

export default function ListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading, error } = useListing(id!);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleGoBack = () => {
    if (router.canGoBack()) router.back();
    else router.push("/(tabs)");
  };

  const handleContact = () => {
    console.log(`Contacting owner of listing ${id}`);
    router.push(`/chat/${listing?.ownerId}`);
  };

  const images = useMemo(
    () =>
      Array.isArray(listing?.images)
        ? listing!.images.map((img, i) => ({
            id: String(img.id ?? i),
            uri: img.imagePath || img.imageUrl || "",
          }))
        : [],
    [listing],
  );

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      setCurrentImageIndex(viewableItems[0].index || 0);
    }
  }).current;

  // --- Loading State ---
  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.muted}>İlan yükleniyor...</Text>
      </View>
    );
  }

  // --- Error State ---
  if (error || !listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorHeader}>
          <TouchableOpacity onPress={handleGoBack} style={styles.errorBackBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.errorText}>İlan Detayı</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>Aradığınız ilan bulunamadı.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- Main Content ---
  return (
    <View style={styles.container}>
      {/* 1. Image Gallery */}
      <View style={styles.galleryWrapper}>
        {images.length > 0 ? (
          <>
            <FlatList
              ref={flatListRef}
              data={images}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item.uri }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              )}
              keyExtractor={(it) => it.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            />
            <LinearGradient
              colors={["rgba(0,0,0,0.4)", "transparent"]}
              style={styles.topGradient}
            />
            <SafeAreaView style={styles.floatingHeader}>
              <TouchableOpacity
                onPress={handleGoBack}
                style={styles.floatingButton}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={colors.textWhite}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsFavorite((prev) => !prev)}
                style={styles.floatingButton}
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={24}
                  color={isFavorite ? colors.error : colors.textWhite}
                />
              </TouchableOpacity>
            </SafeAreaView>
            {images.length > 1 && (
              <View style={styles.pagination}>
                {images.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === currentImageIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons name="image-outline" size={48} color="#aaa" />
            <Text style={styles.muted}>Görsel Yok</Text>
          </View>
        )}
      </View>

      {/* 2. Scrollable Info */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title and Price */}
        <View style={[styles.card, styles.titlePriceBlock]}>
          <Text style={styles.title}>{listing.title}</Text>
          {listing.rentAmount && (
            <Text style={styles.price}>
              ₺{parseFloat(listing.rentAmount).toLocaleString("tr-TR")}
              <Text style={styles.priceSuffix}> / ay</Text>
            </Text>
          )}
          {listing.address && (
            <View style={styles.row}>
              <Ionicons
                name="location-outline"
                size={18}
                color={colors.accent}
              />
              <Text style={styles.address}>{listing.address}</Text>
            </View>
          )}
        </View>

        {/* Features */}
        <View style={styles.card}>
          <Section title="Özellikler">
            <DetailGrid listing={listing} />
          </Section>
        </View>

        {/* Description */}
        {listing.description && (
          <View style={styles.card}>
            <Section title="Açıklama">
              <Text style={styles.desc}>{listing.description}</Text>
            </Section>
          </View>
        )}

        {/* Amenities */}
        {listing.amenities?.length > 0 && (
          <View style={styles.card}>
            <Section title="Olanaklar">
              <View style={styles.chipWrap}>
                {listing.amenities.map((a, i) => (
                  <View key={i} style={styles.chip}>
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={colors.primary}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.chipText}>{a}</Text>
                  </View>
                ))}
              </View>
            </Section>
          </View>
        )}

        {/* Location Section */}
        <View style={styles.card}>
          <Section title="Konum">
            <View style={styles.locationRow}>
              <View style={styles.locationIcon}>
                <Ionicons name="location" size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                {(listing.city || listing.district || listing.neighborhood) ? (
                  <>
                    <Text style={styles.locationText}>
                      {[listing.neighborhood, listing.district, listing.city]
                        .filter(Boolean)
                        .join(", ")}
                    </Text>
                    {listing.address && (
                      <Text style={styles.locationSubtext}>{listing.address}</Text>
                    )}
                  </>
                ) : (
                  listing.address && (
                    <Text style={styles.locationText}>{listing.address}</Text>
                  )
                )}
              </View>
            </View>
          </Section>
        </View>

        {/* Terms Section */}
        {(() => {
          const hasDeposit = listing.deposit && !isNaN(parseFloat(listing.deposit));
          const hasMoveInDate = listing.moveInDate && !isNaN(new Date(listing.moveInDate).getTime());
          const hasMinStay = listing.minStayMonths && Number(listing.minStayMonths) > 0;
          
          if (!hasDeposit && !hasMoveInDate && !hasMinStay) return null;
          
          return (
            <View style={styles.card}>
              <Section title="Kiralama Koşulları">
                <View style={styles.termsGrid}>
                  {hasDeposit && (
                    <View style={styles.termCard}>
                      <View style={styles.termIcon}>
                        <MaterialCommunityIcons
                          name="cash-multiple"
                          size={20}
                          color={colors.primary}
                        />
                      </View>
                      <Text style={styles.termLabel}>Depozito</Text>
                      <Text style={styles.termValue}>
                        ₺{parseFloat(listing.deposit).toLocaleString("tr-TR")}
                      </Text>
                    </View>
                  )}
                  {hasMoveInDate && (
                    <View style={styles.termCard}>
                      <View style={styles.termIcon}>
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color={colors.primary}
                        />
                      </View>
                      <Text style={styles.termLabel}>Taşınma Tarihi</Text>
                      <Text style={styles.termValue}>
                        {new Date(listing.moveInDate).toLocaleDateString("tr-TR")}
                      </Text>
                    </View>
                  )}
                  {hasMinStay && (
                    <View style={styles.termCard}>
                      <View style={styles.termIcon}>
                        <Ionicons
                          name="time-outline"
                          size={20}
                          color={colors.primary}
                        />
                      </View>
                      <Text style={styles.termLabel}>Min. Kalış</Text>
                      <Text style={styles.termValue}>{listing.minStayMonths} ay</Text>
                    </View>
                  )}
                </View>
              </Section>
            </View>
          );
        })()}

        {/* Contact Card */}
        <View style={[styles.card, { marginBottom: 40 }]}>
          <View style={contactCardStyles.infoRow}>
            <View style={contactCardStyles.avatar}>
              <Text style={contactCardStyles.avatarText}>
                {listing.ownerName?.charAt(0) ?? "İ"}
              </Text>
            </View>
            <View>
              <Text style={contactCardStyles.title}>İlan Sahibi</Text>
              <Text style={contactCardStyles.ownerName}>
                {listing.ownerName || "Bilinmiyor"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 3. Sticky Contact Button */}
      <View style={styles.stickyActionFooter}>
        <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color={colors.textWhite}
          />
          <Text style={styles.contactButtonText}>İlan Sahibine Ulaş</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------- Subcomponents ---------- */
function Section({ title, children }: any) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function DetailGrid({ listing }: any) {
  const details = [
    {
      label: "Konut Tipi",
      value: listing.propertyType,
      icon: "office-building-outline",
    },
    { label: "Oda Sayısı", value: listing.totalRooms, icon: "bed-outline" },
    {
      label: "Eşya Durumu",
      value: listing.furnishingStatus,
      icon: "sofa-outline",
    },
    { label: "Banyo", value: listing.bathroomType, icon: "shower-head" },
    {
      label: "Kişi Sayısı",
      value: listing.totalOccupants,
      icon: "account-multiple-outline",
    },
    {
      label: "Tercih",
      value: listing.roommatePreference,
      icon: "gender-male-female",
    },
  ].filter((d) => d.value);

  if (details.length === 0) return null;

  return (
    <View style={styles.detailGrid}>
      {details.map((d, i) => (
        <View key={i} style={styles.detailCard}>
          <MaterialCommunityIcons
            name={d.icon as any}
            size={24}
            color={colors.primary}
          />
          <Text style={styles.detailLabel}>{d.label}</Text>
          <Text style={styles.detailValue}>{d.value}</Text>
        </View>
      ))}
    </View>
  );
}

/* ---------- Styles ---------- */
const contactCardStyles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + "30",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.base,
  },
  avatarText: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.semibold,
    color: colors.primary,
  },
  title: { fontSize: fonts.size.sm, color: colors.textLight },
  ownerName: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  muted: { color: colors.textLight },

  galleryWrapper: { height: 350, backgroundColor: "#eee", overflow: "hidden" },
  galleryImage: { width: SCREEN_WIDTH, height: 350 },
  floatingHeader: {
    position: "absolute",
    top: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingTop: STATUS_BAR_HEIGHT + spacing.sm,
    zIndex: 15,
  },
  floatingButton: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  pagination: {
    position: "absolute",
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  dotActive: { width: 20, backgroundColor: colors.accent },
  imageFallback: {
    height: 350,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: { paddingVertical: spacing.lg, gap: spacing.base },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.base,
  },
  titlePriceBlock: { marginTop: -spacing.lg },
  title: {
    fontSize: fonts.size.xxl,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  address: { color: colors.textLight, fontSize: fonts.size.base },
  price: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.accent,
    marginVertical: spacing.sm,
  },
  priceSuffix: { fontSize: fonts.size.lg, color: colors.accent },
  section: { marginBottom: 0 },
  sectionTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  detailCard: {
    width: "31%",
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    height: 90,
  },
  detailLabel: {
    fontSize: fonts.size.xs,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 4,
  },
  detailValue: {
    fontSize: fonts.size.sm,
    color: colors.text,
    fontWeight: fonts.weight.medium,
    textAlign: "center",
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: { fontSize: fonts.size.sm, color: colors.text },
  desc: {
    color: colors.text,
    lineHeight: 22,
    fontSize: fonts.size.base,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  locationText: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
  },
  locationSubtext: {
    fontSize: fonts.size.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  termsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.xs,
  },
  termCard: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  termIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  termLabel: {
    fontSize: fonts.size.xs,
    color: colors.textLight,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  termValue: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
    textAlign: "center",
  },
  stickyActionFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: 8,
    overflow: "hidden",
  },
  contactButtonText: {
    color: colors.textWhite,
    fontWeight: fonts.weight.semibold,
    fontSize: fonts.size.base,
  },
  errorHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.base,
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  errorBackBtn: { padding: spacing.xs },
  errorText: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
    marginLeft: spacing.md,
  },
});
