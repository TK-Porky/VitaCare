/**
 * ChangePasswordScreen — VitaCare Pro
 * Écran sécurisé de modification du mot de passe professionnel
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import { ProTopBar, AppInput, AppButton } from '../../../src/components';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis.';
    }
    if (!newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis.';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe.';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Simulate API call to modify password
      await new Promise((r) => setTimeout(r, 1200));
      
      Alert.alert(
        'Succès',
        'Votre mot de passe professionnel a été modifié avec succès.',
        [
          {
            text: 'Ok',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la modification.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ProTopBar title="Sécurité" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Modifier le mot de passe</Text>
            <Text style={styles.subtitle}>
              Choisissez un mot de passe robuste d'au moins 8 caractères pour sécuriser l'accès à votre espace médical et aux dossiers de vos patients.
            </Text>
          </View>

          <View style={styles.form}>
            <AppInput
              label="Mot de passe actuel"
              placeholder="Entrez votre mot de passe actuel"
              isPassword
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                if (errors.currentPassword) setErrors({ ...errors, currentPassword: '' });
              }}
              error={errors.currentPassword}
            />

            <View style={styles.divider} />

            <AppInput
              label="Nouveau mot de passe"
              placeholder="Minimum 8 caractères"
              isPassword
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
              }}
              error={errors.newPassword}
            />

            <AppInput
              label="Confirmer le nouveau mot de passe"
              placeholder="Répétez le nouveau mot de passe"
              isPassword
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
              }}
              error={errors.confirmPassword}
            />
          </View>

          <View style={styles.footer}>
            <AppButton
              label="Enregistrer les modifications"
              isLoading={isLoading}
              onPress={handleUpdate}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.ink,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.inkLight,
    lineHeight: 20,
  },
  form: {
    gap: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  footer: {
    marginTop: 36,
  },
});
