import { useState } from "react";
import { View, ScrollView, Alert, StyleSheet, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useLogin, useRegister } from "../hooks/useAuth";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors, fonts, borderRadius, spacing } from "../theme";

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
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <Text style={styles.logo}>Odanet</Text>
            <Text style={styles.welcomeText}>
              Odanet'e Hoş Geldiniz
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Tab Buttons */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => setIsLogin(true)}
              style={[
                styles.tab,
                isLogin && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  isLogin && styles.tabTextActive,
                ]}
              >
                Giriş Yap
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsLogin(false)}
              style={[
                styles.tab,
                !isLogin && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  !isLogin && styles.tabTextActive,
                ]}
              >
                Üye Ol
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            {!isLogin && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Ad</Text>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Adınız"
                    style={styles.input}
                    placeholderTextColor={colors.textLight}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Soyad</Text>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Soyadınız"
                    style={styles.input}
                    placeholderTextColor={colors.textLight}
                  />
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="ornek@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                style={styles.input}
                placeholderTextColor={colors.textLight}
              />
            </View>

            <PrimaryButton
              title={login.isPending || register.isPending ? "Yükleniyor..." : (isLogin ? "Giriş Yap" : "Kayıt Ol")}
              onPress={handleSubmit}
              disabled={login.isPending || register.isPending}
              style={styles.submitButton}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingBottom: spacing.xxxl,
  },
  headerContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    alignItems: "center",
  },
  logo: {
    fontSize: fonts.size.xxxl,
    fontWeight: fonts.weight.bold,
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  welcomeText: {
    fontSize: fonts.size.lg,
    color: colors.textWhite,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.base,
    marginTop: -spacing.xl,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: colors.accent,
  },
  tabText: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    color: colors.textLight,
  },
  tabTextActive: {
    color: colors.textWhite,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: fonts.size.base,
    color: colors.text,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});
