import { useState } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react-native';
import { TextInput } from './TextInput';
import { colors } from '../../themes';

type Props = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
};

export function PasswordInput({
  label,
  value,
  onChangeText,
  placeholder = 'Password',
  error,
  hint,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!visible}
        error={error}
        hint={hint}
        autoCapitalize="none"
        leftIcon={
          <LockKeyhole size={16} color={colors.inkMuted} />
        }
      />
      <TouchableOpacity
        style={styles.eyeButton}
        onPress={() => setVisible(v => !v)}
        activeOpacity={0.7}
      >
        {visible
          ? <EyeOff size={18} color={colors.inkMuted} />
          : <Eye size={18} color={colors.inkMuted} />
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  eyeButton: {
    position: 'absolute',
    right: 0,
    bottom: 10,
  },
});