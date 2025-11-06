import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useListings } from "../hooks/useListings";
import { ListingCard } from "../components/ListingCard";

export default function Home() {
  const { data: listings, isLoading, error } = useListings();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Hero Section */}
        <View className="bg-primary p-6">
          <Text className="text-3xl font-bold text-white mb-2">
            Merhaba! 👋
          </Text>
          <Text className="text-white/90">
            Odanet'e hoş geldiniz. Oda arkadaşı bulun veya oda kiralayın.
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="px-4 py-6 flex-row gap-3">
          <Link href="/listings" asChild className="flex-1">
            <TouchableOpacity className="bg-accent p-4 rounded-xl flex-1">
              <Text className="text-white font-bold text-center">
                🏠 İlanları Gör
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/profile" asChild className="flex-1">
            <TouchableOpacity className="bg-secondary p-4 rounded-xl flex-1">
              <Text className="text-white font-bold text-center">
                👤 Profilim
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Recent Listings */}
        <View className="px-4 pb-6">
          <Text className="text-2xl font-bold text-foreground mb-4">
            Son İlanlar
          </Text>

          {isLoading && (
            <View className="py-10">
              <ActivityIndicator size="large" color="#0EA5A7" />
            </View>
          )}

          {error && (
            <View className="bg-red-50 p-4 rounded-xl">
              <Text className="text-red-600 text-center">
                İlanlar yüklenirken bir hata oluştu
              </Text>
            </View>
          )}

          {listings && listings.length > 0 ? (
            <View>
              {listings.slice(0, 5).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
              
              <Link href="/listings" asChild>
                <TouchableOpacity className="mt-4 py-3 border-2 border-primary rounded-xl">
                  <Text className="text-primary font-bold text-center">
                    Tüm İlanları Gör
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          ) : (
            !isLoading && (
              <View className="bg-muted p-6 rounded-xl">
                <Text className="text-muted-foreground text-center">
                  Henüz ilan bulunmuyor
                </Text>
              </View>
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
