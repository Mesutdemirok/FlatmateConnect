import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useListings } from "../hooks/useListings";
import { ListingCard } from "../components/ListingCard";

export default function Listings() {
  const { data: listings, isLoading, error, refetch } = useListings();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0EA5A7" />
          <Text className="text-muted-foreground mt-4">İlanlar yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-bold text-foreground mb-2">
            Hata Oluştu
          </Text>
          <Text className="text-muted-foreground text-center mb-4">
            İlanlar yüklenirken bir hata oluştu
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-4 bg-primary">
        <Text className="text-white font-bold text-lg">
          {listings?.length || 0} ilan bulundu
        </Text>
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        contentContainerStyle={{ padding: 16 }}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={
          <View className="bg-muted p-6 rounded-xl mt-4">
            <Text className="text-muted-foreground text-center">
              Henüz ilan bulunmuyor
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
