import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Listing } from "../hooks/useListings";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter();
  const firstImage = listing.images?.[0]?.imageUrl;
  
  // Use a solid color placeholder if no image
  const imageUrl = firstImage || "https://www.odanet.com.tr/uploads/default-room.jpg";

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
      {firstImage ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: "100%",
            height: 160,
            borderRadius: 12,
            marginBottom: 8,
            backgroundColor: "#E5E5E5",
          }}
          resizeMode="cover"
          onError={(e) => {
            console.log("Image load error:", e.nativeEvent.error);
          }}
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: 160,
            borderRadius: 12,
            marginBottom: 8,
            backgroundColor: "#00A6A6",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
            🏠 Fotoğraf Yok
          </Text>
        </View>
      )}
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
