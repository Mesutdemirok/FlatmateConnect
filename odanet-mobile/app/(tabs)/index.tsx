import { View, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { Text, ActivityIndicator, Card, Chip, Searchbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { useListings } from "../../hooks/useListings";
import { ListingCard } from "../../components/ListingCard";

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
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#00A6A6"]} />
        }
      >
        <LinearGradient
          colors={["#00A6A6", "#00B8B8"]}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <MaterialCommunityIcons name="home-heart" size={48} color="#FFFFFF" />
            <Text style={styles.heroTitle}>Odanet'e Hoş Geldiniz</Text>
            <Text style={styles.heroSubtitle}>
              Oda arkadaşı bulun veya oda kiralayın
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Şehir, ilçe veya mahalle ara..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor="#00A6A6"
            inputStyle={styles.searchInput}
          />
        </View>

        <View style={styles.quickFilters}>
          <Chip
            icon="home-city"
            style={styles.chip}
            textStyle={styles.chipText}
            onPress={() => {}}
          >
            Daire
          </Chip>
          <Chip
            icon="home-variant"
            style={styles.chip}
            textStyle={styles.chipText}
            onPress={() => {}}
          >
            Müstakil
          </Chip>
          <Chip
            icon="bed"
            style={styles.chip}
            textStyle={styles.chipText}
            onPress={() => {}}
          >
            Mobilyalı
          </Chip>
        </View>

        <View style={styles.listingsContainer}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="fire" size={24} color="#00A6A6" />
            <Text style={styles.sectionTitle}>Son İlanlar</Text>
          </View>

          {isLoading && !refreshing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00A6A6" />
              <Text style={styles.loadingText}>İlanlar yükleniyor...</Text>
            </View>
          )}

          {error && (
            <Card style={styles.errorCard}>
              <Card.Content>
                <Text style={styles.errorText}>
                  İlanlar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
                </Text>
              </Card.Content>
            </Card>
          )}

          {listings && listings.length > 0 ? (
            <View style={styles.listingsGrid}>
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </View>
          ) : (
            !isLoading &&
            !error && (
              <Card style={styles.emptyCard}>
                <Card.Content>
                  <MaterialCommunityIcons
                    name="home-search"
                    size={64}
                    color="#CCCCCC"
                    style={styles.emptyIcon}
                  />
                  <Text style={styles.emptyText}>Henüz ilan bulunmuyor</Text>
                  <Text style={styles.emptySubtext}>
                    Yeni ilanlar eklendiğinde burada görünecek
                  </Text>
                </Card.Content>
              </Card>
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
    backgroundColor: "#F2F2F2",
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  heroContent: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 16,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 8,
    textAlign: "center",
    opacity: 0.95,
  },
  searchContainer: {
    padding: 16,
    marginTop: -24,
  },
  searchbar: {
    backgroundColor: "#FFFFFF",
    elevation: 4,
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 14,
  },
  quickFilters: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: "#FFFFFF",
    borderColor: "#00A6A6",
    borderWidth: 1,
  },
  chipText: {
    color: "#00A6A6",
    fontSize: 12,
  },
  listingsContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222222",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666666",
  },
  errorCard: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    fontSize: 14,
  },
  listingsGrid: {
    gap: 12,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 32,
  },
  emptyIcon: {
    alignSelf: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666666",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
    marginTop: 8,
  },
});
