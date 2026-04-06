import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { MapPin, Search } from 'lucide-react-native';
import { StepHeader, TextInput, PrimaryButton } from '../../src/components';
import { colors, fontFamily, fontSize } from '../../src/themes';

export default function OnboardingLocationScreen() {
  const [location, setLocation] = useState('Rue Simekoa, Yaoundé');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/(auth)/onboarding-search');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={styles.root}
    >
      <StepHeader
        current={1}
        total={2}
        onSkip={() => router.push('/(auth)/onboarding-search')}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Indiquer votre position</Text>
          <Text style={styles.subtitle}>
            Les recherches s'effectueront dans un périmètre de 15km, ajustable plus tard
          </Text>
        </View>

        <TextInput
          value=""
          onChangeText={() => {}}
          placeholder="Rechercher votre position..."
          leftIcon={<Search size={16} color={colors.inkMuted} />}
        />

        {/* Map placeholder */}
        <View style={styles.map}>
          <Text style={styles.mapPlaceholder}>Carte</Text>
        </View>

        <TouchableOpacity style={styles.locationRow} activeOpacity={0.7}>
          <MapPin size={16} color={colors.inkMuted} />
          <Text style={styles.locationText}>{location}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Continuer"
          fullWidth
          isLoading={isLoading}
          onPress={handleContinue}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    height: '100%',
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    lineHeight: 18,
  },
  map: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  mapPlaceholder: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.inkMuted,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  locationText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.inkLight,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
});