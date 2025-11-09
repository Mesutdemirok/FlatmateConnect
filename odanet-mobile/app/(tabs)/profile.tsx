import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "../../hooks/useAuth";
import { useListings } from "../../hooks/useListings";
import { useSeekers } from "../../hooks/useSeekers";
import { ListingCard } from "../../components/ListingCard";
import { SeekerCard } from "../../components/SeekerCard";
import { colors, fonts, borderRadius, spacing } from "../../theme";

/** ----------------------------------------------------------------
 * Helper: fetch favorites (mobile)
 * Falls back to [] if endpoint is not present yet.
 * If you already have a favorites hook, swap this with it.
 * ---------------------------------------------------------------*/
async function fetchFavorites() {
  try {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/favorites`, {
      credentials: "include",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}

export default function MobileProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Server data
  const { data: allListings, isLoading: listingsLoading } = useListings();
  const { data: seekers, isLoading: seekersLoading } = useSeekers();

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
    enabled: !!isAuthenticated,
  });

  // Derived data
  const myListings = useMemo(
    () =>
      (allListings || []).filter(
        (l: any) =>
          l.ownerId === user?.id ||
          l.userId === user?.id ||
          l.owner?.id === user?.id,
      ),
    [allListings, user],
  );

  // Popular seekers (first 5)
  const popularSeekers = useMemo(() => {
    const seekerList = Array.isArray(seekers)
      ? seekers
      : Array.isArray(seekers?.data)
        ? seekers.data
        : [];
    return seekerList.slice(0, 5);
  }, [seekers]);

  // Tabs
  const [tab, setTab] = useState<
    "profile" | "preferences" | "listings" | "favorites"
  >("profile");

  // Loading gate
  if (authLoading) {
    return (
      <View
        style={[styles.center, { flex: 1, backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.textLight, marginTop: 8 }}>
          Yükleniyor…
        </Text>
      </View>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.title}>Giriş gerekli</Text>
        <Text style={{ color: colors.textLight, marginVertical: spacing.sm }}>
          Profil ve ilanlarınızı görmek için giriş yapın.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={[styles.primaryBtn, { marginTop: spacing.base }]}
        >
          <Text style={styles.primaryBtnText}>Giriş Yap</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with subtle brand gradient */}
      <LinearGradient
        colors={[colors.background, colors.background]}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Profilim</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.iconBtn}
            >
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Quick actions */}
          <View style={styles.quickRow}>
            <TouchableOpacity
              onPress={() => router.push("/create-listing")}
              style={[styles.quickCard, styles.quickPrimary]}
            >
              <Ionicons
                name="home-outline"
                size={20}
                color={colors.textWhite}
              />
              <Text style={styles.quickPrimaryText}>Oda İlanı Ver</Text>
              <Text style={styles.quickPrimarySub}>
                Kiralık odanızı yayınlayın
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/create-seeker")}
              style={styles.quickCard}
            >
              <Ionicons
                name="person-add-outline"
                size={20}
                color={colors.accent}
              />
              <Text style={styles.quickCardTitle}>Oda Arama İlanı</Text>
              <Text style={styles.quickCardSub}>Profilinizi oluşturun</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {[
              { key: "profile", label: "Profil" },
              { key: "preferences", label: "Tercihler" },
              { key: "listings", label: "İlanlarım" },
              { key: "favorites", label: "Favorilerim" },
            ].map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTab(t.key as any)}
                style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
              >
                <Text
                  style={[
                    styles.tabText,
                    tab === t.key && {
                      color: colors.accent,
                      fontWeight: "700",
                    },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.base, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {tab === "profile" && (
          <View style={{ gap: spacing.base }}>
            {/* User card */}
            <View style={styles.card}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View style={styles.avatar}>
                  {user?.profileImageUrl ? (
                    <Image
                      source={{ uri: user.profileImageUrl }}
                      style={{ width: 56, height: 56, borderRadius: 28 }}
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {(user?.firstName?.[0] || "U").toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>
                    {user?.firstName} {user?.lastName}
                  </Text>
                  <Text
                    style={{ color: colors.textLight, fontSize: fonts.size.sm }}
                  >
                    {user?.email}
                  </Text>
                </View>
              </View>
            </View>

            {/* Account info */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
              <View style={styles.infoGrid}>
                <InfoCell label="Ad" value={user?.firstName || "—"} />
                <InfoCell label="Soyad" value={user?.lastName || "—"} />
                <InfoCell label="E-posta" value={user?.email || "—"} />
                <InfoCell
                  label="Doğrulama"
                  value={
                    user?.verificationStatus === "verified" ? "Doğrulandı" : "—"
                  }
                />
              </View>
            </View>

            {/* Popular Seekers Section */}
            <View style={{ gap: spacing.sm }}>
              <View style={styles.seekerHeader}>
                <Text style={styles.blockTitle}>Popüler Oda Arkadaşları</Text>
                <TouchableOpacity
                  onPress={() => router.push("/")}
                  style={{ padding: 4 }}
                >
                  <Text style={styles.seeAllText}>Tümünü Gör</Text>
                </TouchableOpacity>
              </View>

              {seekersLoading ? (
                <CardPlaceholder />
              ) : popularSeekers.length === 0 ? (
                <View style={[styles.card, { alignItems: "center" }]}>
                  <Ionicons name="people-outline" size={40} color={colors.textLight} />
                  <Text style={[styles.sectionTitle, { marginTop: spacing.sm }]}>
                    Henüz oda arkadaşı yok
                  </Text>
                  <Text
                    style={{
                      color: colors.textLight,
                      textAlign: "center",
                      marginVertical: 6,
                    }}
                  >
                    Oda arayan kişiler burada görünecek.
                  </Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.seekerScroll}
                >
                  {popularSeekers.map((seeker: any) => (
                    <View key={seeker.id} style={styles.seekerCardWrapper}>
                      <SeekerCard seeker={seeker} />
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        )}

        {tab === "preferences" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Tercihler</Text>
            <Text
              style={{ color: colors.textLight, marginBottom: spacing.base }}
            >
              Tercih formunu mobilde sadeleştirdik. “Oda Arama İlanı” ekranına
              giderek (üstteki hızlı buton) tüm tercihleri düzenleyebilirsiniz.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/create-seeker")}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Tercihleri Düzenle</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === "listings" && (
          <View style={{ gap: spacing.base }}>
            <Text style={styles.blockTitle}>Oda İlanlarım</Text>

            {listingsLoading ? (
              <CardPlaceholder />
            ) : myListings.length === 0 ? (
              <EmptyBlock
                icon="home-outline"
                title="Henüz ilan yok"
                subtitle="Kiralık odanızı yayınlayın ve uygun eşleşmeler alın."
                cta="Oda İlanı Ver"
                onPress={() => router.push("/create-listing")}
              />
            ) : (
              myListings.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </View>
        )}

        {tab === "favorites" && (
          <View style={{ gap: spacing.base }}>
            <Text style={styles.blockTitle}>Favorilerim</Text>

            {favoritesLoading ? (
              <CardPlaceholder />
            ) : favorites.length === 0 ? (
              <EmptyBlock
                icon="heart-outline"
                title="Henüz favori yok"
                subtitle="Beğendiğiniz ilanları kaydedin ve buradan yönetin."
                cta="İlanlara Göz At"
                onPress={() => router.push("/listings")}
              />
            ) : (
              favorites.map((fav: any) => (
                <ListingCard
                  key={fav.id || fav.listing?.id}
                  listing={fav.listing || fav}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ----------------------- Small UI helpers ----------------------- */

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoCell}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function EmptyBlock({
  icon,
  title,
  subtitle,
  cta,
  onPress,
}: {
  icon: any;
  title: string;
  subtitle: string;
  cta: string;
  onPress: () => void;
}) {
  return (
    <View style={[styles.card, { alignItems: "center" }]}>
      <Ionicons name={icon} size={40} color={colors.textLight} />
      <Text style={[styles.sectionTitle, { marginTop: spacing.sm }]}>
        {title}
      </Text>
      <Text
        style={{
          color: colors.textLight,
          textAlign: "center",
          marginVertical: 6,
        }}
      >
        {subtitle}
      </Text>
      <TouchableOpacity onPress={onPress} style={styles.primaryBtn}>
        <Text style={styles.primaryBtnText}>{cta}</Text>
      </TouchableOpacity>
    </View>
  );
}

function CardPlaceholder() {
  return (
    <View style={[styles.card, { gap: 12 }]}>
      <PlaceholderBar />
      <PlaceholderBar width="80%" />
      <PlaceholderBar width="60%" />
    </View>
  );
}

function PlaceholderBar({ width = "100%" }: { width?: string }) {
  return (
    <View
      style={{
        width,
        height: 14,
        borderRadius: 7,
        backgroundColor: colors.background,
      }}
    />
  );
}

/* ------------------------------ Styles ------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingBottom: spacing.base,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  headerTitle: {
    flex: 1,
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.text,
  },
  iconBtn: {
    padding: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.card,
  },

  quickRow: {
    flexDirection: "row",
    gap: spacing.base,
    paddingHorizontal: spacing.base,
    marginTop: spacing.base,
  },
  quickCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  quickPrimaryText: {
    color: colors.textWhite,
    fontWeight: "700",
    fontSize: fonts.size.base,
  },
  quickPrimarySub: {
    color: colors.textWhite,
    opacity: 0.9,
    fontSize: fonts.size.sm,
  },
  quickCardTitle: {
    color: colors.text,
    fontWeight: "700",
  },
  quickCardSub: {
    color: colors.textLight,
    fontSize: fonts.size.sm,
  },

  tabs: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    marginTop: spacing.base,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  tabBtnActive: {
    borderColor: colors.accent,
  },
  tabText: {
    fontSize: fonts.size.sm,
    color: colors.text,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent + "22",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.accent, fontWeight: "700", fontSize: 22 },
  name: { color: colors.text, fontSize: fonts.size.lg, fontWeight: "700" },

  sectionTitle: {
    fontSize: fonts.size.lg,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  blockTitle: {
    fontSize: fonts.size.lg,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.base,
  },
  infoCell: {
    width: "47%",
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.base,
  },
  infoLabel: { color: colors.textLight, fontSize: fonts.size.xs },
  infoValue: { color: colors.text, fontWeight: "600", marginTop: 2 },

  primaryBtn: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  primaryBtnText: {
    color: colors.textWhite,
    fontWeight: "700",
    fontSize: fonts.size.base,
  },

  center: { alignItems: "center", justifyContent: "center" },

  seekerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  seeAllText: {
    color: colors.accent,
    fontSize: fonts.size.sm,
    fontWeight: "600",
  },
  seekerScroll: {
    paddingLeft: 2,
    gap: spacing.md,
  },
  seekerCardWrapper: {
    width: 320,
  },
});
