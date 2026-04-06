import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login-phone" options={{ headerShown: false }} />
      <Stack.Screen name="login-email" options={{ headerShown: false }} />
      <Stack.Screen name="otp" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-location" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-search" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-language" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-success" options={{ headerShown: false }} />
    </Stack>
  );
}