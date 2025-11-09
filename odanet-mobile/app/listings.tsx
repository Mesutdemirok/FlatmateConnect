import { View, ScrollView, Text, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useListings } from "../hooks/useListings";
import { ListingCard } from "../components/ListingCard";

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
          <Ionicons name="arrow-back" size={24} color="#111111" />
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
            colors={["#00A6A6"]}
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
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  countText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  loadingText: {
    color: "#666666",
  },
  errorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  errorTitle: {
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "600",
  },
  errorText: {
    color: "#666666",
    textAlign: "center",
    fontSize: 14,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#666666",
    textAlign: "center",
  },
});
