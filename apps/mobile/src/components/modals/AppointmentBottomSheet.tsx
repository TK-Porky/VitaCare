import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppBottomSheet, AppBottomSheetRef } from '../generics';
import { PrimaryButton } from '../buttons';
import { GrayButton } from '../buttons/GrayButton';
import { colors, fontFamily, fontSize } from '../../../src/themes';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppointmentStatus = 'confirmed' | 'pending' | 'paid' | 'cancelled';

type InvoiceLine = {
  label: string;
  amount: number;
  isDiscount?: boolean;
};

type Appointment = {
  title: string;
  doctorName: string;
  doctorAvatarUri: string;
  specialty: string;
  status: AppointmentStatus;
  reason: string;
  dateTime: string;
  clinicName: string;
  locationSuffix: string;
  clinicImageUri?: string;
  paymentMethod: string;
  invoiceLines: InvoiceLine[];
  total: number;
  currency?: string;
};

export type AppointmentDetailBottomSheetRef = {
  open: () => void;
  close: () => void;
};

type ActionVariant = 'reschedule' | 'book_again';

type Props = {
  appointment?: Appointment;
  actionVariant?: ActionVariant;
  onReschedule?: () => void;
  onCancel?: () => void;
  onBookAgain?: () => void;
  onDownload?: () => void;
  onShowOnMap?: () => void;
  onDoctorPress?: () => void;
  onClose?: () => void;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_APPOINTMENT: Appointment = {
  title: 'Visite 002',
  doctorName: 'Dr. Igriss Kakmo',
  doctorAvatarUri: 'https://randomuser.me/api/portraits/men/75.jpg',
  specialty: 'Gynécologue',
  status: 'confirmed',
  reason: 'Démangeaison récurrente au niveau des parties génitales.',
  dateTime: '25 Mars 2026 de 12:00 à 13:00',
  clinicName: 'Clinique Wellstar',
  locationSuffix: 'situé à Bastos, Yaoundé',
  clinicImageUri:
    'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600',
  paymentMethod: 'Payer à la consultation',
  invoiceLines: [
    { label: 'Consultation',  amount: 5000 },
    { label: 'Paiement In-app', amount: -150, isDiscount: true },
    { label: 'Prix Estimé',   amount: 5000 },
    { label: 'Taxes',         amount: 100  },
  ],
  total: 4950,
  currency: 'XCFA',
};

const STATUS_CONFIG: Record<AppointmentStatus,{ label: string; color: string }> = {
  confirmed: { label: 'Confirmé',   color: '#1A7F3C' },
  pending:   { label: 'En attente', color: '#B45309' },
  paid:      { label: 'Payé',       color: '#1A7F3C' },
  cancelled: { label: 'Annulé',     color: '#B91C1C' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (n: number): string =>
  Math.abs(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F');

// ─── Sub-components ───────────────────────────────────────────────────────────

const Divider = () => <View style={styles.divider} />;

const SectionTitle = ({ children }: { children: string }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const InfoRow = ({
  icon,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={16} color={colors.inkMuted} />
    <View style={styles.infoRowContent}>{children}</View>
  </View>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const AppointmentDetailBottomSheet = forwardRef<AppointmentDetailBottomSheetRef,Props>(
  (
    {
      appointment = DEFAULT_APPOINTMENT,
      actionVariant = 'reschedule',
      onReschedule,
      onCancel,
      onBookAgain,
      onDownload,
      onShowOnMap,
      onDoctorPress,
      onClose,
    },
    ref,
  ) => {
    const sheetRef = useRef<AppBottomSheetRef>(null);

    useImperativeHandle(ref, () => ({
      open:  () => sheetRef.current?.open(),
      close: () => sheetRef.current?.close(),
    }));

    const currency = appointment.currency ?? 'XCFA';
    const fmt = (n: number) =>
      `${formatPrice(n)} ${currency}`;

    const statusCfg = STATUS_CONFIG[appointment.status];

    return (
      <AppBottomSheet
        ref={sheetRef}
        snapPoints={['60%', '95%']}
        onClose={onClose}
        scrollable
        containerStyle={styles.sheet}
      >
        {/* ── Title ─────────────────────────────────────────────────────── */}
        <Text style={styles.visitTitle}>{appointment.title}</Text>

        {/* ── Doctor & Status Card ─────────────────────────────────────── */}
        <View style={styles.doctorStatusCard}>
          {/* Doctor row */}
          <TouchableOpacity
            style={styles.doctorRow}
            onPress={onDoctorPress}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: appointment.doctorAvatarUri }}
              style={styles.avatar}
            />
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{appointment.doctorName}</Text>
              <Text style={styles.specialty}>{appointment.specialty}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
          </TouchableOpacity>

          <View style={styles.cardDivider} />

          {/* Status + Total */}
          <View style={styles.statusTotalRow}>
            <View>
              <Text style={styles.metaLabel}>Statut</Text>
              <Text style={[styles.statusValue, { color: statusCfg.color }]}>
                {statusCfg.label}
              </Text>
            </View>
            <View style={styles.totalBlock}>
              <Text style={styles.metaLabel}>Total</Text>
              <Text style={styles.totalValue}>{fmt(appointment.total)}</Text>
            </View>
          </View>
        </View>

        {/* ── Motif ─────────────────────────────────────────────────────── */}
        <SectionTitle>Motif</SectionTitle>
        <Text style={styles.bodyText}>{appointment.reason}</Text>

        {/* ── Date & Heure ──────────────────────────────────────────────── */}
        <SectionTitle>Date & Heure</SectionTitle>
        <InfoRow icon="calendar-outline">
          <Text style={styles.bodyText}>{appointment.dateTime}</Text>
        </InfoRow>

        {/* ── Lieux ─────────────────────────────────────────────────────── */}
        <SectionTitle>Lieux</SectionTitle>
        <InfoRow icon="location-outline">
          <Text style={styles.bodyText}>
            <Text style={styles.boldInline}>{appointment.clinicName}</Text>
            {` ${appointment.locationSuffix}`}
          </Text>
        </InfoRow>

        {/* Clinic image */}
        {appointment.clinicImageUri && (
          <Image
            source={{ uri: appointment.clinicImageUri }}
            style={styles.clinicImage}
            resizeMode="cover"
          />
        )}

        {/* Map button */}
        <GrayButton
          label="Montrer sur la Carte"
          icon="map-outline"
          onPress={onShowOnMap}
          style={styles.mapBtn}
        />

        {/* ── Méthodes de paiements ─────────────────────────────────────── */}
        <SectionTitle>Méthodes de paiements</SectionTitle>
        <InfoRow icon="person-circle-outline">
          <Text style={styles.bodyText}>{appointment.paymentMethod}</Text>
        </InfoRow>

        <Divider />

        {/* ── Facture ───────────────────────────────────────────────────── */}
        <SectionTitle>Facture</SectionTitle>

        {appointment.invoiceLines.map((line) => (
          <View key={line.label} style={styles.invoiceLine}>
            <Text style={styles.invoiceLabel}>{line.label}</Text>
            <Text
              style={[
                styles.invoiceAmount,
                line.isDiscount && styles.invoiceAmountDiscount,
              ]}
            >
              {line.isDiscount
                ? `-${formatPrice(line.amount)} ${currency}`
                : fmt(line.amount)}
            </Text>
          </View>
        ))}

        <View style={styles.totalLine}>
          <Text style={styles.totalLineLabel}>Total</Text>
          <Text style={styles.totalLineAmount}>{fmt(appointment.total)}</Text>
        </View>

        {/* ── Footer actions ────────────────────────────────────────────── */}
        <View style={styles.actionsRow}>
          {actionVariant === 'reschedule' ? (
            <>
              <PrimaryButton
                label="Réprogrammer"
                variant="solid"
                size="md"
                onPress={onReschedule}
                style={styles.rescheduleBtn}
              />

              <GrayButton
                label="Annuler"
                onPress={onCancel}
                style={styles.cancelBtn}
              />
            </>
          ) : (
            <PrimaryButton
              label="Réserver à nouveau"
              variant="solid"
              size="md"
              onPress={onBookAgain}
              style={styles.bookAgainBtn}
            />
          )}

          <GrayButton
            label=""
            icon="download-outline"
            onPress={onDownload}
            style={styles.downloadBtn}
          />
        </View>

      </AppBottomSheet>
    );
  },
);

AppointmentDetailBottomSheet.displayName = 'AppointmentDetailBottomSheet';

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: 20,
  },

  // Title
  visitTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
    color: colors.ink,
    marginTop: 4,
    marginBottom: 16,
  },

  // Doctor & Status Card
  doctorStatusCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },

  // Doctor row
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.border,
  },
  doctorInfo: {
    flex: 1,
    gap: 2,
  },
  doctorName: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.ink,
  },
  specialty: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkMuted,
  },

  // Status + Total
  statusTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  metaLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkMuted,
    marginBottom: 2,
  },
  statusValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
  },
  totalBlock: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.ink,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },

  // Section title
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.ink,
    marginBottom: 10,
  },

  // Body text
  bodyText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    lineHeight: 20,
  },
  boldInline: {
    fontFamily: fontFamily.semiBold,
    color: colors.ink,
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  infoRowContent: {
    flex: 1,
  },

  // Clinic image
  clinicImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 16,
    backgroundColor: colors.border,
  },

  // Map button
  mapBtn: {
    marginTop: 16,
  },

  // Invoice
  invoiceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkMuted,
  },
  invoiceAmount: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkMuted,
  },
  invoiceAmountDiscount: {
    color: colors.inkMuted,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLineLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  totalLineAmount: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: '#1A7F3C',
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
    marginBottom: 16,
  },
  rescheduleBtn: {
    minWidth: 100,
  },
  cancelBtn: {
    flex: 1,
  },
  bookAgainBtn: {
    flex: 1,
  },
  downloadBtn: {
    width: 48,
  },
});