import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { ClerkLoaded, ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { setBaseUrl } from "@workspace/api-client-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DEMO_MODE } from "@/constants/demo";
import { AuthProvider, DemoAuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { CommunityProvider } from "@/context/CommunityContext";
import { ReplyStatusProvider } from "@/context/ReplyStatusContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const clerkProxyUrl = process.env.EXPO_PUBLIC_CLERK_PROXY_URL;
const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
setBaseUrl(
  Platform.OS === "web" || !apiDomain ? null : `https://${apiDomain}`,
);

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
      <Stack.Screen
        name="chat/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="profile/[id]"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen name="waiting" options={{ headerShown: false }} />
      <Stack.Screen name="community/create" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="community/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  const app = (
    <AppProvider>
      <ReplyStatusProvider>
        <CommunityProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </CommunityProvider>
      </ReplyStatusProvider>
    </AppProvider>
  );

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        {DEMO_MODE ? (
          <QueryClientProvider client={queryClient}>
            <DemoAuthProvider>{app}</DemoAuthProvider>
          </QueryClientProvider>
        ) : (
          <ClerkProvider
            publishableKey={publishableKey}
            proxyUrl={clerkProxyUrl}
            tokenCache={tokenCache}
          >
            <ClerkLoaded>
              <QueryClientProvider client={queryClient}>
                <AuthProvider>{app}</AuthProvider>
              </QueryClientProvider>
            </ClerkLoaded>
          </ClerkProvider>
        )}
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
