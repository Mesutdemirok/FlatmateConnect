import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { Listing } from "../hooks/useListings";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link href={`/listing/${listing.id}`} asChild>
      <TouchableOpacity className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-200">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-bold text-foreground flex-1" numberOfLines={1}>
            {listing.title}
          </Text>
          <Text className="text-xl font-bold text-primary ml-2">
            ₺{listing.rentAmount}
          </Text>
        </View>
        
        <Text className="text-sm text-muted-foreground mb-1" numberOfLines={1}>
          📍 {listing.address}
        </Text>
        
        <View className="flex-row gap-2 mt-2">
          {listing.propertyType && (
            <View className="bg-muted px-2 py-1 rounded-md">
              <Text className="text-xs text-muted-foreground">
                {listing.propertyType}
              </Text>
            </View>
          )}
          {listing.totalRooms && (
            <View className="bg-muted px-2 py-1 rounded-md">
              <Text className="text-xs text-muted-foreground">
                {listing.totalRooms} oda
              </Text>
            </View>
          )}
          {listing.furnishingStatus && (
            <View className="bg-muted px-2 py-1 rounded-md">
              <Text className="text-xs text-muted-foreground">
                {listing.furnishingStatus}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Link>
  );
}
