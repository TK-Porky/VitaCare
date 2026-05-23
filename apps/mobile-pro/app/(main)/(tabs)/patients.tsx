/**
 * Patients — VitaCare Pro
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PatientCard, HelperText } from '../../../src/components';
import { usePatientStore } from '../../../src/store';
import { colors, fontFamily, fontSize } from '../../../src/themes';

export default function PatientsScreen() {
  const { patients, isLoading, error, fetchPatients } = usePatientStore();
  const [search, setSearch] = useState('');

  useEffect(() => { fetchPatients(); }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    fetchPatients(text || undefined);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Patients</Text>
        <Text style={styles.subtitle}>{patients.length} patient{patients.length !== 1 ? 's' : ''} suivi{patients.length !== 1 ? 's' : ''}</Text>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={colors.inkMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un patient..."
            placeholderTextColor={colors.inkMuted}
            value={search}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.inkMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <HelperText message={error} type="error" />
        </View>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={colors.inkFaint} />
              <Text style={styles.emptyText}>
                {search ? 'Aucun patient trouvé' : 'Aucun patient suivi'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <PatientCard
              fullName={item.fullName}
              lastVisit={item.lastVisit}
              totalAppointments={item.totalAppointments}
              gender={item.gender}
              onPress={() => router.push(`/(main)/patients/${item.id}` as any)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: {
    paddingHorizontal: 16,
    paddingTop:        56,
    paddingBottom:     16,
    backgroundColor:   colors.white,
    gap:               8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title:    { fontFamily: fontFamily.bold,    fontSize: fontSize['2xl'], color: colors.ink },
  subtitle: { fontFamily: fontFamily.regular, fontSize: fontSize.sm,     color: colors.inkLight },
  searchWrap: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.surface,
    borderWidth:     1,
    borderColor:     colors.border,
    borderRadius:    12,
    paddingHorizontal: 12,
    height:          44,
    marginTop:       4,
  },
  searchIcon:  { marginRight: 8 },
  searchInput: {
    flex:       1,
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.md,
    color:      colors.ink,
  },
  list:  { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  empty: { paddingTop: 60, alignItems: 'center', gap: 12 },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.sm,
    color:      colors.inkLight,
  },
});
