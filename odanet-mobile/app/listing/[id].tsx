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
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useListing } from "../../hooks/useListings";
// ASSUMPTION: Your theme 'colors.background' is now a light gray (e.g., #F4F6F8)
// and 'colors.card' is white (e.g., #FFFFFF).
import { colors, fonts, borderRadius, spacing } from "../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const STATUS_BAR_HEIGHT = Platform.OS === "ios" ? 44 : 0;

// --- (Social Links constant remains the same) ---
const SOCIAL_LINKS = [
  {
    name: "logo-tiktok",
    href: "https://www.tiktok.com/@odanet.com.tr",
    label: "TikTok",
  },
  {
    name: "logo-facebook",
    href: "https://www.facebook.com/odanet.com.tr/",
    label: "Facebook",
  },
  {
    name: "logo-instagram",
    href: "https://www.instagram.com/odanet.com.tr/",
    label: "Instagram",
  },
  {
    name: "logo-pinterest",
    href: "https://www.pinterest.com/odanet_/",
    label: "Pinterest",
  },
  {
    name: "logo-youtube",
    href: "https://www.youtube.com/@odanet_com_tr",
    label: "YouTube",
  },
];

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
      {/* 1. Image Gallery with Integrated Header Buttons */}
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
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.3)"]}
              style={styles.bottomGradient}
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
              <View style={styles.floatingActionGroup}>
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
                <TouchableOpacity
                  onPress={() => console.log("Share")}
                  style={styles.floatingButton}
                >
                  <Ionicons
                    name="share-outline"
                    size={24}
                    color={colors.textWhite}
                  />
                </TouchableOpacity>
              </View>
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

      {/* 2. Scrollable Content (Card-based Layout) */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title and Price Card */}
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

        {/* Features Card */}
        <View style={styles.card}>
          <Section title="Özellikler">
            <DetailGrid listing={listing} />
          </Section>
        </View>

        {/* Description Card */}
        {listing.description && (
          <View style={styles.card}>
            <Section title="Açıklama">
              <Text style={styles.desc}>{listing.description}</Text>
            </Section>
          </View>
        )}

        {/* Amenities Card */}
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

        {/* 3. Creative Footer: Host Contact Card */}
        <View style={[styles.card, { marginBottom: 0 }]}>
          <HostContactCard
            ownerName={listing.ownerName || "İlan Sahibi"}
            onContact={handleContact}
          />
        </View>

        {/* Brand Assurance (No Card) */}
        <View style={styles.footerWrapper}>
          <View style={styles.brandAssurance}>
            <Text style={styles.brandAssuranceTitle}>Odanet Güvencesi</Text>
            <Text style={styles.brandAssuranceDesc}>
              Şeffaf, güvenli, kolay. Türkiye’nin güvenilir oda kiralama ve ev
              arkadaşı platformu.
            </Text>
            <SocialLinksSection />
          </View>
        </View>

        {/* Spacer to prevent content overlap with sticky footer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 4. Sticky Action Footer (IMPROVED) */}
      <View style={styles.stickyActionFooter}>
        <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
          {/* Gradient background for the button */}
          <LinearGradient
            colors={[colors.primary, colors.accent]} // Use your brand's gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color={colors.textWhite}
          />
          <Text style={styles.contactButtonText}>
            İlan Sahibiyle İletişime Geç
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* -------------------- Sub-Components -------------------- */

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

function HostContactCard({
  ownerName,
  onContact,
}: {
  ownerName: string;
  onContact: () => void;
}) {
  return (
    <View style={contactCardStyles.card}>
      <View style={contactCardStyles.infoRow}>
        <View style={contactCardStyles.avatar}>
          <Text style={contactCardStyles.avatarText}>
            {ownerName.charAt(0)}
          </Text>
        </View>
        <View>
          <Text style={contactCardStyles.title}>İlan Sahibi</Text>
          <Text style={contactCardStyles.ownerName}>{ownerName}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onContact} style={contactCardStyles.ctaButton}>
        <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
        <Text style={contactCardStyles.ctaText}>Mesaj Gönder</Text>
      </TouchableOpacity>
    </View>
  );
}

function SocialLinksSection() {
  return (
    <View style={socialLinksStyles.socialRow}>
      {SOCIAL_LINKS.map((s) => (
        <TouchableOpacity
          key={s.href}
          onPress={() => Linking.openURL(s.href)}
          style={socialLinksStyles.socialBtn}
        >
          <Ionicons name={s.name as any} size={20} color={colors.accent} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* -------------------- Styles -------------------- */

// Host Contact Card Styles
const contactCardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.card, // White background
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderTopWidth: 1, // Separator
    borderTopColor: colors.border,
    marginHorizontal: -spacing.lg, // Expand to edges of parent card
    paddingBottom: 0,
    marginBottom: -spacing.lg, // Consume parent card padding
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
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
    fontWeight: fonts.weight.semibold, // Reduced weight
    color: colors.primary,
  },
  title: {
    fontSize: fonts.size.sm,
    color: colors.textLight,
  },
  ownerName: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold, // Reduced weight
    color: colors.text,
  },
  ctaButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background, // Light gray background
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: 8,
  },
  ctaText: {
    color: colors.primary, // Primary color text
    fontWeight: fonts.weight.semibold, // Reduced weight
    fontSize: fonts.size.base,
  },
});

// Social Links Styles
const socialLinksStyles = StyleSheet.create({
  socialRow: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "center",
    marginTop: spacing.md,
    paddingTop: spacing.sm,
  },
  socialBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
});

// Main Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Main background is light gray
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  muted: { color: colors.textLight },

  // --- Image Gallery & Floating Header ---
  galleryWrapper: {
    height: 350,
    backgroundColor: "#eee",
    overflow: "hidden",
  },
  galleryImage: { width: SCREEN_WIDTH, height: 350 },
  floatingHeader: {
    position: "absolute",
    top: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingTop: Platform.OS === "ios" ? 0 : STATUS_BAR_HEIGHT + spacing.sm,
    zIndex: 15,
  },
  floatingButton: {
    backgroundColor: "rgba(0,0,0,0.3)", // Lighter background
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingActionGroup: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  topGradient: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 100,
    zIndex: 10,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 80,
    zIndex: 10,
  },
  pagination: {
    position: "absolute",
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    zIndex: 12,
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

  // --- Scrollable Content (NEW LAYOUT) ---
  scrollContent: {
    paddingVertical: spacing.lg, // Padding for top and bottom of scroll view
    gap: spacing.base, // Gap between cards
  },

  // NEW Card Style
  card: {
    backgroundColor: colors.card, // White
    borderRadius: borderRadius.lg, // Rounded corners for cards
    padding: spacing.lg,
    marginHorizontal: spacing.base, // Horizontal margin
  },

  titlePriceBlock: {
    marginTop: -spacing.lg, // Negative margin to "pull up" the first card
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: fonts.size.xxl, // Slightly smaller
    fontWeight: fonts.weight.semibold, // Reduced weight
    color: colors.text,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  address: { color: colors.textLight, fontSize: fonts.size.base },
  price: {
    fontSize: fonts.size.xl, // Slightly smaller
    fontWeight: fonts.weight.bold, // Price is still bold
    color: colors.accent,
    marginVertical: spacing.md,
  },
  priceSuffix: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.medium, // Reduced weight
    color: colors.accent,
  },

  // Sections (content within a card)
  section: {
    marginBottom: 0, // Margin is handled by the card
  },
  sectionTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold, // Reduced weight
    color: colors.text,
    marginBottom: spacing.md,
  },

  // Detail Grid (Recessed Look)
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  detailCard: {
    width: "31%",
    backgroundColor: colors.background, // Use light gray for "inset" look
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
    fontWeight: fonts.weight.medium, // Reduced weight
    textAlign: "center",
  },

  // Amenities Chips
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    fontSize: fonts.size.sm,
    color: colors.text,
    fontWeight: fonts.weight.medium,
  },

  desc: {
    color: colors.text,
    lineHeight: 22,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.regular,
  }, // Regular weight

  // --- Footer ---
  footerWrapper: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.base,
  },
  brandAssurance: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  brandAssuranceTitle: {
    fontSize: fonts.size.base, // Smaller
    fontWeight: fonts.weight.semibold, // Reduced weight
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  brandAssuranceDesc: {
    fontSize: fonts.size.sm,
    color: colors.textLight,
    textAlign: "center",
    marginBottom: spacing.md,
  },

  // --- Sticky Action Footer (IMPROVED) ---
  stickyActionFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    padding: spacing.base, // Padding around the button
    paddingBottom: spacing.lg, // Extra padding for safe area
    borderTopWidth: 1,
    borderTopColor: colors.border,
    zIndex: 20,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center the content
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: 8,
    overflow: "hidden", // Important for gradient
  },
  contactButtonText: {
    color: colors.textWhite,
    fontWeight: fonts.weight.semibold, // Semibold for button
    fontSize: fonts.size.base,
  },

  // Error State Header
  errorHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.base,
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  errorBackBtn: {
    padding: spacing.xs,
  },
  errorText: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
    marginLeft: spacing.md,
  },
});
