/**
 * Create Prescription — VitaCare Pro
 * Formulaire de création de prescription (modal)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppInput, AppButton, HelperText } from '../../../src/components';
import { prescriptionService } from '../../../src/services';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import type { PrescriptionMedication } from '../../../src/types/api-responses';

const EMPTY_MED: PrescriptionMedication = {
  name:         '',
  dosage:       '',
  frequency:    '',
  duration:     '',
  instructions: '',
};

export default function CreatePrescriptionScreen() {
  const { patientId, appointmentId } = useLocalSearchParams<{
    patientId?:    string;
    appointmentId?:string;
  }>();

  const [medications, setMedications] = useState<PrescriptionMedication[]>([{ ...EMPTY_MED }]);
  const [notes,       setNotes]       = useState('');
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const updateMed = (index: number, field: keyof PrescriptionMedication, value: string) => {
    setMedications((prev) => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const addMedication = () => {
    setMedications((prev) => [...prev, { ...EMPTY_MED }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length === 1) return;
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    if (!patientId) { setError('ID patient manquant.'); return false; }
    for (const med of medications) {
      if (!med.name.trim())      { setError('Nom du médicament requis.'); return false; }
      if (!med.dosage.trim())    { setError('Dosage requis.'); return false; }
      if (!med.frequency.trim()) { setError('Fréquence requise.'); return false; }
      if (!med.duration.trim())  { setError('Durée requise.'); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validate()) return;

    Alert.alert(
      'Confirmer la prescription',
      `Vous êtes sur le point de créer une prescription avec ${medications.length} médicament${medications.length > 1 ? 's' : ''}.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Créer',
          onPress: async () => {
            setIsLoading(true);
            try {
              await prescriptionService.createPrescription({
                patientId:     patientId!,
                appointmentId: appointmentId,
                medications,
                notes:         notes || undefined,
              });
              Alert.alert('Succès', 'Prescription créée avec succès.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (e: any) {
              setError(e?.message ?? 'Erreur lors de la création.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.toolbarTitle}>Nouvelle prescription</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {error && <HelperText message={error} type="error" />}

        {/* Medications */}
        {medications.map((med, index) => (
          <View key={index} style={styles.medCard}>
            <View style={styles.medHeader}>
              <View style={styles.medBadge}>
                <Ionicons name="medical" size={14} color={colors.primary} />
                <Text style={styles.medBadgeText}>Médicament {index + 1}</Text>
              </View>
              {medications.length > 1 && (
                <TouchableOpacity onPress={() => removeMedication(index)} style={styles.removeBtn}>
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>

            <AppInput
              label="Nom du médicament *"
              placeholder="ex: Paracétamol"
              value={med.name}
              onChangeText={(v) => updateMed(index, 'name', v)}
              leftIcon="medkit-outline"
            />
            <View style={styles.row}>
              <View style={styles.half}>
                <AppInput
                  label="Dosage *"
                  placeholder="ex: 500mg"
                  value={med.dosage}
                  onChangeText={(v) => updateMed(index, 'dosage', v)}
                />
              </View>
              <View style={styles.half}>
                <AppInput
                  label="Durée *"
                  placeholder="ex: 7 jours"
                  value={med.duration}
                  onChangeText={(v) => updateMed(index, 'duration', v)}
                />
              </View>
            </View>
            <AppInput
              label="Fréquence *"
              placeholder="ex: 3 fois par jour"
              value={med.frequency}
              onChangeText={(v) => updateMed(index, 'frequency', v)}
              leftIcon="repeat-outline"
            />
            <AppInput
              label="Instructions (optionnel)"
              placeholder="ex: À prendre pendant les repas"
              value={med.instructions ?? ''}
              onChangeText={(v) => updateMed(index, 'instructions', v)}
              leftIcon="information-circle-outline"
            />
          </View>
        ))}

        {/* Add medication */}
        <TouchableOpacity onPress={addMedication} style={styles.addMedBtn}>
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.addMedText}>Ajouter un médicament</Text>
        </TouchableOpacity>

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Notes générales (optionnel)</Text>
          <AppInput
            placeholder="Instructions particulières, régime, suivi..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Submit */}
        <View style={styles.footer}>
          {isLoading
            ? <ActivityIndicator color={colors.primary} size="large" />
            : <AppButton
                label={`Créer la prescription (${medications.length} médicament${medications.length > 1 ? 's' : ''})`}
                onPress={handleSubmit}
                size="lg"
              />
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  toolbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  toolbarTitle: { fontFamily: fontFamily.semiBold, fontSize: fontSize.base, color: colors.ink },

  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, gap: 16 },

  medCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, gap: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  medHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  medBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.infoLight, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20,
  },
  medBadgeText: { fontFamily: fontFamily.semiBold, fontSize: fontSize.sm, color: colors.primary },
  removeBtn: { padding: 6 },

  row:  { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },

  addMedBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: colors.primary,
    borderStyle: 'dashed', backgroundColor: colors.infoLight,
  },
  addMedText: { fontFamily: fontFamily.semiBold, fontSize: fontSize.sm, color: colors.primary },

  notesSection: { gap: 8 },
  notesLabel:   { fontFamily: fontFamily.semiBold, fontSize: fontSize.sm, color: colors.ink },

  footer: { marginTop: 8 },
});
