/**
 * Login Screen — VitaCare Pro
 * Connexion email / mot de passe pour les professionnels de santé
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppInput, AppButton, HelperText } from '../../src/components';
import { useAuthStore } from '../../src/store';
import { colors, fontFamily, fontSize } from '../../src/themes';

// ================================================================================== //
// Schema
// ================================================================================== //

const schema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});
type FormData = z.infer<typeof schema>;

// ================================================================================== //
// Screen
// ================================================================================== //

export default function LoginScreen() {
  const { loginWithEmail, isLoading, error, clearError } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    clearError();
    await loginWithEmail(data.email, data.password);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <Ionicons name="lock-closed" size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>
            Accédez à votre espace professionnel VitaCare Pro
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error && <HelperText message={error} type="error" />}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Adresse email professionnelle"
                placeholder="dr.exemple@hopital.cm"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Mot de passe"
                placeholder="••••••••"
                isPassword
                leftIcon="lock-closed-outline"
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotLink}
          >
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <AppButton
          label="Se connecter"
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          size="lg"
        />

        {/* Hint */}
        <View style={styles.hintBox}>
          <Ionicons name="information-circle-outline" size={16} color={colors.inkMuted} />
          <Text style={styles.hintText}>
            Vos identifiants vous ont été fournis par l'administration VitaCare.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.surface },
  content: {
    paddingHorizontal: 24,
    paddingBottom:     40,
    gap:               20,
    flexGrow:          1,
  },
  back: {
    marginTop:     12,
    width:         40,
    height:        40,
    borderRadius:  20,
    backgroundColor: colors.white,
    alignItems:     'center',
    justifyContent: 'center',
    borderWidth:    1,
    borderColor:    colors.border,
  },
  header: {
    gap:         12,
    marginTop:   8,
    marginBottom: 4,
  },
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
    fontSize:   fontSize['3xl'],
    color:      colors.ink,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.sm,
    color:      colors.inkLight,
    lineHeight: 20,
  },
  form:     { gap: 16 },
  forgotLink: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: {
    fontFamily: fontFamily.medium,
    fontSize:   fontSize.sm,
    color:      colors.primary,
  },
  hintBox: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             8,
    backgroundColor: colors.border,
    padding:         12,
    borderRadius:    10,
    marginTop:       4,
  },
  hintText: {
    flex:       1,
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.xs,
    color:      colors.inkMuted,
    lineHeight: 16,
  },
});
