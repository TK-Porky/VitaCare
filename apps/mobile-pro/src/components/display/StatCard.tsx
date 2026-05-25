/**
 * StatCard — VitaCare Pro
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, fontFamily, fontSize } from '../../themes';

interface Props {
  label:    string;
  value:    string | number;
  icon?:    React.ReactNode;
  accent?:  string;
  style?:   ViewStyle;
}

export function StatCard({ label, value, icon, accent = colors.primary, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
          {icon}
        </View>
      )}
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.white,
    borderRadius:    14,
    padding:         14,
    gap:             6,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     colors.border,
    shadowColor:     colors.ink,
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.04,
    shadowRadius:    6,
    elevation:       2,
  },
  iconWrap: {
    width:          36,
    height:         36,
    borderRadius:   10,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   2,
  },
  value: {
    fontFamily: fontFamily.bold,
    fontSize:   fontSize['2xl'],
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.xs,
    color:      colors.inkLight,
    textAlign:  'center',
  },
});
