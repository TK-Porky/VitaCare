import { Tabs } from 'expo-router';
import { BottomTabBar } from '../../../src/components';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="appointments" />
      <Tabs.Screen name="medications" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
