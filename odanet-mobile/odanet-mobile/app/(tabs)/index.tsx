import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useListings } from "../../../hooks/useListings";

export default function Listings() {
  const { data, isLoading, error } = useListings({});
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Bir hata oluştu</Text>
      </View>
    );
  }
  const listings = data?.data || data || [];
  return (
    <FlatList
      data={listings}
      keyExtractor={(item, index) => {
        const id = item?.id ?? index;
        return String(id);
      }}
      renderItem={({ item }) => (
        <View className="p-4 border-b border-gray-200">
          <Text className="text-lg font-semibold">
            {item?.title ?? "İlan Başlığı"}
          </Text>
          <Text className="text-gray-500">
            {item?.description ?? ""}
          </Text>
        </View>
      )}
    />
  );
}
