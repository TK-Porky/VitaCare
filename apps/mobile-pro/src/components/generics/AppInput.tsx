/**
 * AppInput — VitaCare Pro
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize } from '../../themes';

interface Props extends Omit<TextInputProps, 'style'> {
  label?:       string;
  error?:       string;
  leftIcon?:    keyof typeof Ionicons.glyphMap;
  rightIcon?:   keyof typeof Ionicons.glyphMap;
  onRightPress?:() => void;
  containerStyle?: ViewStyle;
  isPassword?:  boolean;
}

export function AppInput({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightPress,
  containerStyle,
  isPassword = false,
  secureTextEntry,
  ...rest
}: Props) {
  const [isVisible, setIsVisible] = useState(false);

  const secure = isPassword ? !isVisible : secureTextEntry;
  const rightIc: keyof typeof Ionicons.glyphMap | undefined = isPassword
    ? (isVisible ? 'eye-off-outline' : 'eye-outline')
    : rightIcon;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputWrapper, error ? styles.inputWrapperError : undefined]}>
        {leftIcon && (
          <Ionicons name={leftIcon} size={18} color={colors.inkMuted} style={styles.leftIcon} />
        )}

        <TextInput
          {...rest}
          style={styles.input}
          secureTextEntry={secure}
          placeholderTextColor={colors.inkMuted}
          autoCapitalize={isPassword ? 'none' : rest.autoCapitalize}
        />

        {rightIc && (
          <TouchableOpacity
            onPress={isPassword ? () => setIsVisible((v) => !v) : onRightPress}
            style={styles.rightIcon}
          >
            <Ionicons name={rightIc} size={18} color={colors.inkMuted} />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontFamily: fontFamily.medium,
    fontSize:   fontSize.sm,
    color:      colors.ink,
  },
  inputWrapper: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.surface,
    borderWidth:     1.5,
    borderColor:     colors.border,
    borderRadius:    12,
    paddingHorizontal: 12,
    minHeight:       48,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  input: {
    flex:       1,
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.base,
    color:      colors.ink,
    paddingVertical: 12,
  },
  leftIcon:  { marginRight: 8 },
  rightIcon: { marginLeft:  8, padding: 4 },
  error: {
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.xs,
    color:      colors.error,
  },
});
