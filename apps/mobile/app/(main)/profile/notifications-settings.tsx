import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import { TopBar, HelperText } from '../../../src/components';
import { useProfile } from '../../../src/hooks';

type ToggleItemProps = {
  label: string;
  description: string;
  isEnabled: boolean;
  onToggle: (value: boolean) => void;
  isLoading?: boolean;
};

function ToggleItem({ label, description, isEnabled, onToggle, isLoading }: ToggleItemProps) {
  return (
    <View style={styles.toggleItem}>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{description}</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Switch
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={isEnabled ? colors.primary : colors.white}
          ios_backgroundColor={colors.border}
          onValueChange={onToggle}
          value={isEnabled}
        />
      )}
    </View>
  );
}

export default function NotificationsSettingsScreen() {
  const { updatePreferences, isUpdatingPreferences, error } = useProfile();
  
  // Local states (would normally come from a user preferences store/auth user)
  const [reminders, setReminders] = useState(true);
  const [appointments, setAppointments] = useState(true);
  const [offers, setOffers] = useState(false);

  const handleToggle = async (key: string, value: boolean) => {
    // Update local UI immediately for responsiveness
    if (key === 'reminders') setReminders(value);
    if (key === 'appointments') setAppointments(value);
    if (key === 'offers') setOffers(value);

    // Persist to backend
    await updatePreferences({
      medicationReminders: key === 'reminders' ? value : undefined,
      appointmentReminders: key === 'appointments' ? value : undefined,
      promotions: key === 'offers' ? value : undefined,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <TopBar title="Notifications" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences de réception</Text>
          <View style={styles.card}>
            <ToggleItem
              label="Rappels de médicaments"
              description="Recevoir une notification pour chaque prise prévue."
              isEnabled={reminders}
              onToggle={(v) => handleToggle('reminders', v)}
              isLoading={isUpdatingPreferences}
            />
            <View style={styles.divider} />
            <ToggleItem
              label="Alertes de rendez-vous"
              description="Rappels 24h et 1h avant vos rendez-vous médicaux."
              isEnabled={appointments}
              onToggle={(v) => handleToggle('appointments', v)}
              isLoading={isUpdatingPreferences}
            />
            <View style={styles.divider} />
            <ToggleItem
              label="Offres et nouveautés"
              description="Informations sur les pharmacies et services proches."
              isEnabled={offers}
              onToggle={(v) => handleToggle('offers', v)}
              isLoading={isUpdatingPreferences}
            />
          </View>
          {error && (
            <View style={{ marginTop: 12 }}>
              <HelperText message={error as string} type="error" />
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Note: Vous pouvez également gérer ces permissions dans les réglages système de votre téléphone.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.ink,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  toggleText: {
    flex: 1,
    gap: 4,
  },
  toggleLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  toggleDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  infoBox: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkMuted,
    lineHeight: 18,
  },
});
