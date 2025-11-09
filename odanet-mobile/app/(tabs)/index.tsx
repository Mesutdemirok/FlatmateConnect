import { View, ScrollView, Text, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useListings } from "../../hooks/useListings";
import { ListingCard } from "../../components/ListingCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SecondaryButton } from "../../components/SecondaryButton";
import { SearchInput } from "../../components/SearchInput";

export default function HomeScreen() {
  const { data: listings, isLoading, error, refetch } = useListings();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
        {/* Logo and Tagline */}
        <View style={styles.header}>
          <Text style={styles.logo}>Odanet</Text>
          <Text style={styles.tagline}>
            Türkiye'nin güvenilir oda ve ev arkadaşı platformu
          </Text>
        </View>

        <View style={styles.content}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <SearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Şehir veya semt ara..."
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <PrimaryButton
              title="Oda arıyorum"
              onPress={() => {}}
              style={styles.buttonSpacing}
            />
            <SecondaryButton
              title="Oda veriyorum"
              onPress={() => {}}
            />
          </View>

          {/* Listings Section */}
          <View style={styles.listingsSection}>
            <Text style={styles.sectionTitle}>🏡 Güncel İlanlar</Text>

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
                {listings.slice(0, 5).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
                <SecondaryButton
                  title="Tüm İlanları Gör"
                  onPress={() => {}}
                  style={styles.viewAllButton}
                />
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00A6A6",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  buttonsContainer: {
    marginBottom: 24,
  },
  buttonSpacing: {
    marginBottom: 12,
  },
  listingsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
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
  viewAllButton: {
    marginTop: 8,
  },
});
