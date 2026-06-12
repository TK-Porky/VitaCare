import { useRef, useState, useEffect, useCallback } from "react";
import { 
  View, 
  FlatList,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Text,
  ScrollView,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { AppHeader, ClinicCard, ClinicCardSkeleton } from "../../../src/components";
import { colors, fontFamily, fontSize } from "../../../src/themes";
import {
  ProfessionalProviderBottomSheet,
  ProfessionalProviderBottomSheetRef,
} from "../../../src/components/providers/ProfessionalProviderBottomSheet";
import { useMapStore } from "../../../src/store";
import { ClinicProviderResponse } from "../../../src/types/api-responses";

// ================================================================================== //
// Main
// ================================================================================== //
export default function ExploreScreen() {
  // ================================================================================== //
  // Hooks
  // ================================================================================== //
  const router = useRouter();
  const { 
    clinics, 
    isLoading, 
    fetchClinics, 
    fetchMoreClinics, 
    hasMore,
    selectedClinic,
    setSelectedClinic
  } = useMapStore();

  // ================================================================================== //
  // Refs
  // ================================================================================== //
  const profileSheetRef = useRef<ProfessionalProviderBottomSheetRef>(null);

  // ================================================================================== //
  // States
  // ================================================================================== //
  const [search, setSearch] = useState("");

  // ================================================================================== //
  // Effects
  // ================================================================================== //
  useEffect(() => {
    fetchClinics({ search: search });
  }, []);

  // ================================================================================== //
  // Functions
  // ================================================================================== //
  
  /**
   * Handle search query change
   */
  const handleSearch = (query: string) => {
    setSearch(query);
    fetchClinics({ search: query });
  };

  /**
   * Handle more info press
   */
  const handleMore = (clinic: ClinicProviderResponse) => {
    setSelectedClinic(clinic);
    profileSheetRef.current?.open();
  };

  /**
   * Handle reservation start
   */
  const handleReservation = (clinic?: ClinicProviderResponse) => {
    const target = clinic ?? selectedClinic;
    if (target) setSelectedClinic(target);
    profileSheetRef.current?.close();
    router.push({
      pathname: '/booking',
      params: target ? {
        providerName: target.doctorName,
        specialty: target.specialty,
        avatarUri: target.avatarUri ?? '',
        priceXCFA: String(target.priceXCFA ?? 5000),
        location: `${target.clinicName}, ${target.location}`,
      } : {},
    } as never);
  };

  /**
   * Handle infinite scroll trigger
   */
  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchMoreClinics({ search: search });
    }
  };

  // ================================================================================== //
  // Renders
  // ================================================================================== //

  const renderItem = useCallback(({ item }: { item: ClinicProviderResponse }) => (
    <ClinicCard
      key={item.id}
      data={item}
      onReserve={() => handleReservation(item)}
      onMore={() => handleMore(item)}
      onProfile={() => handleMore(item)}
    />
  ), []);

  const renderFooter = () => {
    if (!isLoading) return <View style={{ height: 20 }} />;
    return (
      <View style={styles.loaderFooter}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Aucun professionnel trouvé</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      <AppHeader 
        onSearch={() => handleSearch(search)} 
        searchBar={true} 
        searchValue={search}
      />

      {isLoading && clinics.length === 0 ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ClinicCardSkeleton />
          <ClinicCardSkeleton />
          <ClinicCardSkeleton />
        </ScrollView>
      ) : (
        <FlatList
          data={clinics}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onRefresh={() => fetchClinics({ search: search })}
          refreshing={false}
        />
      )}

      {/* Profile sheet */}
      {selectedClinic && (
        <ProfessionalProviderBottomSheet
          ref={profileSheetRef}
          provider={{
            clinicName: selectedClinic.clinicName,
            avatarUri: selectedClinic.avatarUri || "",
            specialty: selectedClinic.specialty,
            experience: "+5 Ans", // Mock or from real data if available
            language: "FR-EN",
            doctorName: selectedClinic.doctorName,
            description: selectedClinic.description || "Spécialiste de santé qualifié.",
            hoursRange: selectedClinic.hours || "08:00 - 18:00",
            hoursdays: selectedClinic.days || "Lun - Ven",
            location: selectedClinic.location,
            coverUri: selectedClinic.imageUri,
          }}
          onReservation={() => handleReservation()}
          onShowOnMap={() => {
            profileSheetRef.current?.close();
            router.push(`/home/map?clinicId=${selectedClinic.id}` as never);
          }}
          onShare={() => {}}
        />
      )}

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
    gap: 20, // Increased gap for better card separation
  },
  loaderFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.inkLight,
  },
});