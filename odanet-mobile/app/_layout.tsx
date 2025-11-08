import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import "../global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#00A6A6",
    secondary: "#00B8B8",
    tertiary: "#F2F2F2",
    background: "#F2F2F2",
    surface: "#FFFFFF",
    surfaceVariant: "#F5F5F5",
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
    onBackground: "#222222",
    onSurface: "#222222",
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: "#00A6A6",
              },
              headerTintColor: "#FFFFFF",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          >
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="listing/[id]"
              options={{
                title: "İlan Detayı",
                headerBackTitle: "Geri",
              }}
            />
            <Stack.Screen
              name="login"
              options={{
                title: "Giriş Yap",
                headerBackTitle: "Geri",
              }}
            />
          </Stack>
        </QueryClientProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
