import { Mail } from 'lucide-react-native';
import { BaseInput, BaseInputProps } from '../generics/BaseInput';
import { colors } from '../../themes';

type Props = Omit<BaseInputProps, 'leftSlot' | 'keyboardType'>;

/** Champ email avec clavier adapté et auto-correction désactivée. */
export function EmailInput(props: Props) {
  return (
    <BaseInput
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      placeholder="Adresse email"
      leftSlot={<Mail size={16} color={colors.inkLight} style={{ opacity: 1.0 }} />}
      {...props}
    />
  );
}