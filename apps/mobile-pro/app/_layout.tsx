/**
 * Root Layout — VitaCare Pro
 */

import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import { Slot, router, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { queryClient } from '../src/lib/query.client';
import { useAuthStore } from '../src/store';
import { colors } from '../src/themes';

SplashScreen.preventAutoHideAsync();

// ================================================================================== //
// Auth Guard
// ================================================================================== //

function RootGuard() {
  const hydrate     = useAuthStore((s) => s.hydrate);
  const isHydrated  = useAuthStore((s) => s.isHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const segments    = useSegments();

  useEffect(() => { hydrate(); }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (!accessToken && !inAuthGroup) {
      router.replace('/(auth)');
    } else if (accessToken && inAuthGroup) {
      router.replace('/(main)');
    }
  }, [isHydrated, accessToken, segments]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Slot />;
}

// ================================================================================== //
// Root Layout
// ================================================================================== //

export default function RootLayout() {
  const [loaded] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold });

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
