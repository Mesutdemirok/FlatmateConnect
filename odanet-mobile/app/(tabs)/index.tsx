import { View, ScrollView, Text, RefreshControl } from "react-native";
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
    <SafeAreaView className="flex-1 bg-odanet-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00A6A6"]}
          />
        }
      >
        {/* Logo and Tagline */}
        <View className="bg-white pt-6 pb-4 px-4 items-center border-b border-gray-200">
          <Text className="text-2xl font-bold text-odanet-primary mb-2">
            Odanet
          </Text>
          <Text className="text-sm text-odanet-textLight text-center">
            Türkiye'nin güvenilir oda ve ev arkadaşı platformu
          </Text>
        </View>

        <View className="px-4 py-4">
          {/* Search */}
          <View className="mb-4">
            <SearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Şehir veya semt ara..."
            />
          </View>

          {/* Action Buttons */}
          <View className="mb-6">
            <PrimaryButton
              title="Oda arıyorum"
              onPress={() => {}}
              className="mb-3"
            />
            <SecondaryButton
              title="Oda veriyorum"
              onPress={() => {}}
            />
          </View>

          {/* Listings Section */}
          <View className="mb-4">
            <Text className="text-lg font-bold text-odanet-text mb-3">
              🏡 Güncel İlanlar
            </Text>

            {isLoading && !refreshing && (
              <View className="items-center justify-center py-12">
                <Text className="text-odanet-textLight">Yükleniyor...</Text>
              </View>
            )}

            {error && (
              <View className="bg-white rounded-xl p-6 items-center">
                <Text className="text-red-500 text-center mb-2">Hata Oluştu</Text>
                <Text className="text-odanet-textLight text-center text-sm">
                  İlanlar yüklenirken bir hata oluştu
                </Text>
              </View>
            )}

            {listings && listings.length > 0 ? (
              listings.slice(0, 5).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            ) : (
              !isLoading && (
                <View className="bg-white rounded-xl p-6 items-center">
                  <Text className="text-odanet-textLight text-center">
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
