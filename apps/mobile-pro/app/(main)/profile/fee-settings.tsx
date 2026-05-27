/**
 * FeeSettingsScreen — VitaCare Pro
 * Gestion du tarif de consultation médicale
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import { ProTopBar, AppInput, AppButton } from '../../../src/components';
import { useAuthStore } from '../../../src/store';
import { profileService } from '../../../src/services/profile.service';

export default function FeeSettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const [fee, setFee] = useState(user?.consultationFee?.toString() ?? '5000');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const feeNumber = parseInt(fee, 10);

    if (isNaN(feeNumber) || feeNumber < 0) {
      setError('Veuillez saisir un montant valide supérieur ou égal à 0.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      // Call service to persist update
      const updatedUser = await profileService.updateProfile({
        consultationFee: feeNumber,
      });

      // Update state in Zustand store directly
      useAuthStore.setState({ user: updatedUser });

      Alert.alert(
        'Succès',
        'Votre tarif de consultation a été mis à jour avec succès.',
        [
          {
            text: 'Ok',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le tarif.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ProTopBar title="Tarification" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Tarif de consultation</Text>
            <Text style={styles.subtitle}>
              Configurez le tarif de base appliqué pour vos consultations programmées depuis l'application mobile. Ce montant sera visible pour les patients lors de leur prise de rendez-vous.
            </Text>
          </View>

          <View style={styles.form}>
            <AppInput
              label={`Montant de la consultation (${user?.currency ?? 'XAF'})`}
              placeholder="Ex: 5000"
              keyboardType="numeric"
              value={fee}
              onChangeText={(t) => {
                setFee(t);
                if (error) setError('');
              }}
              error={error}
              leftIcon="cash-outline"
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Note : Des frais administratifs ou de tiers-payant peuvent s'ajouter selon les conventions de la clinique ({user?.clinicName ?? 'Clinique Sainte-Marie'}).
            </Text>
          </View>

          <View style={styles.footer}>
            <AppButton
              label="Enregistrer le tarif"
              isLoading={isLoading}
              onPress={handleSave}
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
  content: {
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
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
    lineHeight: 18,
  },
  footer: {
    marginTop: 36,
  },
});
