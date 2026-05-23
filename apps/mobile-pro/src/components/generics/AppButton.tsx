/**
 * AppButton — VitaCare Pro
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, fontFamily, fontSize } from '../../themes';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface Props {
  label:      string;
  onPress:    () => void;
  variant?:   Variant;
  size?:      Size;
  isLoading?: boolean;
  disabled?:  boolean;
  style?:     ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function AppButton({
  label,
  onPress,
  variant    = 'primary',
  size       = 'md',
  isLoading  = false,
  disabled   = false,
  style,
  textStyle,
  fullWidth  = true,
}: Props) {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[`size_${size}`],
        styles[`variant_${variant}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white}
        />
      ) : (
        <Text style={[styles.label, styles[`labelVariant_${variant}`], styles[`labelSize_${size}`], textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius:   12,
    alignItems:     'center',
    justifyContent: 'center',
    flexDirection:  'row',
  },
  fullWidth: { width: '100%' },
  disabled:  { opacity: 0.5 },

  // Sizes
  size_sm: { paddingVertical:  8, paddingHorizontal: 16, minHeight: 36 },
  size_md: { paddingVertical: 14, paddingHorizontal: 20, minHeight: 48 },
  size_lg: { paddingVertical: 18, paddingHorizontal: 24, minHeight: 56 },

  // Variants
  variant_primary:   { backgroundColor: colors.primary },
  variant_secondary: { backgroundColor: colors.infoLight },
  variant_outline:   { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  variant_ghost:     { backgroundColor: 'transparent' },
  variant_danger:    { backgroundColor: colors.error },

  // Labels
  label: { fontFamily: fontFamily.semiBold },
  labelVariant_primary:   { color: colors.white },
  labelVariant_secondary: { color: colors.primary },
  labelVariant_outline:   { color: colors.primary },
  labelVariant_ghost:     { color: colors.primary },
  labelVariant_danger:    { color: colors.white },

  labelSize_sm: { fontSize: fontSize.sm },
  labelSize_md: { fontSize: fontSize.base },
  labelSize_lg: { fontSize: fontSize.lg },
});
