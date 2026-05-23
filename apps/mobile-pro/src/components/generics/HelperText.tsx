/**
 * HelperText — VitaCare Pro
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize } from '../../themes';

type Type = 'error' | 'info' | 'success' | 'warning';

interface Props {
  message: string;
  type?:   Type;
}

const CONFIG: Record<Type, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  error:   { icon: 'alert-circle-outline',      color: colors.error,   bg: colors.errorLight },
  info:    { icon: 'information-circle-outline', color: colors.info,    bg: colors.infoLight },
  success: { icon: 'checkmark-circle-outline',   color: colors.success, bg: colors.successLight },
  warning: { icon: 'warning-outline',            color: colors.warning, bg: colors.warningLight },
};

export function HelperText({ message, type = 'error' }: Props) {
  const cfg = CONFIG[type];
  return (
    <View style={[styles.container, { backgroundColor: cfg.bg }]}>
      <Ionicons name={cfg.icon} size={16} color={cfg.color} />
      <Text style={[styles.text, { color: cfg.color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            8,
    padding:        12,
    borderRadius:   10,
  },
  text: {
    flex:       1,
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.sm,
  },
});
