/**
 * Appointment Detail — VitaCare Pro
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, HelperText } from '../../../src/components';
import { useAppointmentStore } from '../../../src/store';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import type { AppointmentStatus } from '../../../src/types/api-responses';

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending:   'En attente',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  completed: 'Terminé',
  no_show:   'Absent',
};

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  pending:   colors.warning,
  confirmed: colors.success,
  cancelled: colors.error,
  completed: colors.primary,
  no_show:   colors.inkLight,
};

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    selectedAppointment,
    isLoading,
    isActioning,
    error,
    fetchAppointmentById,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    clearSelectedAppointment,
  } = useAppointmentStore();

  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) fetchAppointmentById(id);
    return () => clearSelectedAppointment();
  }, [id]);

  const apt = selectedAppointment;

  const handleConfirm = () => {
    Alert.alert('Confirmer', 'Confirmer ce rendez-vous ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', onPress: () => confirmAppointment(id!) },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Annuler le rendez-vous', 'Êtes-vous sûr de vouloir annuler ?', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui, annuler', style: 'destructive', onPress: () => cancelAppointment(id!, 'Annulé par le médecin') },
    ]);
  };

  const handleComplete = () => {
    Alert.alert('Terminer', 'Marquer ce rendez-vous comme terminé ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Terminer', onPress: () => completeAppointment(id!, notes) },
    ]);
  };

  if (isLoading && !apt) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  if (!apt) {
    return (
      <View style={styles.center}>
        <HelperText message={error ?? 'Rendez-vous introuvable'} type="error" />
      </View>
    );
  }

  const statusColor = STATUS_COLOR[apt.status];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.toolbarTitle}>Détail du rendez-vous</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{STATUS_LABEL[apt.status]}</Text>
        </View>

        {/* Time & Duration */}
        <View style={styles.timeCard}>
          <View style={styles.timeItem}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <View>
              <Text style={styles.timeLabel}>Date</Text>
              <Text style={styles.timeValue}>
                {new Date(apt.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Text>
            </View>
          </View>
          <View style={styles.timeDivider} />
          <View style={styles.timeItem}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <View>
              <Text style={styles.timeLabel}>Heure</Text>
              <Text style={styles.timeValue}>{apt.time} · {apt.duration} min</Text>
            </View>
          </View>
        </View>

        {/* Patient */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient</Text>
          <View style={styles.patientCard}>
            <View style={styles.patientAvatar}>
              <Text style={styles.patientInitials}>
                {(apt.patient.fullName || 'P')
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((n) => n[0] || '')
                  .join('')
                  .toUpperCase() || 'P'}
              </Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{apt.patient.fullName}</Text>
              {apt.patient.phone && (
                <Text style={styles.patientPhone}>{apt.patient.phone}</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/(main)/patients/${apt.patient.id}` as any)}
              style={styles.patientLink}
            >
              <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Motif */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Motif de consultation</Text>
          <View style={styles.reasonBox}>
            <Text style={styles.reasonText}>{apt.reason}</Text>
          </View>
        </View>

        {/* Notes */}
        {apt.status !== 'cancelled' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes de consultation</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Saisissez vos notes ici..."
              placeholderTextColor={colors.inkMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={notes || apt.notes || ''}
              onChangeText={setNotes}
              editable={apt.status !== 'completed'}
            />
          </View>
        )}

        {/* Actions */}
        {error && <HelperText message={error} type="error" />}

        <View style={styles.actions}>
          {apt.status === 'pending' && (
            <>
              <AppButton
                label="Confirmer"
                onPress={handleConfirm}
                isLoading={isActioning}
                size="lg"
              />
              <AppButton
                label="Annuler le RDV"
                onPress={handleCancel}
                variant="danger"
                isLoading={isActioning}
                size="lg"
              />
            </>
          )}
          {apt.status === 'confirmed' && (
            <>
              <AppButton
                label="Marquer comme terminé"
                onPress={handleComplete}
                isLoading={isActioning}
                size="lg"
              />
              <AppButton
                label="Créer une prescription"
                onPress={() => router.push(`/(main)/prescriptions/create?patientId=${apt.patient.id}&appointmentId=${apt.id}` as any)}
                variant="outline"
                size="lg"
              />
              <AppButton
                label="Annuler"
                onPress={handleCancel}
                variant="ghost"
                size="md"
              />
            </>
          )}
          {apt.status === 'completed' && (
            <AppButton
              label="Créer une prescription"
              onPress={() => router.push(`/(main)/prescriptions/create?patientId=${apt.patient.id}&appointmentId=${apt.id}` as any)}
              variant="outline"
              size="lg"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  toolbar: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical:   12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width:          40,
    height:         40,
    borderRadius:   20,
    backgroundColor: colors.surface,
    alignItems:     'center',
    justifyContent: 'center',
  },
  toolbarTitle: { fontFamily: fontFamily.semiBold, fontSize: fontSize.base, color: colors.ink },

  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, gap: 20 },

  statusBadge: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    alignSelf:     'flex-start',
    paddingVertical:   6,
    paddingHorizontal: 14,
    borderRadius:  20,
  },
  statusDot:  { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontFamily: fontFamily.semiBold, fontSize: fontSize.sm },

  timeCard: {
    flexDirection:   'row',
    backgroundColor: colors.surface,
    borderRadius:    14,
    padding:         16,
    gap:             16,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  timeItem:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  timeDivider: { width: 1, backgroundColor: colors.border },
  timeLabel:   { fontFamily: fontFamily.regular, fontSize: fontSize.xs, color: colors.inkLight },
  timeValue:   { fontFamily: fontFamily.semiBold, fontSize: fontSize.sm, color: colors.ink },

  section:      { gap: 10 },
  sectionTitle: { fontFamily: fontFamily.semiBold, fontSize: fontSize.sm, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: 0.8 },

  patientCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.white,
    borderRadius:    14,
    padding:         14,
    gap:             12,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  patientAvatar: {
    width:          44, height: 44, borderRadius: 22,
    backgroundColor: colors.infoLight,
    alignItems:     'center', justifyContent: 'center',
  },
  patientInitials: { fontFamily: fontFamily.bold, fontSize: fontSize.md, color: colors.primary },
  patientInfo:     { flex: 1, gap: 2 },
  patientName:     { fontFamily: fontFamily.semiBold, fontSize: fontSize.md, color: colors.ink },
  patientPhone:    { fontFamily: fontFamily.regular,  fontSize: fontSize.xs, color: colors.inkLight },
  patientLink:     { padding: 4 },

  reasonBox: {
    backgroundColor: colors.surface,
    borderRadius:    12,
    padding:         14,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  reasonText: { fontFamily: fontFamily.regular, fontSize: fontSize.md, color: colors.ink },

  notesInput: {
    backgroundColor: colors.surface,
    borderRadius:    12,
    padding:         14,
    minHeight:       100,
    borderWidth:     1,
    borderColor:     colors.border,
    fontFamily:      fontFamily.regular,
    fontSize:        fontSize.md,
    color:           colors.ink,
  },

  actions: { gap: 10, marginTop: 4 },
});
