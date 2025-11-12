import { useState } from "react";
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  // Removed 'Image' import to fix the file path error
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
// Re-added AntDesign for the reliable Google icon
import { Ionicons, AntDesign } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../hooks/useAuth";
import { colors, fonts, borderRadius, spacing } from "../theme";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { login, register } = useAuth();

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (isLogin) {
      if (!email || !password) {
        Alert.alert("Hata", "Lütfen email ve şifre girin");
        return;
      }

      setIsSubmitting(true);
      try {
        await login({ email, password });
        router.replace("/(tabs)");
      } catch (error: any) {
        Alert.alert(
          "Giriş Başarısız",
          error.response?.data?.message || "Bir hata oluştu",
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!email || !password || !firstName || !lastName) {
        Alert.alert("Hata", "Lütfen tüm alanları doldurun");
        return;
      }

      setIsSubmitting(true);
      try {
        await register({ email, password, firstName, lastName });
        router.replace("/(tabs)");
      } catch (error: any) {
        Alert.alert(
          "Kayıt Başarısız",
          error.response?.data?.message || "Bir hata oluştu",
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        path: "auth",
      });

      console.log("Redirect URI:", redirectUri);

      const result = await WebBrowser.openAuthSessionAsync(
        `https://www.odanet.com.tr/api/oauth/google?redirect_uri=${encodeURIComponent(
          redirectUri,
        )}`,
        redirectUri,
      );

      console.log("OAuth result:", result);

      if (result.type === "success" && result.url) {
        const url = new URL(result.url);
        const token = url.searchParams.get("token");

        if (token) {
          await SecureStore.setItemAsync("auth_token", token);
          const { api } = await import("../lib/api");
          api.defaults.headers.Authorization = `Bearer ${token}`;
          Alert.alert("Başarılı", "Google ile giriş yapıldı!");
          router.replace("/(tabs)");
        } else {
          console.error("No token in URL:", result.url);
          Alert.alert("Hata", "Token alınamadı. Lütfen tekrar deneyin.");
        }
      } else if (result.type === "cancel") {
        // Do nothing, user cancelled
      } else {
        console.error("OAuth failed:", result);
        Alert.alert("Hata", "Google ile giriş başarısız oldu");
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      Alert.alert("Hata", `Google ile giriş hatası: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Full screen gradient background */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBackground}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Close Button */}
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)")}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color={colors.textWhite} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Content */}
            <View style={styles.headerContent}>
              <Text style={styles.logo}>Odanet</Text>
              <Text style={styles.welcomeText}>Odanet'e Hoş Geldiniz</Text>

              {/* Google Button Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ile devam et</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Button (Uses AntDesign icon to avoid file path errors) */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLogin}
              >
                {/* SAFE FALLBACK: Using AntDesign for the Google icon */}
                <AntDesign name="google" size={20} color="#EA4335" />
                <Text style={styles.googleButtonText}>
                  Google ile Giriş Yap
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Card (Frosted Glass) */}
            <View style={styles.formCard}>
              {/* Tab Buttons */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  onPress={() => setIsLogin(true)}
                  style={[styles.tab, isLogin && styles.tabActive]}
                >
                  <Text
                    style={[styles.tabText, isLogin && styles.tabTextActive]}
                  >
                    Giriş Yap
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsLogin(false)}
                  style={[styles.tab, !isLogin && styles.tabActive]}
                >
                  <Text
                    style={[styles.tabText, !isLogin && styles.tabTextActive]}
                  >
                    Üye Ol
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form Inputs */}
              <View style={styles.formInner}>
                {/* Registration Fields */}
                {!isLogin && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Ad</Text>
                      <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Adınız"
                        style={styles.input}
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Soyad</Text>
                      <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Soyadınız"
                        style={styles.input}
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      />
                    </View>
                  </>
                )}

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="ornek@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Şifre</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry
                    style={styles.input}
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting
                      ? "Yükleniyor..."
                      : isLogin
                        ? "Giriş Yap"
                        : "Kayıt Ol"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  // Close Button Styles
  closeButtonContainer: {
    position: "absolute",
    top: Platform.OS === "android" ? spacing.base : 0,
    right: 0,
    padding: spacing.base,
    zIndex: 10,
  },
  closeButton: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xl,
    paddingTop: 80, // Add padding to avoid close button
  },
  headerContent: {
    alignItems: "center",
    marginBottom: spacing.lg,
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

  // Frosted Glass Card
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  // Tab Design
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.lg,
  },
  tabActive: {
    backgroundColor: colors.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    color: "rgba(255, 255, 255, 0.7)",
  },
  tabTextActive: {
    color: colors.accent,
  },

  // Form styles
  formInner: {
    padding: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.medium,
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: fonts.size.base,
    color: colors.textWhite,
  },

  // Submit Button
  submitButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.textWhite,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.bold,
    color: colors.accent,
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  dividerText: {
    paddingHorizontal: spacing.base,
    fontSize: fonts.size.sm,
    color: "rgba(255, 255, 255, 0.7)",
  },

  // Google Button
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.textWhite,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    width: "100%",
  },
  googleButtonText: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    color: colors.text,
  },
});
