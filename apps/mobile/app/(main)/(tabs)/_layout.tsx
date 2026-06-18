import { Tabs } from 'expo-router';
import { BottomTabBar } from '../../../src/components';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
