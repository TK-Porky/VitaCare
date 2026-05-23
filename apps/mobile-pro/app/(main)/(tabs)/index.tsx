/**
 * Dashboard — VitaCare Pro
 * Tableau de bord du professionnel de santé
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  ProHeader,
  StatCard,
  AppointmentCard,
  HelperText,
} from '../../../src/components';
import { useAuthStore, useDashboardStore } from '../../../src/store';
import { colors, fontFamily, fontSize } from '../../../src/themes';

export default function DashboardScreen() {
  const user       = useAuthStore((s) => s.user);
  const { data, isLoading, error, fetchOverview } = useDashboardStore();

  useEffect(() => { fetchOverview(); }, []);

  if (isLoading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!data && error) {
    return (
      <View style={styles.center}>
        <HelperText message={error} type="error" />
        <TouchableOpacity onPress={fetchOverview} style={styles.retryBtn}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data) return null;

  const { stats, weeklySlots, nextAppointment, todayAppointments } = data;
  const todayStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ProHeader
        doctorName={user?.fullName ?? 'Docteur'}
        specialty={user?.specialty}
        notificationCount={2}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchOverview} tintColor={colors.primary} />
        }
      >
        {/* Date */}
        <Text style={styles.dateText}>{todayStr.charAt(0).toUpperCase() + todayStr.slice(1)}</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            label="Confirmés"
            value={stats.confirmedToday}
            accent={colors.success}
            icon={<Ionicons name="checkmark-circle" size={18} color={colors.success} />}
          />
          <StatCard
            label="En attente"
            value={stats.pendingToday}
            accent={colors.warning}
            icon={<Ionicons name="time" size={18} color={colors.warning} />}
          />
          <StatCard
            label="Annulés"
            value={stats.cancelledToday}
            accent={colors.error}
            icon={<Ionicons name="close-circle" size={18} color={colors.error} />}
          />
        </View>

        {/* Occupancy */}
        <View style={styles.occupancyCard}>
          <View style={styles.occupancyHeader}>
            <View>
              <Text style={styles.occupancyTitle}>Taux d'occupation</Text>
              <Text style={styles.occupancySubtitle}>{stats.totalPatients} patients suivis</Text>
            </View>
            <Text style={styles.occupancyValue}>{stats.occupancyRate}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${stats.occupancyRate}%` }]} />
          </View>
        </View>

        {/* Weekly chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cette semaine</Text>
          <View style={styles.weekChart}>
            {weeklySlots.map((slot) => {
              const maxVal = Math.max(...weeklySlots.map((s) => s.total), 1);
              const barH   = Math.max((slot.total / maxVal) * 80, 4);
              const isToday = slot.dayLabel === new Date().toLocaleDateString('fr-FR', { weekday: 'short' }).substring(0, 3);
              return (
                <View key={slot.date} style={styles.weekDay}>
                  <Text style={styles.weekDayCount}>{slot.total > 0 ? slot.total : ''}</Text>
                  <View style={[styles.bar, { height: barH, backgroundColor: isToday ? colors.primary : colors.infoLight }]} />
                  <Text style={[styles.weekDayLabel, isToday && styles.weekDayLabelActive]}>{slot.dayLabel}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Today's appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rendez-vous aujourd'hui</Text>
            <TouchableOpacity onPress={() => router.push('/(main)/(tabs)/agenda' as any)}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {todayAppointments.length === 0 ? (
            <Text style={styles.emptyText}>Aucun rendez-vous aujourd'hui</Text>
          ) : (
            todayAppointments.slice(0, 3).map((apt) => (
              <AppointmentCard
                key={apt.id}
                patientName={apt.patient.fullName}
                time={apt.time}
                duration={apt.duration}
                reason={apt.reason}
                status={apt.status}
                onPress={() => router.push(`/(main)/appointments/${apt.id}` as any)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 12 },
  retryBtn: { padding: 12 },
  retryText: { fontFamily: fontFamily.semiBold, color: colors.primary },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 20 },

  dateText: { fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.inkLight },

  statsRow: { flexDirection: 'row', gap: 10 },

  // Occupancy
  occupancyCard: {
    backgroundColor: colors.white,
    borderRadius:    16,
    padding:         16,
    gap:             14,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  occupancyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  occupancyTitle: { fontFamily: fontFamily.semiBold, fontSize: fontSize.md, color: colors.ink },
  occupancySubtitle:{ fontFamily: fontFamily.regular, fontSize: fontSize.xs, color: colors.inkLight },
  occupancyValue: { fontFamily: fontFamily.bold, fontSize: fontSize['3xl'], color: colors.primary },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: colors.infoLight, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 4, backgroundColor: colors.primary },

  // Section
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: fontFamily.semiBold, fontSize: fontSize.base, color: colors.ink },
  seeAll: { fontFamily: fontFamily.medium, fontSize: fontSize.sm, color: colors.primary },
  emptyText: { fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.inkLight },

  // Week chart
  weekChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 110, backgroundColor: colors.white, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border },
  weekDay:   { flex: 1, alignItems: 'center', gap: 4 },
  weekDayCount: { fontFamily: fontFamily.medium, fontSize: 9, color: colors.inkMuted },
  bar:          { width: '70%', borderRadius: 3, minHeight: 4 },
  weekDayLabel: { fontFamily: fontFamily.regular, fontSize: 9, color: colors.inkMuted },
  weekDayLabelActive: { fontFamily: fontFamily.bold, color: colors.primary },
});
