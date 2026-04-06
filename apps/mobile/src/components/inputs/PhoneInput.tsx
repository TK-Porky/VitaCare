import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronDown, Phone } from 'lucide-react-native';
import { colors, fontFamily, fontSize } from '../../themes';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  error?: boolean;
  countryCode?: string;
  onCountryPress?: () => void;
};

export function PhoneInput({
  value,
  onChangeText,
  error = false,
  countryCode = '+237',
  onCountryPress,
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[
      styles.container,
      focused && styles.focused,
      error && styles.error,
    ]}>
      <TouchableOpacity style={styles.countryCode} onPress={onCountryPress} activeOpacity={0.7}>
        <Text style={styles.countryText}>{countryCode}</Text>
        <ChevronDown size={14} color={colors.ink} opacity={0.4} />
      </TouchableOpacity>

      <View style={styles.divider} />

      <Phone size={16} color={colors.ink} style={{ opacity: 0.4 }} />

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Numéro de téléphone"
        placeholderTextColor={colors.inkMuted}
        keyboardType="phone-pad"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
    backgroundColor: colors.surface,
  },
  focused: {
    borderColor: colors.ink,
  },
  error: {
    borderColor: colors.error,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countryText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.medium,
    color: colors.ink,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colors.inkFaint,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.ink,
    padding: 0,
  },
});