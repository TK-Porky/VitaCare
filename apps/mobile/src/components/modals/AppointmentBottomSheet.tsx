import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Share,
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
    { label: 'Consultation',    amount: 5000 },
    { label: 'Paiement In-app', amount: -150, isDiscount: true },
    { label: 'Prix Estimé',     amount: 5000 },
    { label: 'Taxes',           amount: 100 },
  ],
  total: 4950,
  currency: 'XCFA',
};

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; bg: string; color: string }> = {
  confirmed: { label: 'Confirmé',   bg: '#E8FFF0', color: '#1A7F3C' },
  pending:   { label: 'En attente', bg: '#FFF8ED', color: '#B45309' },
  paid:      { label: 'Payé',       bg: '#E8FFF0', color: '#1A7F3C' },
  cancelled: { label: 'Annulé',     bg: '#FFF0F0', color: '#B91C1C' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (n: number): string =>
  Math.abs(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** Generates a plain-text appointment ticket for sharing. */
function buildTicketText(appt: Appointment, currency: string): string {
  const sep = '─────────────────────────────────';
  const statusLabel = STATUS_CONFIG[appt.status].label;

  const invoiceBlock = appt.invoiceLines
    .map(l => {
      const sign   = l.isDiscount ? '-' : '';
      const amount = `${sign}${formatPrice(l.amount)} ${currency}`;
      return `${l.label.padEnd(20)}${amount.padStart(14)}`;
    })
    .join('\n');

  const totalLine = `Total${' '.repeat(15)}${formatPrice(appt.total).padStart(14)} ${currency}`;

  return [
    '╔══════════════════════════════════╗',
    '║      VITACARE — Ticket de RDV    ║',
    '╚══════════════════════════════════╝',
    '',
    `📋  ${appt.title}`,
    `✅  Statut : ${statusLabel}`,
    '',
    sep,
    `👨‍⚕️  ${appt.doctorName}`,
    `    ${appt.specialty}`,
    sep,
    '',
    '📝  Motif',
    `    ${appt.reason}`,
    '',
    '📅  Date & Heure',
    `    ${appt.dateTime}`,
    '',
    '📍  Lieu',
    `    ${appt.clinicName} ${appt.locationSuffix}`,
    '',
    '💳  Méthode de paiement',
    `    ${appt.paymentMethod}`,
    '',
    sep,
    'FACTURE',
    sep,
    invoiceBlock,
    sep,
    totalLine,
    sep,
    '',
    `Généré le ${new Date().toLocaleDateString('fr-FR')} via VitaCare`,
  ].join('\n');
}

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
    <Ionicons name={icon} size={16} color={colors.primary} />
    <View style={styles.infoRowContent}>{children}</View>
  </View>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const AppointmentDetailBottomSheet = forwardRef<AppointmentDetailBottomSheetRef, Props>(
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

    const currency   = appointment.currency ?? 'XCFA';
    const fmt        = (n: number) => `${formatPrice(n)} ${currency}`;
    const statusCfg  = STATUS_CONFIG[appointment.status];

    // ── Action handlers (always close sheet first) ───────────────────────────

    const handleReschedule = () => {
      sheetRef.current?.close();
      onReschedule?.();
    };

    const handleCancel = () => {
      Alert.alert(
        'Annuler le rendez-vous',
        'Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est irréversible.',
        [
          { text: 'Garder le RDV', style: 'cancel' },
          {
            text: 'Confirmer l\'annulation',
            style: 'destructive',
            onPress: () => {
              sheetRef.current?.close();
              onCancel?.();
            },
          },
        ],
      );
    };

    const handleBookAgain = () => {
      sheetRef.current?.close();
      onBookAgain?.();
    };

    const handleShowOnMap = () => {
      sheetRef.current?.close();
      onShowOnMap?.();
    };

    const handleDownload = async () => {
      const text = buildTicketText(appointment, currency);
      try {
        await Share.share({
          title: `${appointment.title} — VitaCare`,
          message: text,
        });
        onDownload?.();
      } catch {
        // User dismissed the share sheet — no action needed
      }
    };

    // ── Render ───────────────────────────────────────────────────────────────

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
            activeOpacity={0.75}
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

          {/* Status badge + Total */}
          <View style={styles.statusTotalRow}>
            <View
              style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}
            >
              <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
              <Text style={[styles.statusLabel, { color: statusCfg.color }]}>
                {statusCfg.label}
              </Text>
            </View>

            <View style={styles.totalBlock}>
              <Text style={styles.totalCaption}>Total estimé</Text>
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
        {appointment.clinicImageUri ? (
          <Image
            source={{ uri: appointment.clinicImageUri }}
            style={styles.clinicImage}
            resizeMode="cover"
          />
        ) : null}

        {/* Map button */}
        <GrayButton
          label="Montrer sur la Carte"
          icon="map-outline"
          onPress={handleShowOnMap}
          style={styles.mapBtn}
        />

        {/* ── Méthodes de paiements ─────────────────────────────────────── */}
        <SectionTitle>Méthodes de paiements</SectionTitle>
        <InfoRow icon="card-outline">
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
                onPress={handleReschedule}
                style={styles.mainActionBtn}
              />
              <GrayButton
                label="Annuler"
                onPress={handleCancel}
                style={styles.cancelBtn}
              />
            </>
          ) : (
            <PrimaryButton
              label="Réserver à nouveau"
              variant="solid"
              size="md"
              onPress={handleBookAgain}
              style={styles.mainActionBtn}
            />
          )}

          <GrayButton
            label=""
            icon="download-outline"
            onPress={handleDownload}
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

  // ── Title ──
  visitTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
    color: colors.ink,
    marginTop: 4,
    marginBottom: 20,
    letterSpacing: -0.3,
  },

  // ── Doctor & Status Card ──
  doctorStatusCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },

  // Doctor row
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.border,
  },
  doctorInfo: {
    flex: 1,
    gap: 3,
  },
  doctorName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    color: colors.ink,
  },
  specialty: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkMuted,
  },

  // Status + Total
  statusTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
  },
  totalBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  totalCaption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.inkMuted,
  },
  totalValue: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.primary,
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },

  // ── Section title ──
  sectionTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 20,
    marginBottom: 10,
  },

  // ── Body text ──
  bodyText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.ink,
    lineHeight: 22,
  },
  boldInline: {
    fontFamily: fontFamily.semiBold,
    color: colors.ink,
  },

  // ── Info row ──
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 6,
  },
  infoRowContent: {
    flex: 1,
  },

  // ── Clinic image ──
  clinicImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginTop: 14,
    backgroundColor: colors.border,
  },

  // ── Map button ──
  mapBtn: {
    marginTop: 12,
    borderRadius: 12,
  },

  // ── Invoice ──
  invoiceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  invoiceLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.inkMuted,
  },
  invoiceAmount: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.ink,
  },
  invoiceAmountDiscount: {
    color: colors.primary,
    fontFamily: fontFamily.semiBold,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLineLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    color: colors.ink,
  },
  totalLineAmount: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    color: colors.primary,
  },

  // ── Actions ──
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
    marginBottom: 8,
  },
  mainActionBtn: {
    flex: 1,
  },
  cancelBtn: {
    flex: 1,
  },
  downloadBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});
