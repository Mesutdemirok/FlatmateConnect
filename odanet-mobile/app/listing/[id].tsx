import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useListing } from "../../hooks/useListings";

export default function ListingDetail() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: listing, isLoading, error } = useListing(id || "");

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0EA5A7" />
          <Text className="text-muted-foreground mt-4">Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !listing) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-bold text-foreground mb-2">
            İlan Bulunamadı
          </Text>
          <Text className="text-muted-foreground text-center">
            Bu ilan mevcut değil veya kaldırılmış olabilir.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-primary p-6">
          <Text className="text-2xl font-bold text-white">
            {listing.title}
          </Text>
          <Text className="text-white/90 mt-1">📍 {listing.address}</Text>
        </View>

        {/* Price */}
        <View className="bg-white p-6 border-b border-gray-200">
          <Text className="text-muted-foreground text-sm">Aylık Kira</Text>
          <Text className="text-3xl font-bold text-primary mt-1">
            ₺{listing.rentAmount}
          </Text>
        </View>

        {/* Details */}
        <View className="bg-white p-6 mt-2">
          <Text className="text-xl font-bold text-foreground mb-4">
            İlan Detayları
          </Text>

          <View className="gap-3">
            {listing.propertyType && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-muted-foreground">Mülk Tipi</Text>
                <Text className="text-foreground font-medium">
                  {listing.propertyType}
                </Text>
              </View>
            )}

            {listing.totalRooms && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-muted-foreground">Oda Sayısı</Text>
                <Text className="text-foreground font-medium">
                  {listing.totalRooms} oda
                </Text>
              </View>
            )}

            {listing.furnishingStatus && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-muted-foreground">Eşya Durumu</Text>
                <Text className="text-foreground font-medium">
                  {listing.furnishingStatus}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between py-2">
              <Text className="text-muted-foreground">İlan Tarihi</Text>
              <Text className="text-foreground font-medium">
                {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Button */}
        <View className="p-6">
          <View className="bg-accent p-4 rounded-xl">
            <Text className="text-white font-bold text-center text-lg">
              💬 İletişime Geç
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
