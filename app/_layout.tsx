import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useBootstrapDemoData } from "@/hooks/useBootstrapDemoData";

const queryClient = new QueryClient();

function Bootstrap() {
  useBootstrapDemoData();
  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Bootstrap />
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="auth/forgot-password" />
          <Stack.Screen name="cycle/[date]" options={{ presentation: "modal" }} />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
