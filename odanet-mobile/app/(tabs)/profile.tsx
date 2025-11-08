import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card, Avatar, Divider, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();
  const isLoggedIn = false;

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.loginPrompt}>
          <Card style={styles.loginCard}>
            <Card.Content>
              <MaterialCommunityIcons
                name="account-circle"
                size={80}
                color="#00A6A6"
                style={styles.loginIcon}
              />
              <Text style={styles.loginTitle}>Giriş Yapın</Text>
              <Text style={styles.loginSubtitle}>
                İlan vermek, mesajlaşmak ve favorilere eklemek için giriş yapın
              </Text>
              <Button
                mode="contained"
                onPress={() => router.push("/login")}
                style={styles.loginButton}
                buttonColor="#00A6A6"
                textColor="#FFFFFF"
                icon="login"
              >
                Giriş Yap / Kayıt Ol
              </Button>
              <Button
                mode="text"
                onPress={() => {}}
                style={styles.googleButton}
                textColor="#00A6A6"
                icon="google"
              >
                Google ile devam et
              </Button>
            </Card.Content>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Avatar.Text size={80} label="K" style={styles.avatar} color="#FFFFFF" />
          <Text style={styles.userName}>Kullanıcı Adı</Text>
          <Text style={styles.userEmail}>kullanici@email.com</Text>
        </View>

        <View style={styles.menuContainer}>
          <Card style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="home-city" size={24} color="#00A6A6" />
              <Text style={styles.menuText}>İlanlarım</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999999" />
            </TouchableOpacity>
            
            <Divider />
            
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="account-edit" size={24} color="#00A6A6" />
              <Text style={styles.menuText}>Profili Düzenle</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999999" />
            </TouchableOpacity>
            
            <Divider />
            
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="cog" size={24} color="#00A6A6" />
              <Text style={styles.menuText}>Ayarlar</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999999" />
            </TouchableOpacity>
            
            <Divider />
            
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="help-circle" size={24} color="#00A6A6" />
              <Text style={styles.menuText}>Yardım</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999999" />
            </TouchableOpacity>
          </Card>

          <Button
            mode="outlined"
            onPress={() => {}}
            style={styles.logoutButton}
            textColor="#DC2626"
            icon="logout"
          >
            Çıkış Yap
          </Button>
        </View>
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
  loginPrompt: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  loginCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 24,
  },
  loginIcon: {
    alignSelf: "center",
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222222",
    textAlign: "center",
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  googleButton: {
    marginTop: 8,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
  },
  avatar: {
    backgroundColor: "#00A6A6",
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666666",
  },
  menuContainer: {
    padding: 16,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: "#222222",
  },
  logoutButton: {
    borderColor: "#DC2626",
    borderRadius: 8,
  },
});
