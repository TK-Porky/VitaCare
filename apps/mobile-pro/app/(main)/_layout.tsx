import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '../../src/themes';

export default function MainLayout() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown:  false,
          contentStyle: { backgroundColor: colors.surface },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="appointments/[id]" />
        <Stack.Screen name="patients/[id]" />
        <Stack.Screen
          name="prescriptions/create"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
});
