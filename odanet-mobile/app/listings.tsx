import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useListings, type Listing } from "../hooks/useListings";
import { ListingCard } from "../components/ListingCard";
import { colors, fonts, borderRadius, spacing } from "../theme";

export default function ListingsScreen() {
  const router = useRouter();
  const { data: listings, isLoading, error, refetch } = useListings();
  const [refreshing, setRefreshing] = useState(false);

  // Normalize API response (array OR { data: array })
  const items: Listing[] = useMemo(() => {
    if (Array.isArray(listings)) return listings as Listing[];
    if (listings && Array.isArray((listings as any).data)) {
      return (listings as any).data as Listing[];
    }
    return [];
  }, [listings]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tüm İlanlar</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Error banner (non-blocking) */}
      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Hata Oluştu</Text>
          <Text style={styles.errorText}>
            İlanlar yüklenirken bir hata oluştu.
          </Text>
          <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.accent]}
          />
        }
        ListHeaderComponent={
          !isLoading && items.length > 0 ? (
            <Text style={styles.countText}>{items.length} ilan bulundu</Text>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Henüz ilan bulunmamaktadır</Text>
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { padding: spacing.sm },
  headerTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
  },
  placeholder: { width: 40 },

  content: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    gap: spacing.sm,
  },

  countText: {
    fontSize: fonts.size.sm,
    color: colors.textLight,
    marginBottom: spacing.md,
  },

  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
  },
  loadingText: { color: colors.textLight },

  errorCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.base,
    marginTop: spacing.base,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorTitle: {
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.xs,
    fontWeight: fonts.weight.semibold,
  },
  errorText: {
    color: colors.textLight,
    textAlign: "center",
    fontSize: fonts.size.sm,
  },
  retryButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryText: { color: colors.textWhite, fontWeight: fonts.weight.semibold },

  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: "center",
    marginHorizontal: spacing.base,
    marginTop: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: { color: colors.textLight, textAlign: "center" },
});
