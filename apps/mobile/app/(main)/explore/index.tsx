import { useRef, useState } from "react";
import { ScrollView, StatusBar, SafeAreaView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { AppHeader, ClinicCard } from "../../../src/components";
import { colors } from "../../../src/themes";
import { CLINICS } from "../../../src/data/mockClinic";
import {
  ProfessionalProviderBottomSheet,
  ProfessionalProviderBottomSheetRef,
} from "../../../src/components/modals/ProfessionalProviderBottomSheet";
import {
  BookingBottomSheet,
  BookingBottomSheetRef,
} from "../../../src/components/modals/BookingBottomSheet";

// ================================================================================== //
// Main
// ================================================================================== //
export default function ExploreScreen() {
  // ================================================================================== //
  // Hooks
  // ================================================================================== //
  const router = useRouter();

  // ================================================================================== //
  // Refs
  // ================================================================================== //
  const profileSheetRef = useRef<ProfessionalProviderBottomSheetRef>(null);
  const bookingSheetRef = useRef<BookingBottomSheetRef>(null);

  // ================================================================================== //
  // States
  // ================================================================================== //
  const [selectedClinic, setSelectedClinic] = useState(CLINICS[0]);

  // ================================================================================== //
  // Functions
  // ================================================================================== //
  const handleMore = (clinicId: string) => {
    const clinic = CLINICS.find((c) => c.id === clinicId);
    if (!clinic) return;
    setSelectedClinic(clinic);
    profileSheetRef.current?.open();
  };

  const handleReservation = () => {
    profileSheetRef.current?.close();
    setTimeout(() => bookingSheetRef.current?.open(), 300);
  };

  // ================================================================================== //
  // Render
  // ================================================================================== //
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      <AppHeader onSearch={() => {}} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {CLINICS.map((clinic) => (
          <ClinicCard
            key={clinic.id}
            data={clinic}
            onReserve={() => handleMore(clinic.id)}
            onMore={() => handleMore(clinic.id)}
          />
        ))}
      </ScrollView>

      {/* Profile sheet — s'ouvre sur onMore */}
      <ProfessionalProviderBottomSheet
        ref={profileSheetRef}
        onReservation={handleReservation}
        onShowOnMap={() => router.push(`/home/map?clinicId=${selectedClinic.id}` as never)}
        onShare={() => {}}
      />

      {/* Booking sheet — s'ouvre depuis le profile sheet */}
      <BookingBottomSheet
        ref={bookingSheetRef}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 14,
  },
});