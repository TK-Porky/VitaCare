/**
 * ProTopBar — VitaCare Pro
 * Barre de navigation supérieure uniforme et moderne pour les sous-écrans de profil
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontFamily, fontSize } from '../../themes';

interface Props {
  title: string;
  onBack?: () => void;
}

export function ProTopBar({ title, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} translucent={false} />
      
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backBtn}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color={colors.ink} />
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* Spacer to balance the back button width visually */}
      <View style={styles.rightSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 80,
  },
  backText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    color: colors.ink,
    textAlign: 'center',
    flex: 1,
  },
  rightSpacer: {
    minWidth: 80,
  },
});
