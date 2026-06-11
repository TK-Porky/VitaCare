import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin } from 'lucide-react-native';
import MapView, { UrlTile, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import { TopBar, PrimaryButton, SearchInput } from '../../../src/components';
import { useProfile } from '../../../src/hooks';
import { useAuthStore } from '../../../src/store';

const INITIAL_REGION = {
  latitude: 3.848,
  longitude: 11.502,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function LocationScreen() {
  const user = useAuthStore((s) => s.user);
  const { updateProfile, isUpdatingProfile } = useProfile();

  const [location, setLocation] = useState('Recherche de votre position...');
  const [region, setRegion] = useState(INITIAL_REGION);
  const [markerCoords, setMarkerCoords] = useState({
    latitude: INITIAL_REGION.latitude,
    longitude: INITIAL_REGION.longitude,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation('Permission de localisation refusée');
        return;
      }

      const currentLoc = await Location.getCurrentPositionAsync({});
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

      const reverse = await Location.reverseGeocodeAsync({
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
      });
      if (reverse.length > 0) {
        const item = reverse[0];
        const parts = [item.street, item.district, item.city].filter(Boolean).join(', ');
        setLocation(parts || 'Position détectée');
      }
    })();
  }, []);

  const handleMapPress = useCallback(async (coords: { latitude: number; longitude: number }) => {
    setMarkerCoords(coords);
    try {
      const reverse = await Location.reverseGeocodeAsync(coords);
      if (reverse.length > 0) {
        const item = reverse[0];
        const parts = [item.street, item.district, item.city].filter(Boolean).join(', ');
        setLocation(parts || 'Position sélectionnée');
      }
    } catch {
      // keep previous location text
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await Location.geocodeAsync(searchQuery.trim());
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        setRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
        setMarkerCoords({ latitude, longitude });
        setLocation(searchQuery.trim());
      } else {
        Alert.alert('Introuvable', 'Aucun résultat pour cette adresse.');
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de géolocaliser cette adresse.');
    }
  }, [searchQuery]);

  const handleSave = async () => {
    try {
      await updateProfile({
        fullName: user?.fullName ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        location,
      });
      Alert.alert('Succès', 'Votre localisation a été mise à jour.');
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder la localisation.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <TopBar title="Ma localisation" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            placeholder="Rechercher une adresse..."
            returnKeyType="search"
          />

          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              region={region}
              onRegionChangeComplete={setRegion}
              onPress={(e) => handleMapPress(e.nativeEvent.coordinate)}
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
            label="Enregistrer la localisation"
            fullWidth
            isLoading={isUpdatingProfile}
            onPress={handleSave}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },

  mapContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customMarker: {
    width: 40,
    height: 40,
    backgroundColor: colors.white,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
  },
  locationText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.inkLight,
  },

  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
  },
});
