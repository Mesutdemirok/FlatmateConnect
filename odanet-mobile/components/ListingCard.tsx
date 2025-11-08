import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Listing } from "../hooks/useListings";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter();
  const firstImage = listing.images?.[0]?.imageUrl;
  const placeholderImage = "https://via.placeholder.com/400x200/00A6A6/FFFFFF?text=No+Image";
  const imageUrl = firstImage || placeholderImage;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/listing/${listing.id}`)}
      activeOpacity={0.7}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: "100%",
          height: 160,
          borderRadius: 12,
          marginBottom: 8,
        }}
        resizeMode="cover"
      />
      <Text style={{
        fontSize: 18,
        fontWeight: "600",
        color: "#333333",
        marginBottom: 4,
      }}>
        {listing.title}
      </Text>
      {listing.address && (
        <Text style={{
          fontSize: 14,
          color: "#666666",
          marginBottom: 4,
        }}>
          {listing.address}
        </Text>
      )}
      <Text style={{
        fontSize: 14,
        color: "#666666",
      }}>
        {(listing.rentAmount || 0).toLocaleString()} TL / ay
      </Text>
    </TouchableOpacity>
  );
}
