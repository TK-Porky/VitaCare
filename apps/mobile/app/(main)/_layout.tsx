import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { colors } from "../../src/themes/";

export default function MainLayout() {

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.inkLight },
        }}
      >
        {/* Tabs group - main navigation */}
        <Stack.Screen name="(tabs)" />

        {/* Modal screens */}
        <Stack.Screen
          name="home/map"
          options={{
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="medications/reminders"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="booking/index"
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="booking/bookingSuccess"
          options={{
            presentation: "modal",
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.inkLight,
  },
});
