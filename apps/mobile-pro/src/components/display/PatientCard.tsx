import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize } from '../../themes';

interface Props {
  fullName:          string;
  specialty?:        string;
  lastVisit?:        string;
  totalAppointments: number;
  gender?:           'male' | 'female' | 'other';
  onPress:           () => void;
}

export function PatientCard({ fullName, lastVisit, totalAppointments, gender, onPress }: Props) {
  const initials = (fullName || 'P')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0] || '')
    .join('')
    .toUpperCase() || 'P';

  const avatarColor = gender === 'female' ? '#F3A1C7' : gender === 'male' ? '#A1C4F3' : '#C1B8F0';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.container}>
      {/* Avatar center-top */}
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      {/* Info bottom */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{fullName}</Text>
        {lastVisit && (
          <Text style={styles.lastVisit}>
            Visite : {new Date(lastVisit).toLocaleDateString('fr-FR')}
          </Text>
        )}
      </View>

      {/* Appointment Count Badge */}
      <View style={styles.countBadge}>
        <Ionicons name="calendar" size={12} color={colors.primary} />
        <Text style={styles.count}>{totalAppointments} RDV</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:   'column',
    alignItems:      'center',
    backgroundColor: colors.white,
    borderRadius:    18,
    padding:         16,
    gap:             12,
    borderWidth:     1,
    borderColor:     colors.border,
    width:           '48.5%',
    shadowColor:     colors.ink,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.03,
    shadowRadius:    8,
    elevation:       2,
  },
  avatar: {
    width:          60,
    height:         60,
    borderRadius:   30,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   4,
  },
  avatarText: {
    fontFamily: fontFamily.bold,
    fontSize:   20,
    color:      colors.white,
  },
  info: {
    alignItems: 'center',
    gap:        4,
    width:      '100%',
  },
  name: {
    fontFamily: fontFamily.bold,
    fontSize:   15,
    color:      colors.ink,
    textAlign:  'center',
  },
  lastVisit: {
    fontFamily: fontFamily.regular,
    fontSize:   11,
    color:      colors.inkLight,
    textAlign:  'center',
  },
  countBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               4,
    backgroundColor:   colors.infoLight,
    paddingVertical:   4,
    paddingHorizontal: 10,
    borderRadius:      12,
    marginTop:         4,
  },
  count: {
    fontFamily: fontFamily.semiBold,
    fontSize:   12,
    color:      colors.primary,
  },
});
