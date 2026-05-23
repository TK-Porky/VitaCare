/**
 * Patient Detail — VitaCare Pro
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, HelperText } from '../../../src/components';
import { usePatientStore } from '../../../src/store';
import { colors, fontFamily, fontSize } from '../../../src/themes';

function InfoRow({ icon, label, value }: { icon: string; label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon as any} size={16} color={colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedPatient, isLoading, error, fetchPatientById, clearSelectedPatient } = usePatientStore();

  useEffect(() => {
    if (id) fetchPatientById(id);
    return () => clearSelectedPatient();
  }, [id]);

  const patient = selectedPatient;

  if (isLoading && !patient) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  if (!patient) {
    return <View style={styles.center}><HelperText message={error ?? 'Patient introuvable'} type="error" /></View>;
  }

  const initials = patient.fullName.split(' ').slice(0,2).map((n)=>n[0]).join('').toUpperCase();
  const avatarColor = patient.gender === 'female' ? '#F3A1C7' : patient.gender === 'male' ? '#A1C4F3' : '#C1B8F0';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.toolbarTitle}>Dossier patient</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Patient header */}
        <View style={styles.patientHeader}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.patientName}>{patient.fullName}</Text>
          <View style={styles.metaRow}>
            {patient.dateOfBirth && (
              <Text style={styles.metaText}>
                {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} ans
              </Text>
            )}
            {patient.gender && (
              <Text style={styles.metaText}>
                • {patient.gender === 'male' ? 'Homme' : patient.gender === 'female' ? 'Femme' : 'Autre'}
              </Text>
            )}
            {patient.bloodType && (
              <View style={styles.bloodBadge}>
                <Text style={styles.bloodText}>{patient.bloodType}</Text>
              </View>
            )}
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{patient.totalAppointments}</Text>
              <Text style={styles.statLabel}>Consultations</Text>
            </View>
            {patient.lastVisit && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {new Date(patient.lastVisit).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </Text>
                <Text style={styles.statLabel}>Dernière visite</Text>
              </View>
            )}
          </View>
        </View>

        {/* Contact */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Coordonnées</Text>
          <InfoRow icon="call-outline"  label="Téléphone" value={patient.phone} />
          <InfoRow icon="mail-outline"  label="Email"     value={patient.email} />
          <InfoRow icon="home-outline"  label="Adresse"   value={patient.address} />
        </View>

        {/* Medical */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informations médicales</Text>
          <InfoRow icon="calendar-outline" label="Date de naissance"
            value={patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('fr-FR') : undefined}
          />
          {patient.allergies && patient.allergies.length > 0 && (
            <View style={styles.allergySection}>
              <Text style={styles.infoLabel}>Allergies</Text>
              <View style={styles.allergyRow}>
                {patient.allergies.map((a) => (
                  <View key={a} style={styles.allergyChip}>
                    <Ionicons name="warning" size={12} color={colors.warning} />
                    <Text style={styles.allergyText}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {patient.medicalHistory && (
            <View style={styles.historyBox}>
              <Text style={styles.infoLabel}>Antécédents médicaux</Text>
              <Text style={styles.historyText}>{patient.medicalHistory}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <AppButton
          label="Créer une prescription"
          onPress={() => router.push(`/(main)/prescriptions/create?patientId=${patient.id}` as any)}
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },

  toolbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  toolbarTitle: { fontFamily: fontFamily.semiBold, fontSize: fontSize.base, color: colors.ink },

  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, gap: 16 },

  patientHeader: {
    backgroundColor: colors.white, borderRadius: 16, padding: 20,
    alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.border,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  avatarText:   { fontFamily: fontFamily.bold, fontSize: fontSize['2xl'], color: colors.white },
  patientName:  { fontFamily: fontFamily.bold, fontSize: fontSize.xl, color: colors.ink },
  metaRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText:     { fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.inkLight },
  bloodBadge:   { backgroundColor: colors.errorLight, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 8 },
  bloodText:    { fontFamily: fontFamily.bold, fontSize: fontSize.xs, color: colors.error },
  statRow:      { flexDirection: 'row', gap: 32, marginTop: 8 },
  statItem:     { alignItems: 'center', gap: 2 },
  statValue:    { fontFamily: fontFamily.bold, fontSize: fontSize.xl, color: colors.primary },
  statLabel:    { fontFamily: fontFamily.regular, fontSize: fontSize.xs, color: colors.inkLight },

  card: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, gap: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  cardTitle: {
    fontFamily: fontFamily.semiBold, fontSize: fontSize.sm, color: colors.inkMuted,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
  },
  infoIcon: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: colors.infoLight,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontFamily: fontFamily.regular, fontSize: fontSize.xs, color: colors.inkLight, marginBottom: 2 },
  infoValue: { fontFamily: fontFamily.medium, fontSize: fontSize.sm, color: colors.ink },

  allergySection: { marginTop: 8, gap: 6 },
  allergyRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  allergyChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.warningLight, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12,
  },
  allergyText: { fontFamily: fontFamily.medium, fontSize: fontSize.xs, color: colors.warning },
  historyBox:  { marginTop: 8, gap: 4 },
  historyText: { fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.ink, lineHeight: 20 },
});
