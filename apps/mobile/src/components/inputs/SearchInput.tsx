import { Search } from 'lucide-react-native';
import { BaseInput, BaseInputProps } from '../generics/BaseInput';
import { colors } from '../../themes';

type Props = Omit<BaseInputProps, 'leftSlot' | 'keyboardType'>;

/** Champ de recherche avec icône loupe et auto-correction désactivée. */
export function SearchInput(props: Props) {
  return (
    <BaseInput
      keyboardType="default"
      autoCapitalize="none"
      autoCorrect={false}
      placeholder="Rechercher..."
      returnKeyType="search"
      leftSlot={<Search size={16} color={colors.inkLight} style={{ opacity: 1.0 }} />}
      {...props}
    />
  );
}
