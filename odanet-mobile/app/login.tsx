import { useState } from "react";
import { View, ScrollView, Alert, StyleSheet, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Ionicons name="home-outline" size={64} color="#00A6A6" />
          <Text style={styles.appTitle}>Odanet</Text>
          <Text style={styles.headerSubtitle}>
            {isLogin ? "Hesabınıza giriş yapın" : "Yeni hesap oluşturun"}
          </Text>
        </View>

        <View style={styles.formCard}>
          {!isLogin && (
            <>
              <Text style={styles.label}>Ad</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Adınız"
                style={styles.input}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Soyad</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Soyadınız"
                style={styles.input}
                placeholderTextColor="#999"
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
            style={styles.input}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Şifre</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={[styles.button, (login.isPending || register.isPending) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={login.isPending || register.isPending}
          >
            {login.isPending || register.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? "Giriş Yap" : "Kayıt Ol"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchButtonText}>
              {isLogin
                ? "Hesabınız yok mu? Kayıt olun"
                : "Zaten hesabınız var mı? Giriş yapın"}
            </Text>
          </TouchableOpacity>
        </View>
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
  header: {
    backgroundColor: "#FFFFFF",
    padding: 40,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#00A6A6",
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  button: {
    backgroundColor: "#00A6A6",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchButton: {
    marginTop: 16,
    padding: 12,
    alignItems: "center",
  },
  switchButtonText: {
    color: "#00A6A6",
    fontSize: 14,
  },
});
