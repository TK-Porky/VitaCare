/**
 * Profile — VitaCare Pro
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../src/store';
import { colors, fontFamily, fontSize } from '../../../src/themes';

interface MenuItemProps {
  icon:  string;
  label: string;
  value?:string;
  onPress?: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, value, onPress, danger = false }: MenuItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.menuItem}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <Ionicons name={icon as any} size={18} color={danger ? colors.error : colors.primary} />
      </View>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {value && <Text style={styles.menuValue}>{value}</Text>}
      {onPress && !danger && (
        <Ionicons name="chevron-forward" size={16} color={colors.inkFaint} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const user   = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const initials = (user?.fullName ?? 'DR')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0] || '')
    .join('')
    .toUpperCase() || 'DR';

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnecter', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Hero */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.hero, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.heroName}>{user?.fullName ?? '—'}</Text>
        <Text style={styles.heroSpecialty}>{user?.specialty ?? '—'}</Text>
        <View style={styles.heroBadge}>
          <Ionicons name="shield-checkmark" size={14} color={colors.white} />
          <Text style={styles.heroBadgeText}>{user?.licenseNumber ?? '—'}</Text>
        </View>
      </LinearGradient>

      {/* Info cards */}
      <View style={styles.content}>

        {/* Cabinet */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cabinet</Text>
          <MenuItem icon="business-outline" label="Clinique"  value={user?.clinicName ?? '—'} />
          <MenuItem icon="location-outline" label="Adresse"   value={user?.clinicAddress ?? '—'} />
          <MenuItem icon="cash-outline"     label="Consultation" value={user?.consultationFee ? `${user.consultationFee} ${user.currency ?? 'XAF'}` : '—'} />
        </View>

        {/* Contact */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Coordonnées</Text>
          <MenuItem icon="mail-outline"  label="Email" value={user?.email ?? '—'} />
          <MenuItem icon="call-outline"  label="Téléphone" value={user?.phone ?? '—'} />
        </View>

        {/* Languages */}
        {user?.languages && user.languages.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Langues</Text>
            <View style={styles.langRow}>
              {user.languages.map((lang) => (
                <View key={lang} style={styles.langChip}>
                  <Text style={styles.langText}>{lang}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.card}>
          <MenuItem
            icon="log-out-outline"
            label="Se déconnecter"
            onPress={handleLogout}
            danger
          />
        </View>

        {/* Version */}
        <Text style={styles.version}>VitaCare Pro v0.0.1</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },

  hero: {
    alignItems:     'center',
    paddingHorizontal: 24,
    paddingBottom:  32,
    gap:            8,
  },
  avatar: {
    width:          80,
    height:         80,
    borderRadius:   40,
    backgroundColor:'rgba(255,255,255,0.25)',
    alignItems:     'center',
    justifyContent: 'center',
    borderWidth:    3,
    borderColor:    'rgba(255,255,255,0.5)',
    marginBottom:   4,
  },
  avatarText:    { fontFamily: fontFamily.bold, fontSize: fontSize['2xl'], color: colors.white },
  heroName:      { fontFamily: fontFamily.bold, fontSize: fontSize.xl,    color: colors.white },
  heroSpecialty: { fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)' },
  heroBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius:    20,
    marginTop:       4,
  },
  heroBadgeText: { fontFamily: fontFamily.medium, fontSize: fontSize.xs, color: colors.white },

  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, gap: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius:    16,
    padding:         16,
    gap:             4,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  cardTitle: {
    fontFamily:   fontFamily.semiBold,
    fontSize:     fontSize.sm,
    color:        colors.inkMuted,
    textTransform:'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  menuIcon: {
    width:          36,
    height:         36,
    borderRadius:   10,
    backgroundColor: colors.infoLight,
    alignItems:     'center',
    justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: colors.errorLight },
  menuLabel: {
    flex:       1,
    fontFamily: fontFamily.medium,
    fontSize:   fontSize.md,
    color:      colors.ink,
  },
  menuLabelDanger: { color: colors.error },
  menuValue: {
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.sm,
    color:      colors.inkLight,
    flexShrink: 1,
    maxWidth:   '50%',
    textAlign:  'right',
  },

  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  langChip: {
    paddingVertical:   4,
    paddingHorizontal: 12,
    borderRadius:      20,
    backgroundColor:   colors.infoLight,
  },
  langText: { fontFamily: fontFamily.medium, fontSize: fontSize.sm, color: colors.primary },

  version: {
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.xs,
    color:      colors.inkFaint,
    textAlign:  'center',
    marginTop:  4,
  },
});
