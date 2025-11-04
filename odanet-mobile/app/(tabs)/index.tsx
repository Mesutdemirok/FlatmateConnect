import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useListings } from "../../hooks/useListings";

interface Listing {
  id: string;
  title: string;
  description: string;
  monthlyRent: number;
  suburb?: string;
  city?: string;
  images?: Array<{ imageUrl: string }>;
}

export default function Listings() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, isFetching, error, refetch } = useListings({ q: searchQuery });

  const listings = data?.data || data || [];

  const renderItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      className="bg-white p-4 mb-3 mx-4 rounded-lg shadow-sm border border-gray-200"
      data-testid={`listing-card-${item.id}`}
    >
      <Text className="text-lg font-semibold text-gray-900 mb-1" numberOfLines={2}>
        {item.title}
      </Text>
      
      {(item.suburb || item.city) && (
        <Text className="text-sm text-gray-600 mb-2">
          📍 {item.suburb ? `${item.suburb}, ` : ""}{item.city || ""}
        </Text>
      )}
      
      <Text className="text-base font-bold text-orange-600 mb-2">
        {item.monthlyRent ? `${item.monthlyRent.toLocaleString('tr-TR')} ₺/ay` : "Fiyat belirtilmemiş"}
      </Text>
      
      {item.description && (
        <Text className="text-sm text-gray-700" numberOfLines={3}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => {
    if (isLoading) return null;
    
    return (
      <View className="flex-1 items-center justify-center px-6 py-12">
        <Text className="text-6xl mb-4">🏠</Text>
        <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">
          İlan bulunamadı
        </Text>
        <Text className="text-sm text-gray-600 text-center">
          {searchQuery
            ? "Arama kriterlerinize uygun ilan bulunamadı"
            : "Henüz hiç ilan yok"}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Header */}
      <View className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900 mb-3">İlanlar</Text>
        <TextInput
          className="bg-gray-100 px-4 py-3 rounded-lg text-base text-gray-900"
          placeholder="Ara..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          data-testid="search-input"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Loading State */}
      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EA580C" />
          <Text className="text-gray-600 mt-4">İlanlar yükleniyor...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">⚠️</Text>
          <Text className="text-lg font-semibold text-red-600 mb-2 text-center">
            Hata
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-4">
            İlanlar yüklenirken bir hata oluştu
          </Text>
          <TouchableOpacity
            className="bg-orange-600 px-6 py-3 rounded-lg"
            onPress={() => refetch()}
            data-testid="retry-button"
          >
            <Text className="text-white font-semibold">Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Listings List */}
      {!isLoading && !error && (
        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor="#EA580C"
            />
          }
          data-testid="listings-list"
        />
      )}
    </View>
  );
}
