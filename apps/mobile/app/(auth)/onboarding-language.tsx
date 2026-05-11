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
const LANGUAGES = ['Français', 'Anglais'];

// ================================================================================== //
// Main
// ================================================================================== //
export default function OnboardingLanguageScreen() {
  // ================================================================================== //
  // States
  // ================================================================================== //
  const [selected, setSelected] = useState<string>('Français'); // Selected language
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // ================================================================================== //
  // Functions
  // ================================================================================== //
  
  /**
   * Finalize the onboarding
   * @returns
   */
  const handleFinish = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/(auth)/onboarding-success');
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
        current={3}
        total={3}
        showSkip={false}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Quelle langue parlez-vous ?</Text>

        <View style={styles.options}>
          {LANGUAGES.map((lang) => (
            <SelectOption
              key={lang}
              label={lang}
              selected={selected === lang}
              onPress={() => setSelected(lang)}
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
          label="Terminer"
          isLoading={isLoading}
          onPress={handleFinish}
          style={styles.finishButton}
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
  finishButton: {
    minWidth: 140,
  },
});