/**
 * PatientCard — VitaCare Pro
 */

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
  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const avatarColor = gender === 'female' ? '#F3A1C7' : gender === 'male' ? '#A1C4F3' : '#C1B8F0';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.container}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{fullName}</Text>
        {lastVisit && (
          <Text style={styles.lastVisit}>
            Dernière visite : {new Date(lastVisit).toLocaleDateString('fr-FR')}
          </Text>
        )}
      </View>

      {/* Total */}
      <View style={styles.countBadge}>
        <Text style={styles.count}>{totalAppointments}</Text>
        <Text style={styles.countLabel}>RDV</Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.inkFaint} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.white,
    borderRadius:    14,
    padding:         14,
    gap:             12,
    borderWidth:     1,
    borderColor:     colors.border,
    shadowColor:     colors.ink,
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.04,
    shadowRadius:    6,
    elevation:       2,
  },
  avatar: {
    width:          44,
    height:         44,
    borderRadius:   22,
    alignItems:     'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.bold,
    fontSize:   fontSize.md,
    color:      colors.white,
  },
  info: { flex: 1, gap: 2 },
  name: {
    fontFamily: fontFamily.semiBold,
    fontSize:   fontSize.md,
    color:      colors.ink,
  },
  lastVisit: {
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.xs,
    color:      colors.inkLight,
  },
  countBadge: {
    alignItems: 'center',
    gap:        1,
  },
  count: {
    fontFamily: fontFamily.bold,
    fontSize:   fontSize.base,
    color:      colors.primary,
  },
  countLabel: {
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.xs,
    color:      colors.inkLight,
  },
});
