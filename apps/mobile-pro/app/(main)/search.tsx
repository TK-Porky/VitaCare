/**
 * Search Screen — VitaCare Pro
 * Recherche globale avec suggestions en temps réel et historique persistant.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fontFamily, fontSize } from '../../src/themes';
import { patientService } from '../../src/services/patient.service';
import { appointmentService } from '../../src/services/appointment.service';
import type { PatientDetail, ProAppointment } from '../../src/types/api-responses';

const RECENT_SEARCHES_KEY = '@vitacare_pro_recent_searches';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  // Search State
  const [query,          setQuery]          = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Results State
  const [matchedPatients, setMatchedPatients] = useState<PatientDetail[]>([]);
  const [matchedApts,     setMatchedApts]     = useState<ProAppointment[]>([]);
  const [isLoading,       setIsLoading]       = useState(false);

  // Load Recent Searches on mount
  useEffect(() => {
    loadRecentSearches();
    // Auto-focus input
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  // Trigger search on query change
  useEffect(() => {
    if (!query.trim()) {
      setMatchedPatients([]);
      setMatchedApts([]);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      try {
        const q = query.toLowerCase().trim();

        // 1. Fetch and filter patients
        const patients = await patientService.getPatients(q);
        setMatchedPatients(patients);

        // 2. Fetch and filter appointments
        const allApts = await appointmentService.getWeekAppointments();
        const filteredApts = allApts.filter(
          (apt) =>
            apt.reason.toLowerCase().includes(q) ||
            apt.patient.fullName.toLowerCase().includes(q)
        );
        setMatchedApts(filteredApts);
      } catch (err) {
        console.error('Error during search:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Small debounce mechanism
    const timeout = setTimeout(performSearch, 150);
    return () => clearTimeout(timeout);
  }, [query]);

  // AsyncStorage Helpers
  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load searches', e);
    }
  };

  const saveSearchQuery = async (searchVal: string) => {
    const trimmed = searchVal.trim();
    if (!trimmed) return;

    try {
      const filtered = recentSearches.filter((item) => item !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 10); // Keep last 10
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save search', e);
    }
  };

  const deleteRecentSearch = async (itemToDelete: string) => {
    try {
      const updated = recentSearches.filter((item) => item !== itemToDelete);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete search', e);
    }
  };

  const clearAllRecent = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {
      console.error('Failed to clear searches', e);
    }
  };

  // Click handler on item (adds search to recent list)
  const handleSelectSuggestion = (searchVal: string, navigatePath: string) => {
    saveSearchQuery(searchVal);
    Keyboard.dismiss();
    router.push(navigatePath as any);
  };

  // Text highlighting utility
  const renderHighlightedText = (text: string, highlight: string, baseStyle: any) => {
    if (!highlight.trim()) return <Text style={baseStyle}>{text}</Text>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <Text style={baseStyle}>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <Text key={i} style={styles.highlightText}>
              {part}
            </Text>
          ) : (
            part
          )
        )}
      </Text>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header Search Input */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => {
            Keyboard.dismiss();
            router.back();
          }}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.searchInputWrap}>
          <Ionicons name="search-outline" size={18} color={colors.inkMuted} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Rechercher patient, motif..."
            placeholderTextColor={colors.inkMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => saveSearchQuery(query)}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={20} color={colors.inkMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Suggestion Mode Empty */}
        {query.trim().length === 0 ? (
          <View style={styles.emptyView}>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recherches récentes</Text>
                  <TouchableOpacity onPress={clearAllRecent} activeOpacity={0.7}>
                    <Text style={styles.clearAllBtn}>Tout effacer</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.recentList}>
                  {recentSearches.map((item) => (
                    <View key={item} style={styles.recentItem}>
                      <TouchableOpacity
                        style={styles.recentItemClickable}
                        onPress={() => setQuery(item)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="time-outline" size={18} color={colors.inkMuted} style={styles.recentIcon} />
                        <Text style={styles.recentText}>{item}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteRecentSearch(item)} activeOpacity={0.7}>
                        <Ionicons name="close" size={18} color={colors.inkLight} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Navigation Shortcuts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Raccourcis</Text>
              <View style={styles.shortcutGrid}>
                <TouchableOpacity
                  style={styles.shortcutCard}
                  onPress={() => router.push('/(main)/(tabs)/patients' as any)}
                  activeOpacity={0.8}
                >
                  <View style={styles.shortcutIconWrap}>
                    <Ionicons name="people" size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.shortcutLabel}>Patients</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shortcutCard}
                  onPress={() => router.push('/(main)/(tabs)/agenda' as any)}
                  activeOpacity={0.8}
                >
                  <View style={styles.shortcutIconWrap}>
                    <Ionicons name="calendar" size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.shortcutLabel}>Agenda</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shortcutCard}
                  onPress={() => router.push('/(main)/prescriptions/create' as any)}
                  activeOpacity={0.8}
                >
                  <View style={styles.shortcutIconWrap}>
                    <Ionicons name="document-text" size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.shortcutLabel}>Prescription</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shortcutCard}
                  onPress={() => router.push('/(main)/(tabs)/profile' as any)}
                  activeOpacity={0.8}
                >
                  <View style={styles.shortcutIconWrap}>
                    <Ionicons name="settings" size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.shortcutLabel}>Profil pro</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          /* Suggestion Results Mode (Grouped Patients & Appointments) */
          <View style={styles.resultsView}>
            {isLoading && (
              <View style={styles.loaderWrap}>
                <ActivityIndicator color={colors.primary} size="small" />
              </View>
            )}

            {matchedPatients.length === 0 && matchedApts.length === 0 && !isLoading ? (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={48} color={colors.inkFaint} />
                <Text style={styles.noResultsText}>Aucun résultat trouvé pour "{query}"</Text>
              </View>
            ) : (
              <>
                {/* MATCHED PATIENTS */}
                {matchedPatients.length > 0 && (
                  <View style={styles.resultsSection}>
                    <Text style={styles.resultsSectionTitle}>Patients ({matchedPatients.length})</Text>
                    {matchedPatients.map((patient) => {
                      const initials = (patient.fullName || 'P')
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((n) => n[0] || '')
                        .join('')
                        .toUpperCase();
                      const avatarColor =
                        patient.gender === 'female' ? '#F3A1C7' : patient.gender === 'male' ? '#A1C4F3' : '#C1B8F0';

                      return (
                        <TouchableOpacity
                          key={patient.id}
                          style={styles.resultItemCard}
                          onPress={() =>
                            handleSelectSuggestion(query, `/(main)/patients/${patient.id}`)
                          }
                          activeOpacity={0.8}
                        >
                          <View style={[styles.resultAvatar, { backgroundColor: avatarColor }]}>
                            <Text style={styles.resultAvatarText}>{initials}</Text>
                          </View>
                          <View style={styles.resultDetails}>
                            {renderHighlightedText(patient.fullName, query, styles.resultName)}
                            <Text style={styles.resultSubtitle}>
                            Dernière visite : {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('fr-FR') : 'Aucune'}
                            </Text>
                          </View>
                          <View style={styles.rdvCountBadge}>
                            <Text style={styles.rdvCountText}>{patient.totalAppointments} RDV</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* MATCHED APPOINTMENTS */}
                {matchedApts.length > 0 && (
                  <View style={styles.resultsSection}>
                    <Text style={styles.resultsSectionTitle}>Rendez-vous ({matchedApts.length})</Text>
                    {matchedApts.map((apt) => {
                      const formattedDate = new Date(apt.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      });
                      
                      const statusColors: Record<string, string> = {
                        confirmed: colors.success,
                        pending: colors.warning,
                        cancelled: colors.error,
                        completed: colors.primary,
                      };

                      return (
                        <TouchableOpacity
                          key={apt.id}
                          style={styles.resultItemCard}
                          onPress={() =>
                            handleSelectSuggestion(query, `/(main)/appointments/${apt.id}`)
                          }
                          activeOpacity={0.8}
                        >
                          {/* DateTime Badge left */}
                          <View style={styles.dateBadge}>
                            <Text style={styles.dateBadgeDay}>{formattedDate}</Text>
                            <Text style={styles.dateBadgeTime}>{apt.time}</Text>
                          </View>

                          <View style={styles.resultDetails}>
                            {renderHighlightedText(apt.patient.fullName, query, styles.resultName)}
                            {renderHighlightedText(apt.reason, query, styles.resultReason)}
                          </View>

                          <View
                            style={[
                              styles.statusDot,
                              { backgroundColor: statusColors[apt.status] || colors.inkFaint },
                            ]}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Header Search Box
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 44,
    marginLeft: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.ink,
    padding: 0,
  },

  // Suggestion empty mode
  emptyView: {
    paddingTop: 12,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.ink,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  clearAllBtn: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.primary,
  },
  recentList: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentItemClickable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentIcon: {
    marginRight: 12,
  },
  recentText: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.ink,
  },

  // Shortcuts Grid
  shortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    justifyContent: 'space-between',
  },
  shortcutCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  shortcutIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.ink,
  },

  // Suggestions with query
  resultsView: {
    paddingTop: 12,
  },
  loaderWrap: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  noResults: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  noResultsText: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.inkLight,
    textAlign: 'center',
  },
  resultsSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  resultsSectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.inkLight,
    marginBottom: 12,
  },
  resultItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  resultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultAvatarText: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.white,
  },
  resultDetails: {
    flex: 1,
    gap: 2,
  },
  resultName: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.ink,
  },
  resultSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.inkLight,
  },
  resultReason: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.inkLight,
  },
  rdvCountBadge: {
    backgroundColor: colors.infoLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  rdvCountText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.primary,
  },
  highlightText: {
    fontFamily: fontFamily.bold,
    color: colors.primary,
  },

  // Appointment DateBadge
  dateBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 6,
    minWidth: 54,
  },
  dateBadgeDay: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.ink,
  },
  dateBadgeTime: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    color: colors.primary,
    marginTop: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
});
