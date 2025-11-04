import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { api } from "../../lib/api";
import { setToken } from "../../lib/auth";
import { router } from "expo-router";
import { useState } from "react";

type Form = { email: string; password: string };

export default function Login() {
  const { control, handleSubmit } = useForm<Form>({
    defaultValues: { email: "", password: "" },
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", values);
      const tok = data?.token || data?.access_token;
      if (!tok) throw new Error("Token bulunamadı");
      await setToken(tok);
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Giriş başarısız", e?.message ?? "Hata oluştu");
    } finally {
      setLoading(false);
    }
  });

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-2xl font-semibold mb-8 text-primary">Odanet</Text>

      <Text className="mb-2">E-posta</Text>
      <Controller
        control={control}
        name="email"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="border rounded-xl px-4 py-3 mb-4"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            placeholder="email@ornek.com"
          />
        )}
      />

      <Text className="mb-2">Şifre</Text>
      <Controller
        control={control}
        name="password"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="border rounded-xl px-4 py-3 mb-6"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            placeholder="••••••••"
          />
        )}
      />

      <Pressable
        disabled={loading}
        onPress={onSubmit}
        className="bg-primary rounded-2xl py-4 items-center"
      >
        <Text className="text-white font-semibold">
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Text>
      </Pressable>
    </View>
  );
}
