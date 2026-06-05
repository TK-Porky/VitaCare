import { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { colors } from "../../../src/themes";
import {
  APPOINTMENTS,
  PAST_APPOINTMENTS,
} from "../../../src/data/mockAppointments";
import {
  AppointmentDetailBottomSheet,
  AppointmentDetailBottomSheetRef,
} from "../../../src/components/modals/";
import {
  AppHeader,
  TabsSection,
  MonthHeader,
  AppointmentCard,
  AppointmentCardSkeleton,
} from "../../../src/components";

// ================================================================================== //
// Main
// ================================================================================== //
export default function AppointmentScreen() {
  const router = useRouter();
  const appointmentRef = useRef<AppointmentDetailBottomSheetRef>(null);

  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [isLoading, setIsLoading] = useState(true);

  const data = activeTab === "upcoming" ? APPOINTMENTS : PAST_APPOINTMENTS;

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleCardPress = (_item: typeof APPOINTMENTS[0]) => {
    appointmentRef.current?.open();
  };

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
        <MonthHeader monthLabel="Mars" count={isLoading ? 3 : data.length} />

        {isLoading ? (
          <>
            <AppointmentCardSkeleton />
            <AppointmentCardSkeleton />
            <AppointmentCardSkeleton />
          </>
        ) : (
          data.map((item) => (
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
        actionVariant={activeTab === 'upcoming' ? 'reschedule' : 'book_again'}
        onReschedule={handleReservation}
        onBookAgain={handleReservation}
        onCancel={() => console.log('RDV annulé')}
        onShowOnMap={() => router.push('/home/map' as never)}
      />
    </SafeAreaView>
  );
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
