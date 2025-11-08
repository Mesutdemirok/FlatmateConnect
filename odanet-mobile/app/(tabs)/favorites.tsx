import { View, ScrollView, StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function FavoritesScreen() {
  const favorites: any[] = [];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView}>
        {favorites.length > 0 ? (
          <View style={styles.favoritesList}>
            {/* Favorites will be displayed here when implemented */}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Card style={styles.emptyCard}>
              <Card.Content>
                <MaterialCommunityIcons
                  name="heart-outline"
                  size={80}
                  color="#CCCCCC"
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>Favori ilanınız yok</Text>
                <Text style={styles.emptySubtitle}>
                  Beğendiğiniz ilanları favorilere ekleyerek buradan kolayca ulaşabilirsiniz
                </Text>
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  scrollView: {
    flex: 1,
  },
  favoritesList: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    padding: 16,
    marginTop: 80,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 40,
  },
  emptyIcon: {
    alignSelf: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222222",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
});
