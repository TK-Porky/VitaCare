import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { StepHeader, SelectOption, PrimaryButton } from '../../src/components';
import { colors, fontFamily, fontSize } from '../../src/themes';

// ================================================================================== //
// Types
// ================================================================================== //
const OPTIONS = [
  'Un médecin en urgence',
  'Un suivi de traitements réguliers',
  'Des informations sur un médicaments',
  'Rien en particulier',
];

// ================================================================================== //
// Main
// ================================================================================== //
export default function OnboardingSearchScreen() {
  // ================================================================================== //
  // States
  // ================================================================================== //
  const [selected, setSelected] = useState<string | null>(null); // TODO: Replace with actual state management
  const [isLoading, setIsLoading] = useState(false); // TODO: Replace with actual loading state

  // ================================================================================== //
  // Functions
  // ================================================================================== //
  
  /**
   * Handle continue action
   * @returns {Promise<void>}
   */
  const handleContinue = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/(auth)/onboarding-language');
    } finally {
      setIsLoading(false);
    }
  };

  // ================================================================================== //
  // Render
  // ================================================================================== //
  return (
    <View style={styles.root}>
      <StepHeader
        current={2}
        total={3}
        onSkip={() => router.push('/(auth)/onboarding-language')}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Que recherchez-vous ?</Text>

        <View style={styles.options}>
          {OPTIONS.map((option) => (
            <SelectOption
              key={option}
              label={option}
              selected={selected === option}
              onPress={() => setSelected(option)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={16} color={colors.ink} />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>

        <PrimaryButton
          label="Continuer"
          isLoading={isLoading}
          onPress={handleContinue}
          style={styles.continueButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 24,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
    color: colors.ink,
  },
  options: {
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  continueButton: {
    minWidth: 140,
  },
});