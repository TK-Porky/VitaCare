/*
import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false}}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
        </Stack>
    )
}
*/

import { Slot } from 'expo-router';

export default function RootLayout() {
  return <Slot />;
}