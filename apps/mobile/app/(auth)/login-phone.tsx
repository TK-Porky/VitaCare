import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { PhoneInput, TopBar, HelperText, PrimaryButton } from "../../src/components";
import { isValidCMPhone } from '@vitacare/utils';
import { colors, fontFamily, fontSize } from '../../src/themes';

export default function LoginPhoneScreen() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!isValidCMPhone(phone)) {
      setError('Numéro de téléphone invalide.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      // TODO: appel API pour envoyer le SMS
      await new Promise(resolve => setTimeout(resolve, 1500)); // simulation
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: `+237${phone}` },
      });
    } catch {
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TopBar />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Connexion par Téléphone</Text>
        <Text style={styles.subtitle}>
          Entrez votre numéro pour recevoir le code de confirmation.
        </Text>

        <View style={styles.inputWrapper}>
          <PhoneInput
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              if (error) setError('');
            }}
            error={!!error}
          />
          {error ? (
            <HelperText message={error} type="error" />
          ) : (
            <HelperText
              message="En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité."
              type="info"
            />
          )}
        </View>

        <PrimaryButton
          label="Recevoir le code par SMS"
          fullWidth
          isLoading={isLoading}
          loadingText="Envoi en cours..."
          onPress={handleSubmit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 24,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.bold,
    color: colors.ink,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.inkMuted,
    lineHeight: 20,
    marginTop: -12,
  },
  inputWrapper: {
    gap: 8,
  },
});