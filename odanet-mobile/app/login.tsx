import { useState } from "react";
import { View, ScrollView, Alert, StyleSheet } from "react-native";
import { Text, TextInput, Button, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLogin, useRegister } from "../hooks/useAuth";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const router = useRouter();
  const login = useLogin();
  const register = useRegister();

  const handleSubmit = async () => {
    if (isLogin) {
      if (!email || !password) {
        Alert.alert("Hata", "Lütfen email ve şifre girin");
        return;
      }

      try {
        await login.mutateAsync({ email, password });
        router.replace("/(tabs)");
      } catch (error: any) {
        Alert.alert("Giriş Başarısız", error.response?.data?.message || "Bir hata oluştu");
      }
    } else {
      if (!email || !password || !firstName || !lastName) {
        Alert.alert("Hata", "Lütfen tüm alanları doldurun");
        return;
      }

      try {
        await register.mutateAsync({ email, password, firstName, lastName });
        router.replace("/(tabs)");
      } catch (error: any) {
        Alert.alert("Kayıt Başarısız", error.response?.data?.message || "Bir hata oluştu");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={["#00A6A6", "#00B8B8"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons name="home-heart" size={64} color="#FFFFFF" />
          <Text style={styles.appTitle}>Odanet</Text>
          <Text style={styles.headerSubtitle}>
            {isLogin ? "Hesabınıza giriş yapın" : "Yeni hesap oluşturun"}
          </Text>
        </LinearGradient>

        <Card style={styles.formCard}>
          <Card.Content>
            {!isLogin && (
              <>
                <Text style={styles.label}>Ad</Text>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Adınız"
                  mode="outlined"
                  style={styles.input}
                  outlineColor="#E5E5E5"
                  activeOutlineColor="#00A6A6"
                  left={<TextInput.Icon icon="account" />}
                />

                <Text style={styles.label}>Soyad</Text>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Soyadınız"
                  mode="outlined"
                  style={styles.input}
                  outlineColor="#E5E5E5"
                  activeOutlineColor="#00A6A6"
                  left={<TextInput.Icon icon="account" />}
                />
              </>
            )}

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              style={styles.input}
              outlineColor="#E5E5E5"
              activeOutlineColor="#00A6A6"
              left={<TextInput.Icon icon="email" />}
            />

            <Text style={styles.label}>Şifre</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              mode="outlined"
              style={styles.input}
              outlineColor="#E5E5E5"
              activeOutlineColor="#00A6A6"
              left={<TextInput.Icon icon="lock" />}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={login.isPending || register.isPending}
              loading={login.isPending || register.isPending}
              buttonColor="#00A6A6"
              textColor="#FFFFFF"
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
            >
              {isLogin ? "Giriş Yap" : "Kayıt Ol"}
            </Button>

            <Button
              mode="text"
              onPress={() => setIsLogin(!isLogin)}
              textColor="#00A6A6"
              style={styles.toggleButton}
            >
              {isLogin ? "Hesabınız yok mu? Kayıt Ol" : "Zaten hesabınız var mı? Giriş Yap"}
            </Button>
          </Card.Content>
        </Card>
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
  header: {
    padding: 48,
    paddingTop: 64,
    alignItems: "center",
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 8,
    opacity: 0.95,
  },
  formCard: {
    margin: 16,
    marginTop: -30,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    elevation: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 12,
  },
  submitButtonContent: {
    height: 50,
  },
  toggleButton: {
    marginTop: 16,
  },
});
