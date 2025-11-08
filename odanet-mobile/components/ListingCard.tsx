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
      className="bg-white rounded-2xl shadow-md p-3 mb-4"
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: imageUrl }}
        className="w-full h-40 rounded-xl mb-2"
        resizeMode="cover"
      />
      <Text className="text-lg font-semibold text-odanet-text">{listing.title}</Text>
      {listing.address && (
        <Text className="text-sm text-odanet-textLight">{listing.address}</Text>
      )}
      <Text className="text-sm text-odanet-textLight">
        {(listing.rentAmount || 0).toLocaleString()} TL / ay
      </Text>
    </TouchableOpacity>
  );
}
