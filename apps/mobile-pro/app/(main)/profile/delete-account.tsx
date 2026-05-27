/**
 * DeleteAccountScreen — VitaCare Pro
 * Écran sécurisé et formel de demande de suppression de compte professionnel
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import { ProTopBar, AppInput, AppButton } from '../../../src/components';
import { useAuthStore } from '../../../src/store';

const DELETION_REASONS = [
  "Je change d'établissement ou de clinique",
  "Je n'utilise plus l'application au quotidien",
  "Rencontre de problèmes techniques ou de lenteurs",
  "Des tarifs de consultation ou frais d'utilisation trop élevés",
  "Autre motif (veuillez préciser ci-dessous)",
];

export default function DeleteAccountScreen() {
  const logout = useAuthStore((s) => s.logout);
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [password, setPassword] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteSubmit = () => {
    if (selectedReason === null) {
      Alert.alert('Erreur', 'Veuillez sélectionner un motif de suppression.');
      return;
    }
    if (!password) {
      setError('Veuillez saisir votre mot de passe pour confirmer.');
      return;
    }

    Alert.alert(
      'Confirmation définitive',
      'Cette action est irréversible. Vos données, antécédents de consultations et ordonnances associées seront définitivement anonymisés ou supprimés conformément aux réglementations de santé en vigueur. Confirmez-vous ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer définitivement',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              // Simulate API deletion request
              await new Promise((r) => setTimeout(r, 1500));
              Alert.alert(
                'Compte supprimé',
                'Votre compte professionnel a été supprimé avec succès. Vous allez être redirigé.',
                [
                  {
                    text: 'Ok',
                    onPress: async () => {
                      await logout();
                    },
                  },
                ]
              );
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de valider votre demande. Veuillez réessayer.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ProTopBar title="Suppression de compte" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Warning Banner */}
          <View style={styles.warningBanner}>
            <Ionicons name="warning-outline" size={24} color={colors.error} />
            <View style={styles.warningTextWrap}>
              <Text style={styles.warningTitle}>Action critique et irréversible</Text>
              <Text style={styles.warningDesc}>
                La suppression de votre compte professionnel désactivera immédiatement votre accès aux dossiers patients, à vos agendas, prescriptions passées et facturations en cours.
              </Text>
            </View>
          </View>

          {/* Reason Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pourquoi souhaitez-vous nous quitter ?</Text>
            <View style={styles.reasonsList}>
              {DELETION_REASONS.map((reason, index) => {
                const isSelected = selectedReason === index;
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.reasonItem}
                    onPress={() => setSelectedReason(index)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.reasonLabel}>{reason}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedReason === DELETION_REASONS.length - 1 && (
              <AppInput
                placeholder="Veuillez préciser votre motif ici..."
                value={customReason}
                onChangeText={setCustomReason}
                containerStyle={styles.customInput}
              />
            )}
          </View>

          {/* Confirmation Password */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Confirmer avec votre mot de passe</Text>
            <AppInput
              placeholder="Entrez votre mot de passe de connexion"
              isPassword
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (error) setError('');
              }}
              error={error}
            />
          </View>

          <View style={styles.footer}>
            <AppButton
              label="Faire la demande de suppression"
              variant="danger"
              isLoading={isLoading}
              onPress={handleDeleteSubmit}
            />
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.cancelBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Conserver mon compte</Text>
            </TouchableOpacity>
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
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: colors.errorLight,
    padding: 16,
    borderRadius: 16,
    gap: 14,
    marginBottom: 28,
  },
  warningTextWrap: {
    flex: 1,
    gap: 4,
  },
  warningTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.error,
  },
  warningDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
    lineHeight: 16,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.ink,
    marginBottom: 16,
  },
  reasonsList: {
    gap: 14,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.inkMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  reasonLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.ink,
    flex: 1,
    lineHeight: 20,
  },
  customInput: {
    marginTop: 12,
  },
  footer: {
    marginTop: 16,
    gap: 12,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.inkLight,
  },
});
