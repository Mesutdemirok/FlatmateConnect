import { View, ScrollView, Text, RefreshControl, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useListings } from "../hooks/useListings";
import { ListingCard } from "../components/ListingCard";
import { colors, fonts, borderRadius, spacing } from "../theme";

export default function ListingsScreen() {
  const router = useRouter();
  const { data: listings, isLoading, error, refetch } = useListings();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.accent]}
          />
        }
      >
        <View style={styles.content}>
          {isLoading && !refreshing && (
            <View style={styles.centerContainer}>
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Hata Oluştu</Text>
              <Text style={styles.errorText}>
                İlanlar yüklenirken bir hata oluştu
              </Text>
            </View>
          )}

          {listings && listings.length > 0 ? (
            <>
              <Text style={styles.countText}>
                {listings.length} ilan bulundu
              </Text>
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </>
          ) : (
            !isLoading && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  Henüz ilan bulunmamaktadır
                </Text>
              </View>
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
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
  loadingText: {
    color: colors.textLight,
  },
  errorCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: "center",
  },
  errorTitle: {
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.sm,
    fontWeight: fonts.weight.semibold,
  },
  errorText: {
    color: colors.textLight,
    textAlign: "center",
    fontSize: fonts.size.sm,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textLight,
    textAlign: "center",
  },
});
