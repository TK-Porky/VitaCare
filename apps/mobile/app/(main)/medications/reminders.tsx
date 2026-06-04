import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Plus, ShoppingBag, Pill, Info } from "lucide-react-native";
import { AppHeader, PrimaryButton } from "../../../src/components";
import { colors, fontFamily, fontSize } from "../../../src/themes";
import {
  AddReminderBottomSheet,
  AddReminderBottomSheetRef,
  ReminderData,
} from "../../../src/components/modals";
import { MOCK_REMINDERS } from "../../../src/data/mockMedications";

// ================================================================================== //
// Types
// ================================================================================== //
// Reminder type with id
type Reminder = ReminderData & { id: string };

// Props type
type Props = {
  onStore?: () => void;
};

const FREE_LIMIT = 5;

// ================================================================================== //
// Components
// ================================================================================== //

/**
 * Limit banner component
 * @param onUpgrade - Callback when upgrade button is pressed
 * @returns Limit banner component
 */
const LimitBanner = ({ onUpgrade }: { onUpgrade?: () => void }) => (
  <TouchableOpacity
    style={styles.banner}
    activeOpacity={0.85}
    onPress={onUpgrade}
  >
    <View style={styles.bannerIcon}>
      <Info size={18} color={colors.primary} />
    </View>
    <View style={styles.bannerText}>
      <Text style={styles.bannerTitle}>Limite de rappels gratuits</Text>
      <Text style={styles.bannerSubtitle}>
        Passez à VitaCare Premium pour ajouter un nombre illimité de médicaments.
      </Text>
    </View>
  </TouchableOpacity>
);

/**
 * Reminder card component
 * @param item - Reminder item
 * @param onView - Callback when card is pressed
 * @returns Reminder card component
 */
const ReminderCard = ({item, onView,}: {item: Reminder; onView?: (id: string) => void;}) => (
  <TouchableOpacity 
    style={styles.card} 
    activeOpacity={0.7}
    onPress={() => onView?.(item.id)}
  >
    {/* Icon */}
    <View style={styles.cardIcon}>
      <Pill size={20} color={colors.primary} />
    </View>

    {/* Info */}
    <View style={styles.cardInfo}>
      <Text style={styles.cardName}>{item.drugName}</Text>
      <Text style={styles.cardDetails}>
        {item.dosageValue}{item.dosageUnit} • {item.frequencyCount} fois / {item.frequencyUnit.toLowerCase()}
      </Text>
    </View>

    {/* Time & Badge */}
    <View style={styles.cardRight}>
      <View style={styles.timeBadge}>
        <Bell size={12} color={colors.ink} style={{ marginRight: 4 }} />
        <Text style={styles.cardTime}>{item.time}</Text>
      </View>
      <Text style={styles.cardFormBadge}>{item.form}</Text>
    </View>
  </TouchableOpacity>
);

// ================================================================================== //
// Main
// ================================================================================== //
export default function RemindersScreen({ onStore }: Props) {
  // ================================================================================== //
  // States
  // ================================================================================== //
  const [reminders, setReminders] = useState<Reminder[]>(MOCK_REMINDERS);
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const addSheetRef = useRef<AddReminderBottomSheetRef>(null);

  const limitReached = reminders.length >= FREE_LIMIT;

  // ================================================================================== //
  // Handlers
  // ================================================================================== //
  const handleAdd = (data: ReminderData) => {
    setReminders((prev) => [...prev, { ...data, id: String(Date.now()) }]);
  };

  // ================================================================================== //
  // Loading Render
  // ================================================================================== //
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ================================================================================== //
  // Render
  // ================================================================================== //
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white}
      />

      <AppHeader
        title="Mes Rappels"
        rightActions={
          <PrimaryButton
            label="Magasin"
            onPress={onStore}
            icon={<ShoppingBag size={16} color={colors.white} />}
            size="sm"
            style={{ width: 110 }}
          />
        }
      />

      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Limit banner (conditional) ── */}
        {reminders.length >= 2 && (
          <LimitBanner
            onUpgrade={() => {
              /* navigate to premium */
            }}
          />
        )}

        {/* ── List ── */}
        <View style={styles.list}>
          {reminders.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Bell size={40} color={colors.inkLight} />
              </View>
              <Text style={styles.emptyText}>Aucun rappel actif</Text>
              <Text style={styles.emptySubtext}>
                Ajoutez vos médicaments pour ne plus jamais oublier une prise.
              </Text>
              <PrimaryButton 
                label="Ajouter un rappel"
                onPress={() => addSheetRef.current?.open()}
                style={{ marginTop: 16 }}
                icon={<Plus size={18} color={colors.white} />}
              />
            </View>
          ) : (
            reminders.map((item) => (
              <ReminderCard
                key={item.id}
                item={item}
                onView={(id) => {
                  /* navigate to detail */
                }}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* ── FAB ── */}
      {!limitReached && reminders.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => addSheetRef.current?.open()}
          activeOpacity={0.85}
        >
          <Plus size={28} color={colors.white} />
        </TouchableOpacity>
      )}

      {/* ── Add reminder sheet ── */}
      <AddReminderBottomSheet ref={addSheetRef} onAdd={handleAdd} />
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
  },
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },

  // Limit banner
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerText: { flex: 1 },
  bannerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.ink,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
    lineHeight: 16,
  },

  // List
  list: {
    gap: 12,
  },

  // Empty state
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.ink,
  },
  emptySubtext: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    textAlign: "center",
    paddingHorizontal: 40,
    marginTop: 8,
    lineHeight: 20,
  },

  // Reminder card
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  cardDetails: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkLight,
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardTime: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.ink,
  },
  cardFormBadge: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    color: colors.primary,
    backgroundColor: "rgba(10, 191, 105, 0.1)", // colors.primary with opacity
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
