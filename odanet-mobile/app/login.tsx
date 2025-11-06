import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
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
        router.replace("/");
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
        router.replace("/");
      } catch (error: any) {
        Alert.alert("Kayıt Başarısız", error.response?.data?.message || "Bir hata oluştu");
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="py-8">
          <Text className="text-4xl font-bold text-primary text-center">
            Odanet
          </Text>
          <Text className="text-muted-foreground text-center mt-2">
            {isLogin ? "Hesabınıza giriş yapın" : "Yeni hesap oluşturun"}
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          {!isLogin && (
            <>
              <View>
                <Text className="text-foreground font-medium mb-2">Ad</Text>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Adınız"
                  className="bg-white border border-gray-300 rounded-xl px-4 py-3"
                />
              </View>

              <View>
                <Text className="text-foreground font-medium mb-2">Soyad</Text>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Soyadınız"
                  className="bg-white border border-gray-300 rounded-xl px-4 py-3"
                />
              </View>
            </>
          )}

          <View>
            <Text className="text-foreground font-medium mb-2">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-white border border-gray-300 rounded-xl px-4 py-3"
            />
          </View>

          <View>
            <Text className="text-foreground font-medium mb-2">Şifre</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              className="bg-white border border-gray-300 rounded-xl px-4 py-3"
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={login.isPending || register.isPending}
            className="bg-primary p-4 rounded-xl mt-4"
          >
            <Text className="text-white font-bold text-center text-lg">
              {(login.isPending || register.isPending)
                ? "Yükleniyor..."
                : isLogin
                ? "Giriş Yap"
                : "Kayıt Ol"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsLogin(!isLogin)}
            className="py-4"
          >
            <Text className="text-muted-foreground text-center">
              {isLogin
                ? "Hesabınız yok mu? "
                : "Zaten hesabınız var mı? "}
              <Text className="text-primary font-bold">
                {isLogin ? "Kayıt Ol" : "Giriş Yap"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
