/**
 * ProfileLayout — VitaCare Pro
 * Layout de navigation interne pour les réglages du profil professionnel
 */

import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../../src/themes';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="change-password" />
      <Stack.Screen name="notifications-settings" />
      <Stack.Screen name="delete-account" />
      <Stack.Screen name="language-settings" />
      <Stack.Screen name="fee-settings" />
      <Stack.Screen name="help" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="support-chat" />
    </Stack>
  );
}
