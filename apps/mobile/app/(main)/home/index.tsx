import React, { useEffect, useMemo, useCallback } from "react";
import { 
  FlatList, 
  View,
  Platform,
  Text, 
  StyleSheet, 
  StatusBar, 
  ActivityIndicator, 
  RefreshControl, 
  Alert,
  ListRenderItem
} from "react-native";
import { router } from "expo-router";
import { Flame, Pill, TrendingUp } from "lucide-react-native";
import {
  AppHeader,
  ObservanceCard,
  StatCard,
  SectionHeader,
  MedicationItem,
  AppointmentItem,
  HelperText,
} from "../../../src/components";
import { colors, fontFamily, fontSize } from "../../../src/themes";
import { useDashboardStore, useAuthStore } from "../../../src/store";

// ================================================================================== //
// Types
// ================================================================================== //
type BoardProps = {
  onMap: () => void;
  notificationBell?: React.ReactNode;
};

type DashboardListItem = 
  | { type: 'greeting'; id: string }
  | { type: 'observance'; id: string }
  | { type: 'stats'; id: string }
  | { type: 'section_header'; id: string; title: string; onSeeAll: () => void }
  | { type: 'medication'; id: string; medication: any }
  | { type: 'appointment'; id: string; appointment: any }
  | { type: 'empty'; id: string; message: string }
  | { type: 'spacer'; id: string; height: number };

// ================================================================================== //
// Main
// ================================================================================== //
export default function DashboardScreen({ onMap, notificationBell }: BoardProps) {
  // ================================================================================== //
  // Hooks
  // ================================================================================== //
  const { data, isLoading, error, fetchOverview, updateMedicationStatus } = useDashboardStore();
  const user = useAuthStore(state => state.user);

  // ================================================================================== //
  // Effects
  // ================================================================================== //
  useEffect(() => {
    fetchOverview();
  }, []);

  // ================================================================================== //
  // Handlers
  // ================================================================================== //
  const onRefresh = useCallback(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleSeeAllMedications = useCallback(() => {
    router.push("/(main)/(tabs)/medications" as any);
  }, []);

  const handleSeeAllAppointments = useCallback(() => {
    router.push("/(main)/(tabs)/appointments" as any);
  }, []);

  const handleSearch = useCallback(() => {
    router.push("/(main)/(tabs)/explore" as any);
  }, []);

  /**
   * Handle medication press to update status
   */
  const handleMedicationPress = useCallback((medicationId: number, currentStatus: string) => {
    if (currentStatus !== 'pending') return;

    Alert.alert(
      "Suivi de prise",
      "Avez-vous pris ce médicament ?",
      [
        {
          text: "Non, manqué",
          style: "destructive",
          onPress: () => updateMedicationStatus({ 
            medicationId, 
            status: 'missed' 
          }),
        },
        {
          text: "Oui, pris",
          onPress: () => updateMedicationStatus({ 
            medicationId, 
            status: 'taken',
            takenAt: new Date().toISOString()
          }),
        },
        {
          text: "Plus tard",
          style: "cancel"
        }
      ]
    );
  }, [updateMedicationStatus]);

  /**
   * Handle appointment press
   */
  const handleAppointmentPress = useCallback((appointmentId: number) => {
    console.log("Navigate to appointment:", appointmentId);
  }, []);

  // ================================================================================== //
  // Memoized Data for FlatList
  // ================================================================================== //
  const listData = useMemo(() => {
    if (!data) return [];

    const items: DashboardListItem[] = [
      { type: 'greeting', id: 'greeting' },
      { type: 'observance', id: 'observance' },
      { type: 'stats', id: 'stats' },
      { type: 'spacer', id: 'spacer1', height: 8 },
      { 
        type: 'section_header', 
        id: 'medications_header', 
        title: "Prises du jour", 
        onSeeAll: handleSeeAllMedications 
      },
    ];

    if (data.medications.length === 0) {
      items.push({ type: 'empty', id: 'empty_meds', message: "Aucune prise programmée" });
    } else {
      data.medications.forEach(med => {
        items.push({ type: 'medication', id: `med_${med.id}`, medication: med });
      });
    }

    items.push({ type: 'spacer', id: 'spacer2', height: 8 });
    items.push({ 
      type: 'section_header', 
      id: 'appointments_header', 
      title: "Vos Rendez-vous", 
      onSeeAll: handleSeeAllAppointments 
    });

    if (data.appointments.length === 0) {
      items.push({ type: 'empty', id: 'empty_apps', message: "Aucun rendez-vous prévu" });
    } else {
      data.appointments.slice(0, 3).forEach(app => {
        items.push({ type: 'appointment', id: `app_${app.id}`, appointment: app });
      });
    }

    return items;
  }, [data, handleSeeAllMedications, handleSeeAllAppointments]);

  // ================================================================================== //
  // Render Helpers
  // ================================================================================== //
  const todayStr = useMemo(() => new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }), []);

  const renderItem: ListRenderItem<DashboardListItem> = ({ item }) => {
    switch (item.type) {
      case 'greeting':
        return (
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>
              Bienvenue <Text style={styles.greetingName}>{user?.fullName || data?.currentUser}</Text> !
            </Text>
            <Text style={styles.greetingDate}>Aujourd'hui, {todayStr}</Text>
          </View>
        );
      case 'observance':
        return data ? (
          <ObservanceCard
            remainingDoses={data.stats.pending}
            totalDoses={data.stats.total}
            appointments={data.appointments.length}
            observancePercent={data.stats.observance}
          />
        ) : null;
      case 'stats':
        return data ? (
          <View style={styles.statsRow}>
            <StatCard
              icon={<Flame size={20} color={colors.inkLight} />}
              value={data.streak}
              label={"Jours\nConsécutifs"}
            />
            <StatCard
              icon={<Pill size={20} color={colors.inkLight} />}
              value={data.activeMedications}
              label={"Médicaments\nactifs"}
            />
            <StatCard
              icon={<TrendingUp size={20} color={colors.inkLight} />}
              value={`${data.monthlyProgress}%`}
              label="Ce mois-ci"
            />
          </View>
        ) : null;
      case 'section_header':
        return (
          <SectionHeader title={item.title} onSeeAll={item.onSeeAll} />
        );
      case 'medication':
        return (
          <MedicationItem
            name={item.medication.name}
            dose={item.medication.dosage}
            status={item.medication.status}
            time={item.medication.time}
            onPress={() => handleMedicationPress(item.medication.id, item.medication.status)}
          />
        );
      case 'appointment':
        return (
          <AppointmentItem
            doctorName={item.appointment.doctorName}
            date={item.appointment.date}
            time={item.appointment.time}
            status={item.appointment.status}
            avatarUrl={item.appointment.doctorAvatarUrl ?? undefined}
            onPress={() => handleAppointmentPress(item.appointment.id)}
          />
        );
      case 'empty':
        return (
          <Text style={styles.emptyText}>{item.message}</Text>
        );
      case 'spacer':
        return <View style={{ height: item.height }} />;
      default:
        return null;
    }
  };

  // ================================================================================== //
  // Loading & Error Renders
  // ================================================================================== //
  if (isLoading && !data) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!data && error) {
    return (
      <View style={styles.errorContainer}>
        <HelperText message={error} type="error" />
        <Text style={styles.retry} onPress={() => fetchOverview()}>Réessayer</Text>
      </View>
    );
  }

  // ================================================================================== //
  // Main Render
  // ================================================================================== //
  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor={colors.primary}
        barStyle="dark-content"
      />
      <AppHeader onSearch={handleSearch} onMap={onMap} notificationBell={notificationBell} />

      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 20,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.surface,
    gap: 12,
  },
  retry: {
    color: colors.primary,
    fontFamily: fontFamily.bold,
  },
  greeting: {
    gap: 4,
  },
  greetingText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize["2xl"],
    color: colors.ink,
  },
  greetingName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize["2xl"],
    color: colors.primary,
  },
  greetingDate: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkLight,
  },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    textAlign: "center",
    paddingVertical: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  section: {
    gap: 12,
  },
});

