/**
 * Profile — VitaCare Pro
 * Page de profil professionelle alignée sur la charte graphique et la structure du profil patient.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../../src/store';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import { profileService } from '../../../src/services/profile.service';

interface MenuItemProps {
  icon:     string;
  label:    string;
  value?:   string;
  danger?:  boolean;
  onPress?: () => void;
}

function MenuItem({ icon, label, value, danger = false, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1.0}
    >
      <View style={styles.menuIconWrapper}>
        <Ionicons
          name={icon as any}
          size={20}
          color={danger ? colors.error : colors.primary}
        />
      </View>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {value && <Text style={styles.menuValue} numberOfLines={1}>{value}</Text>}
      {onPress && !danger && (
        <Feather name="chevron-right" size={16} color={colors.inkLight} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [license, setLicense] = useState<string | null>(null);

  // Load extended profile pro to retrieve license number if available
  useEffect(() => {
    const loadFullProfile = async () => {
      try {
        const profile = await profileService.getProfile();
        if (profile.licenseNumber) {
          setLicense(profile.licenseNumber);
        }
      } catch (err) {
        console.warn('Failed to load extended profile data:', err);
      }
    };
    loadFullProfile();
  }, []);

  const initials = (user?.fullName ?? 'DR')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0] || '')
    .join('')
    .toUpperCase() || 'DR';

  // ================================================================================== //
  // Handlers
  // ================================================================================== //
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de se déconnecter.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Page title ── */}
        <Text style={styles.pageTitle}>Votre Profil</Text>

        {/* ── Identity card ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{user?.fullName ?? 'Médecin'}</Text>
          <Text style={styles.userSubtitle}>{user?.specialty ?? 'Professionnel de santé'}</Text>

          <TouchableOpacity style={styles.licenseBtn} activeOpacity={0.85}>
            <Ionicons name="shield-checkmark" size={16} color={colors.white} />
            <Text style={styles.licenseBtnText}>Licence : {license ?? user?.licenseNumber ?? '—'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Section: Cabinet ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cabinet</Text>
          <View style={styles.sectionCard}>
            <MenuItem icon="business-outline" label="Clinique" value={user?.clinicName ?? '—'} />
            <View style={styles.itemDivider} />
            <MenuItem icon="location-outline" label="Adresse" value={user?.clinicAddress ?? '—'} />
            <View style={styles.itemDivider} />
            <MenuItem
              icon="cash-outline"
              label="Consultation"
              value={user?.consultationFee ? `${user.consultationFee} ${user.currency ?? 'XAF'}` : '—'}
              onPress={() => router.push('/(main)/profile/fee-settings' as any)}
            />
          </View>
        </View>

        {/* ── Section: Coordonnées ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coordonnées</Text>
          <View style={styles.sectionCard}>
            <MenuItem icon="mail-outline" label="Email" value={user?.email ?? '—'} />
            <View style={styles.itemDivider} />
            <MenuItem icon="call-outline" label="Téléphone" value={user?.phone ?? '—'} />
          </View>
        </View>

        {/* ── Section: Préférences ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          <View style={styles.sectionCard}>
            <MenuItem
              icon="globe-outline"
              label="Langue"
              value="Français"
              onPress={() => router.push('/(main)/profile/language-settings' as any)}
            />
            <View style={styles.itemDivider} />
            <MenuItem
              icon="notifications-outline"
              label="Notifications"
              onPress={() => router.push('/(main)/profile/notifications-settings' as any)}
            />
          </View>
        </View>

        {/* ── Section: Sécurité ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité</Text>
          <View style={styles.sectionCard}>
            <MenuItem
              icon="lock-closed-outline"
              label="Modifier le mot de passe"
              onPress={() => router.push('/(main)/profile/change-password' as any)}
            />
          </View>
        </View>

        {/* ── Section: Assistance ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assistance</Text>
          <View style={styles.sectionCard}>
            <MenuItem
              icon="help-circle-outline"
              label="Aide & FAQ"
              onPress={() => router.push('/(main)/profile/help' as any)}
            />
            <View style={styles.itemDivider} />
            <MenuItem
              icon="chatbubbles-outline"
              label="Support Technique"
              onPress={() => router.push('/(main)/profile/support-chat' as any)}
            />
            <View style={styles.itemDivider} />
            <MenuItem
              icon="document-text-outline"
              label="Conditions d'Utilisation"
              onPress={() => router.push('/(main)/profile/terms' as any)}
            />
          </View>
        </View>

        {/* ── Section: Compte (danger zone) ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <View style={styles.sectionCard}>
            <MenuItem icon="log-out-outline" label="Se déconnecter" onPress={handleLogout} danger />
            <View style={styles.itemDivider} />
            <MenuItem
              icon="person-remove-outline"
              label="Supprimer mon compte"
              onPress={() => router.push('/(main)/profile/delete-account' as any)}
              danger
            />
          </View>
        </View>

        {/* ── Version ── */}
        <Text style={styles.version}>VitaCare Pro v0.0.1</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  // Page title
  pageTitle: {
    fontSize: 26,
    fontFamily: fontFamily.bold,
    color: colors.ink,
    letterSpacing: -0.5,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },

  // Profile Card (Surface Gray background matching client app profile.tsx)
  profileCard: {
    marginHorizontal: 16,
    marginBottom: 28,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: 'rgba(79, 110, 247, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  avatar: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(79, 110, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.primary,
  },
  userName: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: colors.ink,
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.inkLight,
    marginBottom: 16,
  },
  licenseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 30,
    width: '100%',
    justifyContent: 'center',
    shadowColor: 'rgba(79, 110, 247, 0.35)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  licenseBtnText: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.white,
  },

  // Sections
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.inkLight,
    letterSpacing: 0.3,
    marginBottom: 8,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
  },
  sectionCard: {
    borderRadius: 16,
    backgroundColor: colors.surface,
  },

  // Menu items (Raw Ionicons icons matching client app profile.tsx)
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: fontFamily.semiBold,
    color: colors.ink,
  },
  menuLabelDanger: {
    color: colors.error,
  },
  menuValue: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    marginRight: 4,
    maxWidth: '50%',
    textAlign: 'right',
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 54, // Aligned with the menu label start position
  },
  version: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkFaint,
    textAlign: 'center',
    marginTop: 4,
  },
});
