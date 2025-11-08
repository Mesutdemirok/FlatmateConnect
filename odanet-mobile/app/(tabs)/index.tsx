import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
} from "react-native";
import { useListings } from "../hooks/useListings";

type AnyListing = {
  id?: string | number;
  title?: string;
  name?: string;
  location?: string;
  city?: string;
  district?: string;
  price?: number | string;
  image?: string;
  images?: { url?: string }[];
};

export default function Index() {
  const { data, isLoading, error, refetch } = useListings();
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"seeker" | "giver">("seeker");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const listings = useMemo(() => {
    const list: AnyListing[] = Array.isArray(data) ? data : [];
    const q = search.toLowerCase();
    return list
      .filter((it) =>
        q
          ? (it.title || it.name || "").toLowerCase().includes(q) ||
            (it.location || it.city || it.district || "")
              .toLowerCase()
              .includes(q)
          : true,
      )
      .slice(0, 20);
  }, [data, search]);

  const renderItem = ({ item }: { item: AnyListing }) => {
    const title = item.title || item.name || "İlan";
    const loc =
      item.location || [item.district, item.city].filter(Boolean).join(" / ");
    const price =
      typeof item.price === "number"
        ? item.price
        : parseFloat((item.price || "0").toString().replace(/[^\d]/g, "")) ||
          null;
    const imageUri =
      item.image ||
      (item.images && item.images[0]?.url) ||
      "https://odanet.com.tr/default-room.jpg";

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: imageUri }}
          style={styles.cardImage}
          resizeMode="cover"
          onError={(e) => {
            e.currentTarget.setNativeProps({
              src: [{ uri: "https://odanet.com.tr/default-room.jpg" }],
            });
          }}
        />
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardLocation}>{loc}</Text>
          {price && (
            <Text style={styles.cardPrice}>
              ₺{price.toLocaleString("tr-TR")}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: "https://odanet.com.tr/logo512.png" }}
          style={styles.logo}
        />
        <Text style={styles.brand}>Odanet</Text>
        <Text style={styles.tagline}>
          Türkiye'nin güvenilir oda ve ev arkadaşı platformu
        </Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          value={search}
          onChangeText={setSearch}
          placeholder="Şehir veya semt ara..."
          placeholderTextColor="#8A8A8A"
        />
      </View>

      {/* Toggle Buttons */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          onPress={() => setMode("seeker")}
          style={[styles.toggle, mode === "seeker" && styles.toggleActive]}
        >
          <Text
            style={[
              styles.toggleText,
              mode === "seeker" && styles.toggleTextActive,
            ]}
          >
            Oda arıyorum
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMode("giver")}
          style={[styles.toggle, mode === "giver" && styles.toggleActive]}
        >
          <Text
            style={[
              styles.toggleText,
              mode === "giver" && styles.toggleTextActive,
            ]}
          >
            Oda veriyorum
          </Text>
        </TouchableOpacity>
      </View>

      {/* Listings */}
      <FlatList
        data={listings}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        ListHeaderComponent={
          <Text style={styles.section}>🏡 Güncel İlanlar</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              {isLoading
                ? "Yükleniyor..."
                : error
                  ? "İlanlar yüklenemedi."
                  : "Henüz ilan bulunmamaktadır."}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00A6A6"]}
          />
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <FooterButton title="Ana Sayfa" active />
        <FooterButton title="Mesajlar" />
        <FooterButton title="Favoriler" />
        <FooterButton title="Profil" />
      </View>
    </SafeAreaView>
  );
}

const FooterButton = ({
  title,
  active,
}: {
  title: string;
  active?: boolean;
}) => (
  <TouchableOpacity style={styles.footerButton}>
    <Text style={[styles.footerText, active && styles.footerTextActive]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FAFAFA" },

  header: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 16,
  },
  logo: { width: 60, height: 60, borderRadius: 12 },
  brand: { fontSize: 26, fontWeight: "700", color: "#00A6A6", marginTop: 8 },
  tagline: { color: "#666", fontSize: 14, marginTop: 4, textAlign: "center" },

  searchContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  input: {
    backgroundColor: "#fff",
    borderColor: "#E5E5E5",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111",
  },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 10,
  },
  toggle: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00A6A6",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  toggleActive: { backgroundColor: "#00A6A6" },
  toggleText: { color: "#00A6A6", fontWeight: "600" },
  toggleTextActive: { color: "#fff" },

  section: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginLeft: 16,
    marginBottom: 10,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 80 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: { width: "100%", height: 180, backgroundColor: "#EEE" },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  cardLocation: { color: "#666", marginTop: 2 },
  cardPrice: { color: "#00A6A6", fontWeight: "700", marginTop: 6 },

  emptyBox: { paddingVertical: 60, alignItems: "center" },
  emptyText: { color: "#777" },

  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    backgroundColor: "#fff",
    paddingVertical: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerButton: { alignItems: "center" },
  footerText: { color: "#666", fontSize: 13, fontWeight: "600" },
  footerTextActive: { color: "#00A6A6" },
});
