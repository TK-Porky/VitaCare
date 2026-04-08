import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import MapView, { UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRouter } from 'expo-router';

import { BackButton } from '../../../src/components';
import {
  FilterBottomSheet,
  FilterBottomSheetRef,
  FilterState,
} from '../../../src/components/modals/FilterBottomSheet';
import { SearchBar } from '../../../src/components';
import { MapMarker } from '../../../src/components';
import { MapProviderCard } from '../../../src/components';
import { colors } from '../../../src/themes';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const MOCK_PROVIDERS = [
  {
    id: '1',
    name: 'Dr. Igriss Kakmo',
    avatarUri: 'https://randomuser.me/api/portraits/men/32.jpg',
    coverUri: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600',
    distanceKm: 0.9,
    priceXCFA: 5000,
    address: 'Rue Simekoa, Yaoundé',
    coordinate: { latitude: 3.848, longitude: 11.502 },
  },
  {
    id: '2',
    name: 'Dr. Kemadjo Thérèse',
    avatarUri: 'https://randomuser.me/api/portraits/women/44.jpg',
    coverUri: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600',
    distanceKm: 3.9,
    priceXCFA: 8000,
    address: 'Bastos, Yaoundé',
    coordinate: { latitude: 3.862, longitude: 11.516 },
  },
  {
    id: '3',
    name: 'Clinique Wellstar',
    avatarUri: 'https://randomuser.me/api/portraits/men/55.jpg',
    coverUri: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600',
    distanceKm: 2.1,
    priceXCFA: 15000,
    address: 'Polytech, Yaoundé',
    coordinate: { latitude: 3.855, longitude: 11.488 },
  },
];

const INITIAL_REGION = {
  latitude: 3.853,
  longitude: 11.502,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// ---------------------------------------------------------------------------

export default function MapScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_PROVIDERS[0].id);
  const filterSheetRef = useRef<FilterBottomSheetRef>(null);
  const [filters, setFilters] = useState<FilterState>({
    perimeterKm: 15,
    services: [],
    languages: [],
  });

  const providers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_PROVIDERS.filter((p) => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.address?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [search]);

  const selectedProvider = providers.find((p) => p.id === selectedId) ?? null;

  const handleMarkerPress = (id: string) => {
    if (selectedId === id) return;
    setSelectedId(id);
  };

  const handleFilterPress = () => {
    filterSheetRef.current?.open();
  };

  const handleApplyFilters = (next: FilterState) => {
    setFilters(next);
  };

  const handleReserve = () => {
    router.push(`/providers/${selectedId}/reserve` as never);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* ── Map ── */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_DEFAULT}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          tileSize={256}
        />
        {providers.map((provider) => (
          <MapMarker
            key={provider.id}
            coordinate={provider.coordinate}
            avatarUri={provider.avatarUri}
            isSelected={provider.id === selectedId}
            onPress={() => handleMarkerPress(provider.id)}
          />
        ))}
      </MapView>

      {/* ── Overlay layer — reçoit tous les events, laisse passer vers la carte ── */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">

        {/* ── Top bar ── */}
        <SafeAreaView style={styles.safeTop}>
          <View style={styles.topBar} pointerEvents="auto">
            <BackButton onPress={() => router.back()} />
            <SearchBar
              value={search}
              onChangeText={setSearch}
              onFilterPress={handleFilterPress}
              style={styles.searchBar}
            />
          </View>
        </SafeAreaView>

        {/* ── Bottom provider card ── */}
        {selectedProvider && (
          <SafeAreaView style={styles.safeBottom}>
            <View style={styles.cardWrapper} pointerEvents="auto">
              <MapProviderCard
                provider={selectedProvider}
                onReserve={handleReserve}
              />
            </View>
          </SafeAreaView>
        )}

      </View>

      {/* ── Filter BottomSheet — hors du overlay pour z-index maximal ── */}
      <FilterBottomSheet
        ref={filterSheetRef}
        initialFilters={filters}
        onApply={handleApplyFilters}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------

const TOP_BAR_PADDING =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 8;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  safeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: TOP_BAR_PADDING,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flex: 1,
  },
  safeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cardWrapper: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
});