import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../src/components/buttons';
import { colors, fontFamily, fontSize } from '../../../src/themes';

export default function BookingSuccessScreen() {
  const router = useRouter();

  const {
    doctorName = 'Dr. Igriss Kakmo',
    specialty = 'Génycologue',
    avatarUri = 'https://randomuser.me/api/portraits/men/75.jpg',
    date = 'Jeudi, 26 Mars 2026',
    time = '12h00',
    paymentLabel = 'Paiement à la consultation',
    location = 'Clinique Wellstar\nBastos, Yaoundé',
  } = useLocalSearchParams<{
    doctorName?: string;
    specialty?: string;
    avatarUri?: string;
    date?: string;
    time?: string;
    paymentLabel?: string;
    location?: string;
  }>();

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.content}>
        {/* ── Illustration / icon ── */}
        <View style={styles.iconWrapper}>
          <Ionicons name="checkmark-circle" size={72} color={colors.primary} />
        </View>

        {/* ── Title ── */}
        <Text style={styles.title}>Félicitations !</Text>
        <Text style={styles.subtitle}>Votre réservation a été envoyé !</Text>

        {/* ── Summary card ── */}
        <View style={styles.card}>
          {/* Doctor row */}
          <View style={styles.doctorRow}>
            <Image source={{ uri: avatarUri as string }} style={styles.avatar} />
            <View>
              <Text style={styles.doctorName}>{doctorName}</Text>
              <Text style={styles.doctorSpecialty}>{specialty}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Date */}
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.inkMuted} />
            <Text style={styles.infoText}>
              {date} à {time}
            </Text>
          </View>

          <View style={styles.cardDivider} />

          {/* Payment */}
          <Text style={styles.infoText}>{paymentLabel}</Text>

          <View style={styles.cardDivider} />

          {/* Location */}
          <Text style={styles.infoText}>{(location as string).replace('\\n', '\n')}</Text>
        </View>
      </View>

      {/* ── CTA ── */}
      <View style={styles.footer}>
        <PrimaryButton
          label="Voir mes réservations"
          variant="solid"
          size="md"
          onPress={() => router.replace('/reservations' as never)}
          style={styles.cta}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconWrapper: {
    marginBottom: 16,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['3xl'],
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.inkMuted,
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 4,
  },

  // Card
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border,
  },
  doctorName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    color: colors.ink,
  },
  doctorSpecialty: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkMuted,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    lineHeight: 20,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },
  cta: {
    width: '100%',
  },
});