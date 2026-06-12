import { useRef, useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { colors } from "../../../src/themes";
import { appointmentService } from "../../../src/services";
import { Appointment } from "../../../src/types";
import { AppointmentResponse } from "../../../src/types/api-responses";
import {
  AppointmentDetailBottomSheet,
  AppointmentDetailBottomSheetRef,
  AppointmentSheetData,
} from "../../../src/components/appointments/";
import {
  AppHeader,
  TabsSection,
  MonthHeader,
  AppointmentCard,
  AppointmentCardSkeleton,
} from "../../../src/components";

// ── Mapper backend → UI ───────────────────────────────────────────────────────

function toAppointment(r: AppointmentResponse): Appointment {
  return {
    id: String(r.id),
    doctorName: r.doctorName,
    doctorAvatarUri: r.doctorAvatarUrl ?? '',
    avatarUri: r.doctorAvatarUrl ?? '',
    specialty: r.specialty,
    motif: r.reason ?? '',
    clinic: r.clinicName,
    address: r.clinicAddress,
    date: r.date,
    time: r.time,
    dateTime: r.dateTime,
    status: normalizeStatus(r.status),
    total: r.total ?? undefined,
  };
}

function normalizeStatus(s: string): Appointment['status'] {
  const low = s.toLowerCase();
  if (low === 'confirmed') return 'confirmed';
  if (low === 'pending') return 'pending';
  if (low === 'paid') return 'paid';
  if (low === 'cancelled') return 'cancelled';
  return 'pending';
}

function isUpcoming(dateTime: string): boolean {
  return new Date(dateTime) >= new Date();
}

// ── toSheetData ───────────────────────────────────────────────────────────────

function toSheetData(item: Appointment): AppointmentSheetData {
  return {
    title:          `Visite`,
    doctorName:     item.doctorName,
    doctorAvatarUri: item.doctorAvatarUri || item.avatarUri || '',
    specialty:      item.specialty,
    status:         item.status,
    reason:         item.motif,
    dateTime:       item.dateTime ?? `${item.date} à ${item.time}`,
    clinicName:     item.clinic,
    locationSuffix: item.address,
    paymentMethod:  'Payer à la consultation',
    invoiceLines:   item.invoiceLines ?? [],
    total:          item.total ?? 0,
    currency:       item.currency ?? 'XCFA',
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AppointmentScreen() {
  const router = useRouter();
  const appointmentRef = useRef<AppointmentDetailBottomSheetRef>(null);

  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [selectedItem, setSelectedItem] = useState<AppointmentSheetData | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await appointmentService.getAll();
      setAllAppointments(items.map(toAppointment));
    } catch (err) {
      console.warn('Failed to fetch appointments', err);
      setAllAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const displayed = allAppointments.filter(a =>
    activeTab === 'upcoming' ? isUpcoming(a.dateTime ?? a.date) : !isUpcoming(a.dateTime ?? a.date)
  );

  const handleCardPress = useCallback((item: Appointment) => {
    setSelectedItem(toSheetData(item));
    appointmentRef.current?.open();
  }, []);

  const handleReservation = () => {
    router.push('/booking' as never);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />

      <AppHeader
        title="Rendez-vous"
        onFilter={() => console.log("Filter pressed")}
      />

      <TabsSection activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MonthHeader monthLabel={currentMonthLabel()} count={isLoading ? 3 : displayed.length} />

        {isLoading ? (
          <>
            <AppointmentCardSkeleton />
            <AppointmentCardSkeleton />
            <AppointmentCardSkeleton />
          </>
        ) : (
          displayed.map((item) => (
            <AppointmentCard
              key={item.id}
              item={item}
              onPress={() => handleCardPress(item)}
            />
          ))
        )}
      </ScrollView>

      <AppointmentDetailBottomSheet
        ref={appointmentRef}
        appointment={selectedItem ?? undefined}
        actionVariant={activeTab === 'upcoming' ? 'reschedule' : 'book_again'}
        onReschedule={handleReservation}
        onBookAgain={handleReservation}
        onCancel={() => console.log('RDV annulé')}
        onShowOnMap={() => router.push('/home/map' as never)}
      />
    </SafeAreaView>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function currentMonthLabel(): string {
  const raw = new Date().toLocaleDateString('fr-FR', { month: 'long' });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
});
