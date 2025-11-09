import { View, ScrollView, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function FavoritesScreen() {
  const favorites: any[] = [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView}>
        {favorites.length > 0 ? (
          <View style={styles.favoritesList}>
            {/* Favorites will be displayed here when implemented */}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCard}>
              <Ionicons
                name="heart-outline"
                size={80}
                color="#CCCCCC"
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>❤️ Favori ilanınız yok</Text>
              <Text style={styles.emptySubtitle}>
                Beğendiğiniz ilanları favorilere ekleyerek buradan kolayca ulaşabilirsiniz
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollView: {
    flex: 1,
  },
  favoritesList: {
    padding: 16,
  },
  emptyContainer: {
    paddingHorizontal: 16,
    paddingVertical: 80,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00A6A6",
    textAlign: "center",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
  },
});
