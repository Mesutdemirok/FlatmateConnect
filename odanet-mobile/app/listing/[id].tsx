import { View, ScrollView, StyleSheet, Image, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useListing } from "../../hooks/useListings";

export default function ListingDetail() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: listing, isLoading, error } = useListing(id || "");

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00A6A6" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color="#DC2626" />
          <Text style={styles.errorTitle}>İlan Bulunamadı</Text>
          <Text style={styles.errorText}>
            Bu ilan mevcut değil veya kaldırılmış olabilir.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const firstImage = listing.images?.[0]?.imageUrl;
  const imageUrl = firstImage || "https://www.odanet.com.tr/uploads/default-room.jpg";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {firstImage ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>🏠 Fotoğraf Yok</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{listing.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.location}>{listing.address}</Text>
          </View>

          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Aylık Kira</Text>
            <Text style={styles.priceAmount}>₺{listing.rentAmount} / ay</Text>
          </View>

          {listing.propertyType && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mülk Tipi:</Text>
              <Text style={styles.detailValue}>{listing.propertyType}</Text>
            </View>
          )}

          {listing.furnishingStatus && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Eşya Durumu:</Text>
              <Text style={styles.detailValue}>{listing.furnishingStatus}</Text>
            </View>
          )}

          {listing.totalRooms && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Oda Sayısı:</Text>
              <Text style={styles.detailValue}>{listing.totalRooms} oda</Text>
            </View>
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
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DC2626",
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  mainImage: {
    width: "100%",
    height: 300,
  },
  placeholder: {
    width: "100%",
    height: 300,
    backgroundColor: "#00A6A6",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  priceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00A6A6",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});
