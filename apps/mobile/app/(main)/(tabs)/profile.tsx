import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, fontFamily, fontSize } from "../../../src/themes";
import { router } from 'expo-router';

// ================================================================================== //
// Types
// ================================================================================== //
type MenuSection = {
  title: string;
  items: {
    id: string;
    icon: string;
    label: string;
  }[];
};

// ================================================================================== //
// Constants
// ================================================================================== //
const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Généraux',
    items: [
      { id: 'info',      icon: 'person-outline',        label: 'Mes Informations' },
      { id: 'activity',  icon: 'time-outline',           label: 'Mon activité' },
      { id: 'downloads', icon: 'download-outline',       label: 'Mes Téléchargements' },
    ],
  },
  {
    title: 'Accessiblité',
    items: [
      { id: 'lang', icon: 'globe-outline', label: 'Changer la langue' },
    ],
  },
  {
    title: 'Sécurité',
    items: [
      { id: 'password',      icon: 'lock-closed-outline', label: 'Modifier son mot de passe' },
      { id: 'notifications', icon: 'notifications-outline', label: 'Notifications' },
    ],
  },
  {
    title: 'Assistance',
    items: [
      { id: 'help',  icon: 'help-circle-outline',    label: 'Aide' },
      { id: 'terms', icon: 'document-text-outline',  label: "Termes et Conditions d'utilisation" },
    ],
  },
];

// ================================================================================== //
// Components
// ================================================================================== //

/**
 * Menu item component
 * @param icon - The icon to display
 * @param label - The label to display
 * @param danger - Whether the item is dangerous
 * @param onPress - The function to call when the item is pressed
 */
function MenuItem({
  icon,
  label,
  danger = false,
  onPress,
}: {
  icon: string;
  label: string;
  danger?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconWrapper]}>
        <Ionicons
          name={icon as any}
          size={20}
          color={danger ? colors.error : colors.ink}
        />
      </View>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {!danger && (
        <Feather name="chevron-right" size={16} color={colors.ink} />
      )}
    </TouchableOpacity>
  );
}

/**
 * Menu section component
 * @param title - The title of the section
 * @param items - The items in the section
 */
function MenuSection({ title, items }: { title: string; items: typeof MENU_SECTIONS[0]['items'] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item, index) => (
          <View key={item.id}>
            <MenuItem icon={item.icon} label={item.label} />
            {index < items.length - 1 && <View style={styles.itemDivider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

// ================================================================================== //
// Main
// ================================================================================== //
export default function ProfileScreen() {
  // ================================================================================== //
  // Handlers
  // ================================================================================== //
  const handleDisconnection = () => {
    router.replace('/(auth)');
  };

  // ================================================================================== //
  // Render
  // ================================================================================== //
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Page title ── */}
        <Text style={styles.pageTitle}>Votre Profile</Text>

        {/* ── Profile card ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/75.jpg' }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>Bille Théophile Kevin</Text>
          <Text style={styles.userPhone}>+237 6 81 51 84 89</Text>

          <TouchableOpacity style={styles.locationBtn} activeOpacity={0.85}>
            <Ionicons name="location-outline" size={16} color="#fff" />
            <Text style={styles.locationBtnText}>Yaoundé, Mvog-betsi</Text>
          </TouchableOpacity>
        </View>

        {/* ── Menu sections ── */}
        {MENU_SECTIONS.map((section) => (
          <MenuSection key={section.title} title={section.title} items={section.items} />
        ))}

        {/* ── Compte (danger zone) ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <View style={styles.sectionCard}>
            <MenuItem icon="log-out-outline" label="Se déconnecter" onPress={handleDisconnection} danger />
            <View style={styles.itemDivider} />
            <MenuItem icon="person-remove-outline" label="Supprimer mon compte" onPress={() => {}} danger />
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ================================================================================== //
// Styles
// ================================================================================== //
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
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.5,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },

  // Profile card
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
    shadowColor: 'rgba(34,197,94,0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: colors.inkLight,
    marginBottom: 16,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryMid,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 30,
    width: '100%',
    justifyContent: 'center',
    shadowColor: 'rgba(34,197,94,0.35)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  locationBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Sections
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.inkLight,
    letterSpacing: 0.3,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderRadius: 16,
    backgroundColor: colors.surface,
  },

  // Menu items
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
    fontFamily: fontFamily.semiBold,
  },
  itemDivider: {
    height: 0,
    backgroundColor: colors.border,
    marginLeft: 66,
  },
});