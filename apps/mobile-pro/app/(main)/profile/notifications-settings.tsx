/**
 * NotificationsSettingsScreen — VitaCare Pro
 * Paramétrage moderne des notifications push et alertes professionnelles
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import { ProTopBar } from '../../../src/components';

interface ToggleItemProps {
  label: string;
  description: string;
  isEnabled: boolean;
  onToggle: (value: boolean) => void;
  isLoading?: boolean;
}

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
  const [appointments, setAppointments] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [messages, setMessages] = useState(true);
  const [system, setSystem] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (key: string, value: boolean) => {
    // Optimistic UI update
    if (key === 'appointments') setAppointments(value);
    if (key === 'reminders') setReminders(value);
    if (key === 'messages') setMessages(value);
    if (key === 'system') setSystem(value);

    setIsUpdating(true);
    try {
      // Simulate API call persistence
      await new Promise((r) => setTimeout(r, 600));
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de mettre à jour vos préférences.');
      // Rollback
      if (key === 'appointments') setAppointments(!value);
      if (key === 'reminders') setReminders(!value);
      if (key === 'messages') setMessages(!value);
      if (key === 'system') setSystem(!value);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ProTopBar title="Notifications" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Préférences d'alertes</Text>
          <Text style={styles.subtitle}>
            Personnalisez vos préférences de réception de notifications push pour rester informé en temps réel de votre activité médicale.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <ToggleItem
              label="Nouveaux rendez-vous"
              description="Alerte instantanée dès qu'un patient réserve une consultation dans votre cabinet."
              isEnabled={appointments}
              onToggle={(v) => handleToggle('appointments', v)}
              isLoading={isUpdating}
            />
            <View style={styles.divider} />
            <ToggleItem
              label="Rappels d'agenda"
              description="Rappels quotidiens de vos consultations et résumé d'agenda chaque matin à 8h."
              isEnabled={reminders}
              onToggle={(v) => handleToggle('reminders', v)}
              isLoading={isUpdating}
            />
            <View style={styles.divider} />
            <ToggleItem
              label="Messages des patients"
              description="Notifications instantanées de nouveaux messages de chat reçus de vos patients."
              isEnabled={messages}
              onToggle={(v) => handleToggle('messages', v)}
              isLoading={isUpdating}
            />
            <View style={styles.divider} />
            <ToggleItem
              label="Mises à jour de la plateforme"
              description="Alertes sur les nouveaux outils de prescription, nouvelles fonctionnalités et maintenances."
              isEnabled={system}
              onToggle={(v) => handleToggle('system', v)}
              isLoading={isUpdating}
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Note : Vous pouvez modifier ou désactiver globalement les autorisations de notifications de l'application dans les réglages système de votre téléphone.
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.ink,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.inkLight,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
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
    marginTop: 8,
  },
  infoText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
    lineHeight: 18,
  },
});
