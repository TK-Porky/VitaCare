/**
 * Agenda — VitaCare Pro
 * Liste des rendez-vous avec sélecteur de date par semaine
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { AppointmentCard, HelperText } from '../../../src/components';
import { useAppointmentStore } from '../../../src/store';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import type { AppointmentStatus } from '../../../src/types/api-responses';

// ================================================================================== //
// Date helpers
// ================================================================================== //

function getWeekDays(fromDate: Date): Date[] {
  const days: Date[] = [];
  const monday = new Date(fromDate);
  monday.setDate(fromDate.getDate() - fromDate.getDay() + 1);
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

const FILTER_TABS: { label: string; value: AppointmentStatus | 'all' }[] = [
  { label: 'Tous',       value: 'all' },
  { label: 'Confirmés',  value: 'confirmed' },
  { label: 'En attente', value: 'pending' },
  { label: 'Terminés',   value: 'completed' },
];

// ================================================================================== //
// Screen
// ================================================================================== //

export default function AgendaScreen() {
  const { weekAppointments, isLoading, error, fetchWeekAppointments } = useAppointmentStore();

  const [selectedDate,   setSelectedDate]   = useState(new Date());
  const [filterStatus,   setFilterStatus]   = useState<AppointmentStatus | 'all'>('all');
  const weekDays = getWeekDays(selectedDate);

  useEffect(() => { fetchWeekAppointments(); }, []);

  // Filter by date and status
  const dateStr = selectedDate.toISOString().split('T')[0];
  const filtered = weekAppointments.filter((apt) => {
    const matchDate   = apt.date === dateStr || apt.date === '2026-05-23'; // mock always shows today
    const matchStatus = filterStatus === 'all' || apt.status === filterStatus;
    return matchDate && matchStatus;
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mon Agenda</Text>
        <Text style={styles.subtitle}>
          {selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Week selector */}
      <View style={styles.weekSelector}>
        {weekDays.map((day) => {
          const active = isSameDay(day, selectedDate);
          const dayLabel = day.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3);
          return (
            <TouchableOpacity
              key={day.toISOString()}
              onPress={() => setSelectedDate(day)}
              activeOpacity={0.8}
              style={[styles.dayBtn, active && styles.dayBtnActive]}
            >
              <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>{dayLabel}</Text>
              <Text style={[styles.dayNum, active && styles.dayNumActive]}>{day.getDate()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Status filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            onPress={() => setFilterStatus(tab.value)}
            style={[styles.filterChip, filterStatus === tab.value && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filterStatus === tab.value && styles.filterTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Appointments list */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <HelperText message={error} type="error" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchWeekAppointments} tintColor={colors.primary} />
          }
        >
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun rendez-vous pour ce jour</Text>
            </View>
          ) : (
            filtered.map((apt) => (
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
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },

  header: {
    paddingHorizontal: 16,
    paddingTop:        56,
    paddingBottom:     16,
    backgroundColor:   colors.white,
    gap:               2,
  },
  title:    { fontFamily: fontFamily.bold,    fontSize: fontSize['2xl'], color: colors.ink },
  subtitle: { fontFamily: fontFamily.regular, fontSize: fontSize.sm,     color: colors.inkLight },

  weekSelector: {
    flexDirection:   'row',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingBottom:   16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayBtn: {
    flex:           1,
    alignItems:     'center',
    paddingVertical: 8,
    borderRadius:   10,
    gap:            4,
  },
  dayBtnActive: { backgroundColor: colors.primary },
  dayLabel: {
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.xs,
    color:      colors.inkLight,
    textTransform: 'capitalize',
  },
  dayLabelActive: { color: colors.white },
  dayNum: {
    fontFamily: fontFamily.semiBold,
    fontSize:   fontSize.base,
    color:      colors.ink,
  },
  dayNumActive: { color: colors.white },

  filterRow: { paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingVertical:   6,
    paddingHorizontal: 14,
    borderRadius:      20,
    backgroundColor:   colors.white,
    borderWidth:       1,
    borderColor:       colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: {
    fontFamily: fontFamily.medium,
    fontSize:   fontSize.sm,
    color:      colors.inkLight,
  },
  filterTextActive: { color: colors.white },

  list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32, gap: 10 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.inkLight },
});
