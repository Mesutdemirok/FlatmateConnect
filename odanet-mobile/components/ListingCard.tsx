import { View, Text, Image, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Listing } from "../hooks/useListings";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter();
  const firstImage = listing.images?.[0]?.imageUrl;
  const [imageError, setImageError] = useState(false);

  const showPlaceholder = !firstImage || imageError;

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
      {showPlaceholder ? (
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
          <Text style={{ color: "#FFFFFF", fontSize: 48 }}>🏠</Text>
          <Text style={{ color: "#FFFFFF", fontSize: 14, marginTop: 8 }}>
            Fotoğraf Yok
          </Text>
        </View>
      ) : (
        <Image
          source={{ uri: firstImage }}
          style={{
            width: "100%",
            height: 160,
            borderRadius: 12,
            marginBottom: 8,
            backgroundColor: "#E5E5E5",
          }}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      )}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: "#111111",
          marginBottom: 4,
        }}
      >
        {listing.title}
      </Text>
      {listing.address && (
        <Text
          style={{
            fontSize: 14,
            color: "#666666",
            marginBottom: 4,
          }}
        >
          {listing.address}
        </Text>
      )}
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: "#00A6A6",
        }}
      >
        {parseFloat(listing.rentAmount || "0").toLocaleString("tr-TR")} TL / ay
      </Text>
    </TouchableOpacity>
  );
}
