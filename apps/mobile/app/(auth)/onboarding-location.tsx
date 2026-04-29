import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { MapPin, Search } from 'lucide-react-native';
import MapView, { UrlTile, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { StepHeader, SearchInput, PrimaryButton } from '../../src/components';
import { colors, fontFamily, fontSize } from '../../src/themes';

const INITIAL_REGION = {
  latitude: 3.848,
  longitude: 11.502,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function OnboardingLocationScreen() {
  const [location, setLocation] = useState('Recherche de votre position...');
  const [region, setRegion] = useState(INITIAL_REGION);
  const [markerCoords, setMarkerCoords] = useState({
    latitude: INITIAL_REGION.latitude,
    longitude: INITIAL_REGION.longitude,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation('Permission de localisation refusée');
        return;
      }

      let currentLoc = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      setMarkerCoords({
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
      });

      // Reverse geocoding to get address
      let reverse = await Location.reverseGeocodeAsync({
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
      });
      if (reverse.length > 0) {
        const item = reverse[0];
        setLocation(`${item.street || ''} ${item.name || ''}, ${item.city || ''}`);
      }
    })();
  }, []);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/(auth)/onboarding-search');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeSearchQuery = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <View style={styles.root}>
      <StepHeader
        current={1}
        total={2}
        onSkip={() => router.push('/(auth)/onboarding-search')}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Indiquer votre position</Text>
          <Text style={styles.subtitle}>
            Les recherches s'effectueront dans un périmètre de 15km, ajustable plus tard
          </Text>
        </View>

        <SearchInput
          value={searchQuery}
          onChangeText={handleChangeSearchQuery}
          placeholder="Rechercher votre position..."
        />

        {/* Map Container */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            region={region}
            onRegionChangeComplete={setRegion}
            onPress={(e) => setMarkerCoords(e.nativeEvent.coordinate)}
            onMapReady={() => setIsMapReady(true)}
          >
            <UrlTile
              urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
              tileSize={256}
            />
            <Marker coordinate={markerCoords}>
              <View style={styles.customMarker}>
                <MapPin size={24} color={colors.primary} fill={colors.white} />
              </View>
            </Marker>
          </MapView>
          {!isMapReady && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.locationRow} activeOpacity={0.7}>
          <MapPin size={16} color={colors.inkMuted} />
          <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Continuer"
          fullWidth
          isLoading={isLoading}
          onPress={handleContinue}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    height: '100%',
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.inkLight,
    lineHeight: 18,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 280,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  locationText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.inkLight,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
});