import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors, fontFamily, fontSize } from '../../../src/themes';
import { TopBar, PrimaryButton } from '../../../src/components';
import { useProfile } from '../../../src/hooks';
import { useAuthStore } from '../../../src/store';

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function LocationScreen() {
  const user = useAuthStore((s) => s.user);
  const { updateProfile, isUpdatingProfile } = useProfile();

  const [address, setAddress] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);

  const detectLocation = useCallback(async () => {
    setIsDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Veuillez autoriser l\'accès à votre localisation dans les paramètres de l\'application.',
        );
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [geo] = await Location.reverseGeocodeAsync(pos.coords);
      if (geo) {
        const parts = [geo.street, geo.district, geo.subregion, geo.city]
          .filter(Boolean)
          .join(', ');
        setDetectedAddress(parts);
        setAddress(parts);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de détecter votre position.');
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const handleSave = async () => {
    if (!address.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir ou détecter votre adresse.');
      return;
    }
    try {
      await updateProfile({
        fullName: user?.fullName ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        location: address.trim(),
      });
      Alert.alert('Succès', 'Votre localisation a été mise à jour.');
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder la localisation.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" />
      <TopBar title="Ma localisation" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration */}
        <View style={styles.illustrationBox}>
          <Ionicons name="location" size={48} color={colors.primary} />
          <Text style={styles.illustrationTitle}>Votre adresse</Text>
          <Text style={styles.illustrationSubtitle}>
            Renseignez votre adresse pour personnaliser votre expérience
            et trouver des professionnels de santé près de chez vous.
          </Text>
        </View>

        {/* Detect button */}
        <TouchableOpacity
          style={styles.detectBtn}
          onPress={detectLocation}
          disabled={isDetecting}
          activeOpacity={0.75}
        >
          {isDetecting ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="navigate-outline" size={20} color={colors.primary} />
          )}
          <Text style={styles.detectBtnLabel}>
            {isDetecting ? 'Détection en cours…' : 'Détecter ma position automatiquement'}
          </Text>
        </TouchableOpacity>

        {/* Detected feedback */}
        {detectedAddress && (
          <View style={styles.detectedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.detectedText}>Position détectée</Text>
          </View>
        )}

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>ou saisir manuellement</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Manual input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Adresse complète</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="location-outline" size={18} color={colors.inkMuted} />
            <TextInput
              style={styles.input}
              placeholder="Quartier, Ville (ex : Bastos, Yaoundé)"
              placeholderTextColor={colors.inkMuted}
              value={address}
              onChangeText={setAddress}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Cameroon cities hint */}
        <View style={styles.hintRow}>
          <Text style={styles.hintLabel}>Villes fréquentes :</Text>
          {['Yaoundé', 'Douala', 'Bafoussam'].map((city) => (
            <TouchableOpacity
              key={city}
              style={styles.cityChip}
              onPress={() => setAddress((prev) => prev ? `${prev}, ${city}` : city)}
            >
              <Text style={styles.cityChipText}>{city}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton
          label="Enregistrer la localisation"
          fullWidth
          isLoading={isUpdatingProfile}
          onPress={handleSave}
          style={styles.saveBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  // Illustration
  illustrationBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 10,
    marginBottom: 8,
  },
  illustrationTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.ink,
  },
  illustrationSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  // Detect button
  detectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primary + '12',
    borderWidth: 1.5,
    borderColor: colors.primary + '40',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 12,
  },
  detectBtnLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },

  // Detected badge
  detectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successLight,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'center',
    marginBottom: 16,
  },
  detectedText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xs,
    color: colors.success,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkMuted,
  },

  // Input
  inputGroup: { gap: 8, marginBottom: 16 },
  inputLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.ink,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.ink,
  },

  // City chips
  hintRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  hintLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkMuted,
  },
  cityChip: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cityChipText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.ink,
  },

  saveBtn: { marginTop: 4 },
});
