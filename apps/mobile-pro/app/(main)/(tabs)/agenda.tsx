/**
 * Agenda — VitaCare Pro
 * Liste des rendez-vous avec sélecteur de date par semaine
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppointmentCard, HelperText, AppBottomSheet, AppBottomSheetRef } from '../../../src/components';
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

function getInitials(patientName: string) {
  return (patientName || 'P')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0] || '')
    .join('')
    .toUpperCase() || 'P';
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
  const insets = useSafeAreaInsets();
  const { weekAppointments, isLoading, error, fetchWeekAppointments } = useAppointmentStore();

  // Screen View & Filter States
  const [viewMode,         setViewMode]         = useState<'list' | 'calendar'>('list');
  const [activeTab,        setActiveTab]        = useState<'upcoming' | 'past'>('upcoming');
  const [searchQuery,      setSearchQuery]      = useState('');
  const [isSearchActive,   setIsSearchActive]   = useState(false);
  const [filterStatus,     setFilterStatus]     = useState<AppointmentStatus | 'all'>('all');

  // BottomSheet Ref
  const filterSheetRef = useRef<AppBottomSheetRef>(null);

  // Calendar Specific States
  const [selectedDate,     setSelectedDate]     = useState(new Date());
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  useEffect(() => { fetchWeekAppointments(); }, []);

  // Calendar calculations
  const currentYear  = currentMonthDate.getFullYear();
  const currentMonth = currentMonthDate.getMonth();
  
  // Get all days of the current month
  const daysInMonth: (Date | null)[] = [];
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Monday-based index (0-6)
  
  // Padding cells before the 1st day of the month
  for (let i = 0; i < firstDayIndex; i++) {
    daysInMonth.push(null);
  }
  // Month days
  for (let d = 1; d <= totalDays; d++) {
    daysInMonth.push(new Date(currentYear, currentMonth, d));
  }

  // Handle Month Navigation
  const prevMonth = () => {
    setCurrentMonthDate(new Date(currentYear, currentMonth - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonthDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Filter Appointments
  const filtered = weekAppointments.filter((apt) => {
    // 1. Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const patientMatch = apt.patient.fullName.toLowerCase().includes(q);
      const reasonMatch  = apt.reason.toLowerCase().includes(q);
      if (!patientMatch && !reasonMatch) return false;
    }

    // 2. Status filter
    if (filterStatus !== 'all' && apt.status !== filterStatus) {
      return false;
    }

    // 3. Tab filter (À Venir vs Passés)
    const isUpcoming = apt.status === 'pending' || apt.status === 'confirmed';
    if (activeTab === 'upcoming' && !isUpcoming) return false;
    if (activeTab === 'past' && isUpcoming) return false;

    // 4. Calendar Date filter (Only active in calendar view mode)
    if (viewMode === 'calendar') {
      const aptDate = new Date(apt.date);
      if (!isSameDay(aptDate, selectedDate)) return false;
    }

    return true;
  });

  // Group by Month (Only for List View Mode)
  const groupedMonths: { monthLabel: string; count: number; appointments: typeof weekAppointments }[] = [];
  if (viewMode === 'list') {
    const tempGroups: Record<string, typeof weekAppointments> = {};
    
    filtered.forEach((apt) => {
      const dateObj = new Date(apt.date);
      const monthKey = dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      const formattedKey = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);
      if (!tempGroups[formattedKey]) tempGroups[formattedKey] = [];
      tempGroups[formattedKey].push(apt);
    });

    Object.entries(tempGroups).forEach(([monthLabel, appointments]) => {
      // Sort appointments inside group chronologically by date then time
      appointments.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
      groupedMonths.push({
        monthLabel,
        count: appointments.length,
        appointments,
      });
    });

    // Sort month groups chronologically by the date of their first appointment
    groupedMonths.sort((a, b) => {
      const dateA = new Date(a.appointments[0].date);
      const dateB = new Date(b.appointments[0].date);
      return dateA.getTime() - dateB.getTime();
    });
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header — Matches RDV.png style with toggles */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>Rendez-vous</Text>
        
        <View style={styles.headerActions}>
          {/* Toggle Search Bar */}
          <TouchableOpacity
            style={[styles.headerIconBtn, isSearchActive && styles.headerIconBtnActive]}
            onPress={() => {
              setIsSearchActive(!isSearchActive);
              if (isSearchActive) setSearchQuery('');
            }}
          >
            <Ionicons name="search-outline" size={22} color={isSearchActive ? colors.primary : colors.inkLight} />
          </TouchableOpacity>

          {/* Toggle Filter BottomSheet */}
          <TouchableOpacity
            style={[styles.headerIconBtn, filterStatus !== 'all' && styles.headerIconBtnActive]}
            onPress={() => filterSheetRef.current?.open()}
          >
            <Ionicons
              name={filterStatus === 'all' ? "funnel-outline" : "funnel"}
              size={22}
              color={filterStatus !== 'all' ? colors.primary : colors.inkLight}
            />
          </TouchableOpacity>

          {/* Toggle view mode list <-> calendar */}
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
          >
            <Ionicons
              name={viewMode === 'list' ? 'calendar-outline' : 'list-outline'}
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Slide-out Search Bar */}
      {isSearchActive && (
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={18} color={colors.inkMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Rechercher patient, motif..."
            placeholderTextColor={colors.inkMuted}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.inkMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        style={styles.scrollRoot}
        contentContainerStyle={[styles.scrollContent, viewMode === 'calendar' && { paddingHorizontal: 8, gap: 12 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchWeekAppointments} tintColor={colors.primary} />
        }
      >
        {/* Tabs Section — Identical to RDV.png (clock and calendar icon) */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'upcoming' && styles.tabBtnActive]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Ionicons
              name="time-outline"
              size={18}
              color={activeTab === 'upcoming' ? colors.primary : colors.inkLight}
            />
            <Text style={[styles.tabLabel, activeTab === 'upcoming' && styles.tabLabelActive]}>
              A Venir
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'past' && styles.tabBtnActive]}
            onPress={() => setActiveTab('past')}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={activeTab === 'past' ? colors.primary : colors.inkLight}
            />
            <Text style={[styles.tabLabel, activeTab === 'past' && styles.tabLabelActive]}>
              Passés
            </Text>
          </TouchableOpacity>
        </View>

        {/* VIEW 2: Calendar Grid (Now placed BELOW the tabs) */}
        {viewMode === 'calendar' && (
          <View style={styles.calendarCard}>
            {/* Calendar Nav */}
            <View style={styles.calendarNav}>
              <TouchableOpacity onPress={prevMonth} style={styles.calendarNavBtn}>
                <Ionicons name="chevron-back" size={20} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.calendarMonthLabel}>
                {currentMonthDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase())}
              </Text>
              <TouchableOpacity onPress={nextMonth} style={styles.calendarNavBtn}>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Weekdays Labels */}
            <View style={styles.weekdaysRow}>
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((label) => (
                <Text key={label} style={styles.weekdayLabel}>{label}</Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {daysInMonth.map((day, index) => {
                if (!day) {
                  return <View key={`empty-${index}`} style={styles.dayCellEmpty} />;
                }

                const isSelected = isSameDay(day, selectedDate);
                const isToday    = isSameDay(day, new Date());
                
                // Get all appointments on this day
                const dayApts = weekAppointments.filter((apt) => isSameDay(new Date(apt.date), day));
                
                // Filter unique patients for this day
                const uniqueApts: typeof weekAppointments = [];
                const seenPatients = new Set<string>();
                dayApts.forEach((apt) => {
                  if (!seenPatients.has(apt.patient.id)) {
                    seenPatients.add(apt.patient.id);
                    uniqueApts.push(apt);
                  }
                });

                const displayApts = uniqueApts.slice(0, 3);
                const extraCount = uniqueApts.length - displayApts.length;

                return (
                  <TouchableOpacity
                    key={day.toISOString()}
                    onPress={() => setSelectedDate(day)}
                    style={styles.dayCell}
                  >
                    {/* Date capsule (24x32) */}
                    <View
                      style={[
                        styles.dayNumberContainer,
                        isSelected && styles.dayNumberContainerSelected,
                        isToday && !isSelected && styles.dayNumberContainerToday
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSelected && styles.dayTextSelected,
                          isToday && !isSelected && styles.dayTextToday
                        ]}
                      >
                        {day.getDate()}
                      </Text>
                    </View>

                    {/* Bottom area (32px) for patient avatar markers */}
                    <View style={styles.dayCellBottom}>
                      {uniqueApts.length > 0 && (
                        <View style={styles.avatarStack}>
                          {displayApts.map((apt, idx) => {
                            const initials = getInitials(apt.patient.fullName);
                            return (
                              <View
                                key={apt.id}
                                style={[
                                  styles.miniAvatar,
                                  {
                                    marginLeft: idx > 0 ? -6 : 0,
                                    zIndex: 10 - idx,
                                  }
                                ]}
                              >
                                <Text style={styles.miniAvatarText}>{initials}</Text>
                              </View>
                            );
                          })}
                          {extraCount > 0 && (
                            <View style={[styles.miniAvatar, styles.miniAvatarExtra, { marginLeft: -6, zIndex: 1 }]}>
                              <Text style={styles.miniAvatarExtraText}>+{extraCount}</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Appointments list */}
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <HelperText message={error} type="error" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={colors.inkFaint} />
            <Text style={styles.emptyText}>Aucun rendez-vous</Text>
          </View>
        ) : viewMode === 'list' ? (
          /* Grouped list by Month */
          groupedMonths.map((group) => (
            <View key={group.monthLabel} style={styles.monthGroup}>
              {/* Group Divider Header — Matches RDV.png 1-to-1 */}
              <View style={styles.groupHeader}>
                <Text style={styles.groupMonthLabel}>{group.monthLabel.split(' ')[0]}</Text>
                <View style={styles.groupLine} />
                <Text style={styles.groupCount}>{group.count} Rendez-vous</Text>
              </View>

              <View style={styles.groupList}>
                {group.appointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    patientName={apt.patient.fullName}
                    time={apt.time}
                    duration={apt.duration}
                    reason={apt.reason}
                    status={apt.status}
                    onPress={() => router.push(`/(main)/appointments/${apt.id}` as any)}
                  />
                ))}
              </View>
            </View>
          ))
        ) : (
          /* Simple flat list for selected calendar day */
          <View style={styles.calendarDayList}>
            {filtered.map((apt) => (
              <AppointmentCard
                key={apt.id}
                patientName={apt.patient.fullName}
                time={apt.time}
                duration={apt.duration}
                reason={apt.reason}
                status={apt.status}
                onPress={() => router.push(`/(main)/appointments/${apt.id}` as any)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Filters BottomSheet */}
      <AppBottomSheet ref={filterSheetRef} scrollable={false} containerStyle={styles.sheetContainer}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Filtrer par statut</Text>
          <TouchableOpacity onPress={() => filterSheetRef.current?.close()}>
            <Ionicons name="close-circle-outline" size={24} color={colors.inkLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.radioList}>
          {FILTER_TABS.map((tab) => {
            const isSelected = filterStatus === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                style={[styles.radioItem, isSelected && styles.radioItemActive]}
                onPress={() => {
                  setFilterStatus(tab.value);
                  filterSheetRef.current?.close();
                }}
              >
                <Text style={[styles.radioLabel, isSelected && styles.radioLabelActive]}>
                  {tab.label}
                </Text>
                {/* Custom radio button visual indicator */}
                <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                  {isSelected && <View style={styles.radioInnerCircle} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {filterStatus !== 'all' && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setFilterStatus('all');
              filterSheetRef.current?.close();
            }}
          >
            <Text style={styles.resetButtonText}>Réinitialiser le filtre</Text>
          </TouchableOpacity>
        )}
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  scrollRoot: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 20 },
  centerContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },

  // Header — Matches RDV.png
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconBtnActive: {
    backgroundColor: colors.infoLight,
  },

  // Slide-out Search Bar
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.ink,
    padding: 0,
  },

  // Filters BottomSheet
  sheetContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 30,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: colors.ink,
  },
  radioList: {
    gap: 12,
  },
  radioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  radioItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.infoLight,
  },
  radioLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.ink,
  },
  radioLabelActive: {
    fontFamily: fontFamily.bold,
    color: colors.primary,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.inkFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  resetButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.inkLight,
  },

  // Tabs Container — Matches RDV.png
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.inkLight,
  },
  tabLabelActive: {
    fontFamily: fontFamily.bold,
    color: colors.primary,
  },

  // Grouped list by Month — Matches RDV.png
  monthGroup: {
    gap: 16,
    marginBottom: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  groupMonthLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.ink,
  },
  groupLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  groupCount: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.inkLight,
  },
  groupList: {
    gap: 12,
  },

  // Calendar View Card
  calendarCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
    borderWidth: 0,
    borderColor: colors.border,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 0,
    marginBottom: 10,
  },
  calendarNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarMonthLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.ink,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.inkLight,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  dayCellEmpty: {
    width: '14.28%',
    height: 64,
  },
  dayCell: {
    width: '14.28%',
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  dayNumberContainer: {
    width: 24,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberContainerSelected: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  dayNumberContainerToday: {
    backgroundColor: colors.infoLight,
  },
  dayCellBottom: {
    height: 32,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.infoLight,
    borderWidth: 1,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    fontSize: 8,
    fontFamily: fontFamily.bold,
    color: colors.primary,
  },
  miniAvatarExtra: {
    backgroundColor: colors.inkLight,
  },
  miniAvatarExtraText: {
    fontSize: 7,
    fontFamily: fontFamily.bold,
    color: colors.white,
  },
  dayText: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.ink,
  },
  dayTextSelected: {
    fontFamily: fontFamily.bold,
    color: colors.white,
  },
  dayTextToday: {
    fontFamily: fontFamily.bold,
    color: colors.primary,
  },

  // Flat Lists
  calendarDayList: {
    gap: 12,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.inkLight,
  },
});
