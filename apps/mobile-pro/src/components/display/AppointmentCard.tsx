/**
 * AppointmentCard — VitaCare Pro
 * Carte affichant un rendez-vous dans la liste agenda/dashboard
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize } from '../../themes';
import type { AppointmentStatus } from '../../types/api-responses';

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: 'En attente', color: colors.warning,  bg: colors.warningLight },
  confirmed: { label: 'Confirmé',   color: colors.success,  bg: colors.successLight },
  cancelled: { label: 'Annulé',     color: colors.error,    bg: colors.errorLight },
  completed: { label: 'Terminé',    color: colors.primary,  bg: colors.infoLight },
  no_show:   { label: 'Absent',     color: colors.inkLight, bg: colors.inkFaint },
};

interface Props {
  patientName: string;
  time:        string;
  duration:    number;
  reason:      string;
  status:      AppointmentStatus;
  onPress:     () => void;
}

export function AppointmentCard({ patientName, time, duration, reason, status, onPress }: Props) {
  const cfg = STATUS_CONFIG[status];

  const initials = (patientName || 'P')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0] || '')
    .join('')
    .toUpperCase() || 'P';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.container}>
      {/* Neutral Profile Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.patientName} numberOfLines={1}>{patientName}</Text>
          <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <Text style={styles.reason} numberOfLines={1}>{reason}</Text>

        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={13} color={colors.inkLight} />
            <Text style={styles.metaText}>{time}</Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="hourglass-outline" size={13} color={colors.inkLight} />
            <Text style={styles.metaText}>{duration} min</Text>
          </View>
        </View>
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
  },
  avatar: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: colors.infoLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarText: {
    fontFamily: fontFamily.bold,
    fontSize:   fontSize.md,
    color:      colors.primary,
  },
  content: {
    flex: 1,
    gap:  4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  patientName: {
    flex:       1,
    fontFamily: fontFamily.semiBold,
    fontSize:   fontSize.md,
    color:      colors.ink,
  },
  badge: {
    paddingVertical:   3,
    paddingHorizontal: 8,
    borderRadius:      20,
  },
  badgeText: {
    fontFamily: fontFamily.medium,
    fontSize:   fontSize.xs,
  },
  reason: {
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.sm,
    color:      colors.inkLight,
  },
  metaRow: {
    flexDirection: 'row',
    gap:           16,
    marginTop:     2,
  },
  meta: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  metaText: {
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.xs,
    color:      colors.inkLight,
  },
});
