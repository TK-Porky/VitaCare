import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize } from '../../themes';

// ─── Types ────────────────────────────────────────────────────────────────────

type Provider = {
  name: string;
  specialty: string;
  avatarUri: string;
  priceXCFA: number;
  location: string;
};

type BookingData = {
  date: Date | null;
  time: string | null;
  reason: string;
  paymentMethod: 'now' | 'later';
  paymentProvider: 'mobile_money' | 'orange_money' | 'card';
};

type Props = {
  provider: Provider;
  booking: BookingData;
  onChangeDate: () => void;
  onChange: (patch: Partial<BookingData>) => void;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_SHORT = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const PAYMENT_PROVIDERS: {
  id: BookingData['paymentProvider'];
  name: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  { id: 'mobile_money', name: 'Mobile Money', icon: 'phone-portrait-outline' },
  { id: 'orange_money', name: 'Orange Money',  icon: 'cellular-outline' },
  { id: 'card',         name: 'Carte bancaire', icon: 'card-outline' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (date: Date) =>
  `${DAYS_SHORT[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

/** Formats a number as "12 500 XCFA" — locale-independent */
const formatPrice = (n: number) => {
  const parts = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F');
  return `${parts} XCFA`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionTitle = ({ children }: { children: string }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const RadioCard = ({
  selected,
  onPress,
  title,
  subtitle,
  right,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  subtitle: string;
  right?: React.ReactNode;
}) => (
  <TouchableOpacity
    style={[styles.radioCard, selected && styles.radioCardSelected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
      {selected && <View style={styles.radioCircleInner} />}
    </View>
    <View style={styles.radioBody}>
      <Text style={[styles.radioTitle, selected && styles.radioTitleSelected]}>
        {title}
      </Text>
      <Text style={styles.radioSubtitle}>{subtitle}</Text>
    </View>
    {right}
  </TouchableOpacity>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const StepConfirm = ({ provider, booking, onChangeDate, onChange }: Props) => {
  const consultationFee = provider.priceXCFA;
  const platformFee     = Math.round(consultationFee * 0.05);
  const total           = consultationFee + platformFee;

  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Appointment summary ─────────────────────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Résumé du rendez-vous</Text>
          <TouchableOpacity onPress={onChangeDate} style={styles.editBtn} hitSlop={8}>
            <Ionicons name="create-outline" size={16} color={colors.primary} />
            <Text style={styles.editBtnText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRows}>
          {[
            {
              icon: 'calendar-outline' as const,
              value: booking.date ? formatDate(booking.date) : 'Date à sélectionner',
            },
            {
              icon: 'time-outline' as const,
              value: booking.time ?? 'Heure à sélectionner',
            },
            {
              icon: 'location-outline' as const,
              value: provider.location,
            },
          ].map(({ icon, value }) => (
            <View key={icon} style={styles.summaryRow}>
              <View style={styles.summaryIconWrap}>
                <Ionicons name={icon} size={18} color={colors.primary} />
              </View>
              <Text style={styles.summaryText}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Payment method ──────────────────────────────────────────────── */}
      <View style={[styles.section, { marginTop: 24 }]}>
        <SectionTitle>Méthode de paiement</SectionTitle>

        <View style={styles.gap12}>
          <RadioCard
            selected={booking.paymentMethod === 'now'}
            onPress={() => onChange({ paymentMethod: 'now' })}
            title="Payer maintenant"
            subtitle="Sécurisé et prioritaire"
            right={
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{formatPrice(total)}</Text>
              </View>
            }
          />
          <RadioCard
            selected={booking.paymentMethod === 'later'}
            onPress={() => onChange({ paymentMethod: 'later' })}
            title="Payer sur place"
            subtitle="Espèces ou carte à l'arrivée"
            right={
              <View style={[styles.badge, styles.badgeMuted]}>
                <Text style={styles.badgeTextMuted}>{formatPrice(total)}</Text>
              </View>
            }
          />
        </View>

        {/* Provider picker — visible only when paying now */}
        {booking.paymentMethod === 'now' && (
          <View style={styles.providerSection}>
            <Text style={styles.providerSectionLabel}>Via quel moyen ?</Text>
            <View style={styles.providerRow}>
              {PAYMENT_PROVIDERS.map((p) => {
                const active = booking.paymentProvider === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.providerChip, active && styles.providerChipSelected]}
                    onPress={() => onChange({ paymentProvider: p.id })}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={p.icon}
                      size={20}
                      color={active ? colors.primary : colors.inkMuted}
                    />
                    <Text style={[styles.providerChipText, active && styles.providerChipTextSelected]}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* ── Price breakdown ─────────────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionTitle>Détail du prix</SectionTitle>
        <View style={styles.card}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Consultation</Text>
            <Text style={styles.priceValue}>{formatPrice(consultationFee)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Frais de service (5 %)</Text>
            <Text style={styles.priceValue}>{formatPrice(platformFee)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>
      </View>

      {/* ── Cancellation policy ─────────────────────────────────────────── */}
      <View style={[styles.section, styles.policyCard]}>
        <View style={styles.policyHeader}>
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
          <Text style={styles.policyTitle}>Politique d'annulation</Text>
        </View>
        <Text style={styles.policyText}>
          Annulation gratuite jusqu'à 24h avant le rendez-vous. Passé ce délai,
          des frais de 50 % peuvent s'appliquer.
        </Text>
        <TouchableOpacity
          onPress={() => Alert.alert("Conditions d'annulation", "Texte complet des conditions…")}
          hitSlop={8}
        >
          <Text style={styles.policyLink}>Voir les conditions complètes →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { flex: 1 },

  // Layout
  section:  { marginBottom: 24 },
  gap12:    { gap: 12 },

  sectionTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    color: colors.ink,
    marginBottom: 14,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    color: colors.ink,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: colors.primary + '12',
  },
  editBtnText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },

  // Summary rows
  summaryRows: { 
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.ink,
    flex: 1,
  },

  // Radio card
  radioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  radioCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '06',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: { borderColor: colors.primary },
  radioCircleInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  radioBody:  { flex: 1 },
  radioTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.ink,
    marginBottom: 2,
  },
  radioTitleSelected: { color: colors.primary },
  radioSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkMuted,
  },

  // Badge (price pill on radio card)
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
  },
  badgeText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  badgeMuted: { backgroundColor: colors.border },
  badgeTextMuted: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.inkMuted,
  },

  // Payment providers
  providerSection: { marginTop: 16 },
  providerSectionLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  providerRow: { flexDirection: 'row', gap: 10 },
  providerChip: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  providerChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  providerChipText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  providerChipTextSelected: {
    color: colors.primary,
    fontFamily: fontFamily.semiBold,
  },

  // Price breakdown
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  priceLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.inkMuted,
  },
  priceValue: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  totalLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.ink,
  },
  totalValue: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.primary,
  },

  // Policy
  policyCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  policyTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  policyText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    lineHeight: 20,
    marginBottom: 10,
  },
  policyLink: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
});