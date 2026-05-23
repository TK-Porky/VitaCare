/**
 * ProHeader — VitaCare Pro
 * Header affiché sur les écrans principaux
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontFamily, fontSize } from '../../themes';

interface Props {
  doctorName:    string;
  specialty?:    string;
  onNotifications?: () => void;
  notificationCount?: number;
}

export function ProHeader({ doctorName, specialty, onNotifications, notificationCount = 0 }: Props) {
  const insets = useSafeAreaInsets();

  const firstName = doctorName ? doctorName.replace(/^Dr\.?\s*/i, '') : '';
  const initials  = (firstName || 'DR')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0] || '')
    .join('')
    .toUpperCase() || 'DR';

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + 12 }]}
    >
      {/* Left — Avatar + greeting */}
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.greetingWrap}>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.name} numberOfLines={1}>Dr. {firstName}</Text>
          {specialty && <Text style={styles.specialty}>{specialty}</Text>}
        </View>
      </View>

      {/* Right — Notifications */}
      {onNotifications && (
        <TouchableOpacity onPress={onNotifications} style={styles.notifBtn} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={22} color={colors.white} />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingBottom:     18,
    gap:               12,
  },
  left: {
    flex:          1,
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
  },
  avatar: {
    width:           46,
    height:          46,
    borderRadius:    23,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     2,
    borderColor:     'rgba(255,255,255,0.5)',
  },
  avatarText: {
    fontFamily: fontFamily.bold,
    fontSize:   fontSize.base,
    color:      colors.white,
  },
  greetingWrap: { flex: 1, gap: 1 },
  greeting: {
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.sm,
    color:      'rgba(255,255,255,0.8)',
  },
  name: {
    fontFamily: fontFamily.bold,
    fontSize:   fontSize.lg,
    color:      colors.white,
  },
  specialty: {
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.xs,
    color:      'rgba(255,255,255,0.75)',
  },
  notifBtn: {
    width:          40,
    height:         40,
    borderRadius:   20,
    backgroundColor:'rgba(255,255,255,0.2)',
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
  },
  badge: {
    position:        'absolute',
    top:             -2,
    right:           -2,
    minWidth:        16,
    height:          16,
    borderRadius:    8,
    backgroundColor: colors.error,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: fontFamily.bold,
    fontSize:   8,
    color:      colors.white,
  },
});
