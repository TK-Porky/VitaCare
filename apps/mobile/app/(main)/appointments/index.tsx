import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { colors } from "../../../src/themes";
import {
  APPOINTMENTS,
  PAST_APPOINTMENTS,
} from "../../../src/data/mockAppointments";
import {
  ProfessionalProviderBottomSheet,
  ProfessionalProviderBottomSheetRef,
} from "../../../src/components/modals";
import {
  BookingBottomSheet,
  BookingBottomSheetRef,
} from "../../../src/components/modals/BookingBottomSheet";
import {
  AppointmentDetailBottomSheet,
  AppointmentDetailBottomSheetRef
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
  // ================================================================================== //
  // States
  // ================================================================================== //
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [selectedItem, setSelectedItem] = useState(APPOINTMENTS[0]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ================================================================================== //
  // Hooks
  // ================================================================================== //
  const router = useRouter();
  const profileSheetRef = useRef<ProfessionalProviderBottomSheetRef>(null);
  const bookingSheetRef = useRef<BookingBottomSheetRef>(null);
  const appointmentRef = useRef<AppointmentDetailBottomSheetRef>(null);
  
  const data = activeTab === "upcoming" ? APPOINTMENTS : PAST_APPOINTMENTS;

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // ================================================================================== //
  // Functions
  // ================================================================================== //
  const handleCardPress = (item: typeof APPOINTMENTS[0]) => {
    setSelectedItem(item);
    appointmentRef.current?.open();
  };

  const handleReservation = () => {
    profileSheetRef.current?.close();
    setTimeout(() => bookingSheetRef.current?.open(), 300);
  };

  // ================================================================================== //
  // Render
  // ================================================================================== //
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
        actionVariant="reschedule"
        onReschedule={() => console.log('reprogrammer')}
        onCancel={() => console.log('annuler')}
        onShowOnMap={() => console.log('carte')}
      />

      <BookingBottomSheet
        ref={bookingSheetRef}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
});