import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { User } from 'lucide-react-native';
import { TopBar, CustomInput, PasswordInput, PrimaryButton, HelperText, CheckboxField, EmailInput } from '../../src/components';
import { colors, fontFamily, fontSize } from '../../src/themes';

export default function LoginEmailScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Adresse email invalide.');
      return false;
    }
    if (password.length < 8) {
      setError('Mot de passe incorrect.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setError('');
    setIsLoading(true);

    try {
      // TODO: appel API connexion email
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.replace('/(main)');
    } catch {
      setError('Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    // TODO: Google OAuth
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
          <Text style={styles.title}>Connexion par Email</Text>
          <Text style={styles.subtitle}>
            Entrer votre numéro pour recevoir un code de confirmation
          </Text>
        </View>

        <View style={styles.form}>
          <EmailInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError('');
            }}
          />

          <PasswordInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) setError('');
            }}
          />

          <View style={styles.rememberRow}>
            <CheckboxField
              label="Souviens-toi de moi"
              checked={rememberMe}
              onToggle={() => setRememberMe(v => !v)}
            />
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.forgotText}>Mot de passe oublié</Text>
            </TouchableOpacity>
          </View>

          {error ? <HelperText message={error} type="error" /> : null}
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label="Se connecter"
            fullWidth
            isLoading={isLoading}
            onPress={handleSubmit}
          />

          <Text style={styles.or}>OR</Text>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogle}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleText}>Se connecter via Google</Text>
          </TouchableOpacity>

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
    backgroundColor: colors.white,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 32,
  },
  header: {
    gap: 6,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.ink,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.inkMuted,
    lineHeight: 20,
  },
  form: {
    gap: 20,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgotText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  footer: {
    gap: 16,
    alignItems: 'center',
  },
  or: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkLight,
  },
  googleButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  googleIcon: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    color: '#4285F4',
  },
  googleText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.ink,
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