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
import { User, Phone } from 'lucide-react-native';
import { TopBar, CustomInput, PasswordInput, PrimaryButton, HelperText, PhoneInput, NameInput } from '../../src/components';
import { colors, fontFamily, fontSize } from '../../src/themes';
import { isValidCMPhone } from '@vitacare/utils';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Le nom complet est requis.';
    }

    if (!isValidCMPhone(phone)) {
      newErrors.phone = 'Numéro de téléphone invalide.';
    }

    if (password.length < 8 || password.includes(' ')) {
      newErrors.password = 'Le mot de passe doit faire minimum 8 caractères sans espace.';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);

    try {
      // TODO: appel API inscription
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/(auth)/onboarding-location');
    } catch {
      setErrors({ global: 'Une erreur est survenue. Réessayez.' });
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Rejoignez notre service !</Text>
          <Text style={styles.subtitle}>Créer votre profil dès maintenant</Text>
        </View>

        <View style={styles.form}>
          {/* Field - FullName */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Nom complet</Text>
            <NameInput
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) setErrors(e => ({ ...e, fullName: '' }));
              }}
              placeholder="Ex: Jean Ateba Mbarga"
              error={!!errors.fullName}
            />
            {errors.fullName && <HelperText message={errors.fullName} type="error" />}
          </View>

          {/* Field - Full Phone Number */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Numéro de téléphone</Text>
            <PhoneInput
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) setErrors(e => ({ ...e, phone: '' }));
              }}
              error={!!errors.phone}
            />
            {errors.phone && <HelperText message={errors.phone} type="error" />}
          </View>

          {/* Field - Password */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Mot de Passe</Text>
            <PasswordInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors(e => ({ ...e, password: '' }));
              }}
              error={!!errors.password}
            />
            {errors.password && <HelperText message={errors.password} type="error" />}
          </View>

          {/* Field - Confirm Password */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Confirmer le Mot de passe</Text>
            <PasswordInput
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors(e => ({ ...e, confirmPassword: '' }));
              }}
              error={!!errors.confirmPassword}
            />
            {errors.confirmPassword && <HelperText message={errors.confirmPassword} type="error" />}
          </View>

          {errors.global && (
            <HelperText message={errors.global} type="error" />
          )}
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label="Continuer"
            fullWidth
            isLoading={isLoading}
            onPress={handleSubmit}
          />
          <Text style={styles.terms}>
            En continuant, vous acceptez nos{' '}
            <Text style={styles.link}>conditions d'utilisation</Text>
            {' '}et notre{' '}
            <Text style={styles.link}>politique de confidentialité</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 32,
  },
  header: {
    gap: 4,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.inkLight,
  },
  form: {
    gap: 24,
  },
  fieldWrapper: {
    gap: 6,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  footer: {
    gap: 16,
  },
  terms: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    fontFamily: fontFamily.semiBold,
    color: colors.ink,
  },
});