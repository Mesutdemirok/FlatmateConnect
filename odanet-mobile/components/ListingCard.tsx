import { View, StyleSheet, Image } from "react-native";
import { Card, Text, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Listing } from "../hooks/useListings";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const placeholderImage = "https://via.placeholder.com/400x250/00A6A6/FFFFFF?text=Odanet";

  return (
    <Card
      style={styles.card}
      onPress={() => router.push(`/listing/${listing.id}`)}
      mode="elevated"
    >
      <Card.Cover
        source={{ uri: placeholderImage }}
        style={styles.cardCover}
      />
      <Card.Content style={styles.cardContent}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {listing.title}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₺{listing.rentAmount}</Text>
            <Text style={styles.priceLabel}>/ay</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#666666" />
          <Text style={styles.location} numberOfLines={1}>
            {listing.address}
          </Text>
        </View>

        <View style={styles.chipsRow}>
          {listing.propertyType && (
            <Chip
              icon="home-city"
              style={styles.chip}
              textStyle={styles.chipText}
              compact
            >
              {listing.propertyType}
            </Chip>
          )}
          {listing.totalRooms && (
            <Chip
              icon="bed"
              style={styles.chip}
              textStyle={styles.chipText}
              compact
            >
              {listing.totalRooms} oda
            </Chip>
          )}
          {listing.furnishingStatus && (
            <Chip
              icon="sofa"
              style={styles.chip}
              textStyle={styles.chipText}
              compact
            >
              {listing.furnishingStatus}
            </Chip>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
    overflow: "hidden",
  },
  cardCover: {
    backgroundColor: "#E5E5E5",
  },
  cardContent: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222222",
    flex: 1,
    marginRight: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00A6A6",
  },
  priceLabel: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  location: {
    fontSize: 13,
    color: "#666666",
    marginLeft: 4,
    flex: 1,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    height: 28,
  },
  chipText: {
    fontSize: 11,
    color: "#666666",
  },
});
