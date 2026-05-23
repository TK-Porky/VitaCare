/**
 * Forgot Password — VitaCare Pro (3 étapes)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppInput, AppButton, HelperText } from '../../src/components';
import { useAuthStore } from '../../src/store';
import { colors, fontFamily, fontSize } from '../../src/themes';

type Step = 'email' | 'otp' | 'password';

export default function ForgotPasswordScreen() {
  const { isLoading, error, clearError } = useAuthStore();

  const [step,     setStep]     = useState<Step>('email');
  const [email,    setEmail]    = useState('');
  const [otp,      setOtp]      = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [localErr, setLocalErr] = useState<string | null>(null);

  const displayError = localErr || error;

  const handleEmail = async () => {
    if (!email.includes('@')) { setLocalErr('Email invalide.'); return; }
    clearError(); setLocalErr(null);
    // authService.forgotPassword is called here when USE_MOCK = false
    setStep('otp');
  };

  const handleOtp = async () => {
    if (otp.length < 4) { setLocalErr('Entrez le code reçu.'); return; }
    clearError(); setLocalErr(null);
    // authService.verifyPasswordResetOtp...
    setStep('password');
  };

  const handlePassword = async () => {
    if (password.length < 6) { setLocalErr('Le mot de passe doit faire au moins 6 caractères.'); return; }
    if (password !== confirm) { setLocalErr('Les mots de passe ne correspondent pas.'); return; }
    clearError(); setLocalErr(null);
    router.replace('/(auth)/login');
  };

  const STEPS = { email: 1, otp: 2, password: 3 };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity onPress={() => step === 'email' ? router.back() : setStep(step === 'otp' ? 'email' : 'otp')} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>

        {/* Progress */}
        <View style={styles.progressBar}>
          {[1,2,3].map((s) => (
            <View
              key={s}
              style={[styles.progressStep, s <= STEPS[step] && styles.progressStepActive]}
            />
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <Ionicons
              name={step === 'email' ? 'mail-outline' : step === 'otp' ? 'key-outline' : 'lock-closed-outline'}
              size={28}
              color={colors.primary}
            />
          </View>
          <Text style={styles.title}>
            {step === 'email' ? 'Mot de passe oublié'
              : step === 'otp' ? 'Code de vérification'
              : 'Nouveau mot de passe'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'email'
              ? 'Entrez votre email professionnel pour recevoir un code de réinitialisation.'
              : step === 'otp'
              ? `Un code a été envoyé à ${email}. Entrez-le ci-dessous.`
              : 'Choisissez un nouveau mot de passe sécurisé.'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {displayError && <HelperText message={displayError} type="error" />}

          {step === 'email' && (
            <AppInput
              label="Email professionnel"
              placeholder="dr.exemple@hopital.cm"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              value={email}
              onChangeText={setEmail}
            />
          )}

          {step === 'otp' && (
            <AppInput
              label="Code de vérification"
              placeholder="123456"
              keyboardType="number-pad"
              leftIcon="key-outline"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
            />
          )}

          {step === 'password' && (
            <>
              <AppInput
                label="Nouveau mot de passe"
                placeholder="••••••••"
                isPassword
                leftIcon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
              />
              <AppInput
                label="Confirmer le mot de passe"
                placeholder="••••••••"
                isPassword
                leftIcon="lock-closed-outline"
                value={confirm}
                onChangeText={setConfirm}
              />
            </>
          )}
        </View>

        <AppButton
          label={step === 'email' ? 'Envoyer le code'
            : step === 'otp' ? 'Vérifier le code'
            : 'Réinitialiser le mot de passe'}
          onPress={step === 'email' ? handleEmail : step === 'otp' ? handleOtp : handlePassword}
          isLoading={isLoading}
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: 24, paddingBottom: 40, gap: 24, flexGrow: 1 },
  back: {
    marginTop:     12,
    width:         40,
    height:        40,
    borderRadius:  20,
    backgroundColor: colors.white,
    alignItems:    'center',
    justifyContent:'center',
    borderWidth:   1,
    borderColor:   colors.border,
  },
  progressBar: { flexDirection: 'row', gap: 8, marginTop: 4 },
  progressStep: {
    flex:         1,
    height:       4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  progressStepActive: { backgroundColor: colors.primary },
  header: { gap: 12 },
  iconBadge: {
    width:          64,
    height:         64,
    borderRadius:   20,
    backgroundColor: colors.infoLight,
    alignItems:     'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize:   fontSize['2xl'],
    color:      colors.ink,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.sm,
    color:      colors.inkLight,
    lineHeight: 20,
  },
  form: { gap: 16 },
});
