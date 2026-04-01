import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="explore" options={{ title: 'Découvrez' }} />
      <Tabs.Screen name="appointments" options={{ title: 'Rendez-vous' }} />
      <Tabs.Screen name="medecines" options={{ title: 'Produits Pharmaceutiques' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}