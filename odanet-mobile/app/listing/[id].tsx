import { View, ScrollView, StyleSheet, Image } from "react-native";
import { Text, Card, ActivityIndicator, Button, Divider, Chip } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useListing } from "../../hooks/useListings";

export default function ListingDetail() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: listing, isLoading, error } = useListing(id || "");

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A6A6" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !listing) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#DC2626" />
          <Text style={styles.errorTitle}>İlan Bulunamadı</Text>
          <Text style={styles.errorText}>
            Bu ilan mevcut değil veya kaldırılmış olabilir.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const firstImage = listing.images?.[0]?.imageUrl;
  const placeholderImage = "https://via.placeholder.com/400x300/00A6A6/FFFFFF?text=No+Image";
  const imageUrl = firstImage || placeholderImage;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.mainImage}
          resizeMode="cover"
        />

        <LinearGradient
          colors={["#00A6A6", "#00B8B8"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.title}>{listing.title}</Text>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#FFFFFF" />
              <Text style={styles.location}>{listing.address}</Text>
            </View>
          </View>
        </LinearGradient>

        <Card style={styles.priceCard}>
          <Card.Content>
            <Text style={styles.priceLabel}>Aylık Kira</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceAmount}>₺{listing.rentAmount}</Text>
              <Text style={styles.priceMonth}>/ay</Text>
            </View>
            {listing.billsIncluded && (
              <Chip icon="check-circle" style={styles.billsChip} textStyle={styles.billsChipText} compact>
                Faturalar dahil
              </Chip>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>İlan Detayları</Text>
            
            {listing.propertyType && (
              <>
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <MaterialCommunityIcons name="home-city" size={20} color="#00A6A6" />
                  </View>
                  <Text style={styles.detailLabel}>Mülk Tipi</Text>
                  <Text style={styles.detailValue}>{listing.propertyType}</Text>
                </View>
                <Divider style={styles.divider} />
              </>
            )}

            {listing.totalRooms && (
              <>
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <MaterialCommunityIcons name="bed" size={20} color="#00A6A6" />
                  </View>
                  <Text style={styles.detailLabel}>Oda Sayısı</Text>
                  <Text style={styles.detailValue}>{listing.totalRooms} oda</Text>
                </View>
                <Divider style={styles.divider} />
              </>
            )}

            {listing.furnishingStatus && (
              <>
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <MaterialCommunityIcons name="sofa" size={20} color="#00A6A6" />
                  </View>
                  <Text style={styles.detailLabel}>Eşya Durumu</Text>
                  <Text style={styles.detailValue}>{listing.furnishingStatus}</Text>
                </View>
                <Divider style={styles.divider} />
              </>
            )}

            {listing.bathroomType && (
              <>
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <MaterialCommunityIcons name="shower" size={20} color="#00A6A6" />
                  </View>
                  <Text style={styles.detailLabel}>Banyo</Text>
                  <Text style={styles.detailValue}>{listing.bathroomType}</Text>
                </View>
                <Divider style={styles.divider} />
              </>
            )}

            {listing.internetIncluded && (
              <>
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <MaterialCommunityIcons name="wifi" size={20} color="#00A6A6" />
                  </View>
                  <Text style={styles.detailLabel}>İnternet</Text>
                  <Text style={styles.detailValue}>Var</Text>
                </View>
                <Divider style={styles.divider} />
              </>
            )}

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MaterialCommunityIcons name="calendar" size={20} color="#00A6A6" />
              </View>
              <Text style={styles.detailLabel}>İlan Tarihi</Text>
              <Text style={styles.detailValue}>
                {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {listing.amenities && listing.amenities.length > 0 && (
          <Card style={styles.amenitiesCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Olanaklar</Text>
              <View style={styles.amenitiesGrid}>
                {listing.amenities.map((amenity, index) => (
                  <Chip
                    key={index}
                    icon="check"
                    style={styles.amenityChip}
                    textStyle={styles.amenityChipText}
                    compact
                  >
                    {amenity}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        <View style={styles.contactContainer}>
          <Button
            mode="contained"
            onPress={() => {}}
            buttonColor="#00A6A6"
            textColor="#FFFFFF"
            icon="message-text"
            style={styles.contactButton}
            contentStyle={styles.contactButtonContent}
          >
            İletişime Geç
          </Button>
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666666",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222222",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  mainImage: {
    width: "100%",
    height: 250,
    backgroundColor: "#E5E5E5",
  },
  headerGradient: {
    padding: 20,
    marginTop: -30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerContent: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  location: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.95,
  },
  priceCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  priceLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#00A6A6",
  },
  priceMonth: {
    fontSize: 16,
    color: "#666666",
    marginLeft: 4,
  },
  billsChip: {
    backgroundColor: "#E8F5E9",
    marginTop: 8,
    alignSelf: "flex-start",
  },
  billsChipText: {
    color: "#2E7D32",
    fontSize: 12,
  },
  detailsCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailIcon: {
    width: 32,
    alignItems: "center",
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: "#666666",
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  divider: {
    backgroundColor: "#E5E5E5",
  },
  amenitiesCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityChip: {
    backgroundColor: "#F2F2F2",
  },
  amenityChipText: {
    fontSize: 12,
    color: "#222222",
  },
  contactContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  contactButton: {
    borderRadius: 12,
  },
  contactButtonContent: {
    height: 56,
  },
});
