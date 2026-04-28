import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../../../src/components";
import { colors, fontFamily, fontSize } from "../../../src/themes";
import {
  AddReminderBottomSheet,
  AddReminderBottomSheetRef,
  ReminderData,
} from "../../../src/components/modals";

type Reminder = ReminderData & { id: string };

type Props = {
  onStore?: () => void;
};

const MOCK_REMINDERS: Reminder[] = [
  {
    id: "1",
    drugName: "Doliprane",
    form: "Gelule",
    dosageValue: "500",
    dosageUnit: "mg",
    frequencyUnit: "Jour",
    frequencyCount: "1",
    intervalDays: "0",
    time: "12:30",
  },
  {
    id: "2",
    drugName: "Doliprane",
    form: "Gelule",
    dosageValue: "500",
    dosageUnit: "mg",
    frequencyUnit: "Jour",
    frequencyCount: "1",
    intervalDays: "0",
    time: "12:30",
  },
];

const FREE_LIMIT = 2;

const LimitBanner = ({ onUpgrade }: { onUpgrade?: () => void }) => (
  <TouchableOpacity
    style={styles.banner}
    activeOpacity={0.85}
    onPress={onUpgrade}
  >
    <Ionicons name="star" size={20} color={colors.primary} />
    <View style={styles.bannerText}>
      <Text style={styles.bannerTitle}>Limite atteinte</Text>
      <Text style={styles.bannerSubtitle}>
        Passez à un abonnement Premium pour ajouter plus de médicaments
      </Text>
    </View>
  </TouchableOpacity>
);

const ReminderCard = ({
  item,
  onView,
}: {
  item: Reminder;
  onView?: (id: string) => void;
}) => (
  <View style={styles.card}>
    {/* Icon */}
    <View style={styles.cardIcon}>
      <Ionicons name="bandage-outline" size={22} color={colors.white} />
    </View>

    {/* Info */}
    <View style={styles.cardInfo}>
      <Text style={styles.cardTime}>{item.time}</Text>
      <Text style={styles.cardName} numberOfLines={1}>
        {item.drugName} {item.dosageValue}
        {item.dosageUnit} x {item.frequencyCount}/
        {item.frequencyUnit.toLowerCase().charAt(0)}j
      </Text>
    </View>

    {/* Badge + action */}
    <View style={styles.cardRight}>
      <Text style={styles.cardDoseBadge}>
        {item.frequencyCount} {item.form}
      </Text>
      <TouchableOpacity
        style={styles.viewBtn}
        onPress={() => onView?.(item.id)}
      >
        <Text style={styles.viewBtnText}>Voir</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function RemindersScreen({ onStore }: Props) {
  const [reminders, setReminders] = useState<Reminder[]>(MOCK_REMINDERS);
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const addSheetRef = useRef<AddReminderBottomSheetRef>(null);

  const limitReached = reminders.length >= FREE_LIMIT;

  const handleAdd = (data: ReminderData) => {
    setReminders((prev) => [...prev, { ...data, id: String(Date.now()) }]);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white}
        translucent={false}
      />

      <AppHeader
        searchBar={false}
        rightActions={
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="search-outline" size={22} color={colors.ink} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shopBtn} onPress={onStore}>
              <Ionicons name="cart-outline" size={18} color={colors.white} />
              <Text style={styles.shopBtnText}>Magasin</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* ── Limit banner (conditional) ── */}
      {limitReached && (
        <LimitBanner
          onUpgrade={() => {
            /* navigate to premium */
          }}
        />
      )}

      {/* ── List ── */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {reminders.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="bandage-outline"
              size={48}
              color={colors.inkFaint}
            />
            <Text style={styles.emptyText}>Aucun rappel pour l'instant</Text>
            <Text style={styles.emptySubtext}>
              Appuyez sur + pour ajouter votre premier médicament
            </Text>
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
      </ScrollView>

      {/* ── FAB ── */}
      {!limitReached && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => addSheetRef.current?.open()}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      )}

      {/* ── Add reminder sheet ── */}
      <AddReminderBottomSheet ref={addSheetRef} onAdd={handleAdd} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },

  // Header actions
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerBtn: {
    padding: 4,
  },
  shopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
  },
  shopBtnText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.white,
  },

  // Limit banner
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: colors.surface ?? "#F5F5F5",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bannerText: { flex: 1 },
  bannerTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.ink,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkMuted,
    lineHeight: 18,
  },

  // List
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
    gap: 12,
  },

  // Empty state
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 8,
  },
  emptyText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.base,
    color: colors.ink,
    marginTop: 8,
  },
  emptySubtext: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    textAlign: "center",
    paddingHorizontal: 32,
  },

  // Reminder card
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface ?? "#F5F5F5",
    borderRadius: 16,
    padding: 14,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
  },
  cardTime: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    color: colors.ink,
  },
  cardName: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkMuted,
    marginTop: 2,
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  cardDoseBadge: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.inkMuted,
  },
  viewBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
  },
  viewBtnText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.white,
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
});
