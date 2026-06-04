/**
 * Root layout for the mobile app
 * Manages global providers and navigation structure
 */

import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import { Slot, router, useSegments } from 'expo-router';
import { View, ActivityIndicator, LogBox } from 'react-native';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { queryClient } from '../src/lib/query.client';
import { useAuthStore } from '../src/store';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Ignore cosmetic warnings from NativeWind / BottomSheet ref conflicts
LogBox.ignoreLogs([
  "Couldn't find the scrollable node handle id!",
]);

/**
 * Root guard component that handles authentication state and navigation
 * This component ensures the user is redirected to the correct screen based on their authentication status
 */
function RootGuard() {
  const hydrate     = useAuthStore((s) => s.hydrate); // Load auth state from storage
  const isHydrated  = useAuthStore((s) => s.isHydrated); // Check if auth state is loaded from storage
  const accessToken = useAuthStore((s) => s.accessToken); // Check if user is authenticated
  const segments    = useSegments();

  useEffect(() => { hydrate(); }, []);

  // Redirect to appropriate screen based on authentication status
  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inMainGroup = segments[0] === '(main)';
    const isOnboarding = (segments as string[])[1]?.startsWith('onboarding');

    if (!accessToken && !inAuthGroup) {
      // Redirect to landing if not authenticated and not in auth group
      router.replace("/(auth)");
    } else if (accessToken && (!inMainGroup && !isOnboarding)) {
      // Redirect to main if authenticated and NOT in main group (and not onboarding)
      router.replace("/(main)");
    }
  }, [isHydrated, accessToken, segments]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Slot />;
}

/**
 * Main layout component for the mobile app
 * This component manages global providers and navigation structure
 */
export default function RootLayout() {
  // Load fonts
  const [loaded] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold });

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <QueryClientProvider client={queryClient}>
          <RootGuard />
        </QueryClientProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}