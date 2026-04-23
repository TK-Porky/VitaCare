import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
  } from 'react';
  import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Platform,
  } from 'react-native';
  import { Ionicons } from '@expo/vector-icons';
  import { AppBottomSheet, AppBottomSheetRef } from '../generics';
  import { colors, fontFamily, fontSize } from '../../../src/themes';
  
  // ---------------------------------------------------------------------------
  // Types
  // ---------------------------------------------------------------------------
  
  export type AppointmentStatus = 'confirmed' | 'pending' | 'paid' | 'cancelled';
  
  type InvoiceLine = {
    label: string;
    amount: number;
    isDiscount?: boolean;
  };
  
  type Appointment = {
    /** e.g. "Visite 002" */
    title: string;
    doctorName: string;
    doctorAvatarUri: string;
    specialty: string;
    status: AppointmentStatus;
    /** Motif / reason for the visit */
    reason: string;
    /** Full date-time string, e.g. "25 Mars 2026 de 12:00 à 13:00" */
    dateTime: string;
    /** Clinic name displayed in bold inside the location line */
    clinicName: string;
    /** Full location description after the clinic name */
    locationSuffix: string;
    clinicImageUri?: string;
    /** Payment method label, e.g. "Payer à la consultation" */
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
    /** Which CTA variant to display */
    actionVariant?: ActionVariant;
    onReschedule?: () => void;
    onCancel?: () => void;
    onBookAgain?: () => void;
    onDownload?: () => void;
    onShowOnMap?: () => void;
    onDoctorPress?: () => void;
    onClose?: () => void;
  };
  
  // ---------------------------------------------------------------------------
  // Default data (mirrors the design screenshot)
  // ---------------------------------------------------------------------------
  
  const DEFAULT_APPOINTMENT: Appointment = {
    title: 'Visite 002',
    doctorName: 'Dr. Igriss Kakmo',
    doctorAvatarUri: 'https://randomuser.me/api/portraits/men/75.jpg',
    specialty: 'Génycologue',
    status: 'confirmed',
    reason:
      'Démangeaison récurrente au niveau des parties génitales.',
    dateTime: '25 Mars 2026 de 12:00 à 13:00',
    clinicName: 'Clinique Wellstar',
    locationSuffix: 'situé à Bastos, Yaoundé',
    clinicImageUri:
      'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600',
    paymentMethod: 'Payer à la consultation',
    invoiceLines: [
      { label: 'Consultation', amount: 5000 },
      { label: 'Paiement In-app', amount: -150, isDiscount: true },
      { label: 'Prix Estimé', amount: 5000 },
      { label: 'Taxes', amount: 100 },
    ],
    total: 4950,
    currency: 'XCFA',
  };
  
  // ---------------------------------------------------------------------------
  // Status badge config
  // ---------------------------------------------------------------------------
  
  const STATUS_CONFIG: Record<
    AppointmentStatus,
    { label: string; bg: string; color: string }
  > = {
    confirmed: { label: 'Confirmé', bg: '#E6F9EE', color: '#1A7F3C' },
    pending:   { label: 'En attente', bg: '#FFF4E5', color: '#B45309' },
    paid:      { label: 'Payé', bg: '#E6F9EE', color: '#1A7F3C' },
    cancelled: { label: 'Annulé', bg: '#FEE2E2', color: '#B91C1C' },
  };
  
  // ---------------------------------------------------------------------------
  // Sub-components
  // ---------------------------------------------------------------------------
  
  const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
    const cfg = STATUS_CONFIG[status];
    return (
      <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
        <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    );
  };
  
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
  
  const Divider = () => <View style={styles.divider} />;
  
  // ---------------------------------------------------------------------------
  // Main component
  // ---------------------------------------------------------------------------
  
  export const AppointmentDetailBottomSheet = forwardRef<
    AppointmentDetailBottomSheetRef,
    Props
  >(
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
        open: () => sheetRef.current?.open(),
        close: () => sheetRef.current?.close(),
      }));
  
      const currency = appointment.currency ?? 'XCFA';
  
      const formatAmount = (amount: number) =>
        `${Math.abs(amount).toLocaleString('fr-FR')} ${currency}`;
  
      return (
        <AppBottomSheet
          ref={sheetRef}
          snapPoints={['60%', '95%']}
          onClose={onClose}
          scrollable
          containerStyle={styles.sheet}
        >
          {/* ── Visit title ── */}
          <Text style={styles.visitTitle}>{appointment.title}</Text>
  
          {/* ── Doctor row ── */}
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
  
          {/* ── Status + Total row ── */}
          <View style={styles.statusTotalRow}>
            <View>
              <Text style={styles.metaLabel}>Statut</Text>
              <StatusBadge status={appointment.status} />
            </View>
            <View style={styles.totalBlock}>
              <Text style={styles.metaLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatAmount(appointment.total)}
              </Text>
            </View>
          </View>
  
          <Divider />
  
          {/* ── Motif ── */}
          <SectionTitle>Motif</SectionTitle>
          <Text style={styles.bodyText}>{appointment.reason}</Text>
  
          <Divider />
  
          {/* ── Date & Heure ── */}
          <SectionTitle>Date & Heure</SectionTitle>
          <InfoRow icon="calendar-outline">
            <Text style={styles.bodyText}>{appointment.dateTime}</Text>
          </InfoRow>
  
          <Divider />
  
          {/* ── Lieu ── */}
          <SectionTitle>Lieux</SectionTitle>
          <InfoRow icon="location-outline">
            <Text style={styles.bodyText}>
              <Text style={styles.clinicNameInline}>{appointment.clinicName}</Text>
              {` ${appointment.locationSuffix}`}
            </Text>
          </InfoRow>
  
          {/* ── Clinic image ── */}
          {appointment.clinicImageUri && (
            <Image
              source={{ uri: appointment.clinicImageUri }}
              style={styles.clinicImage}
              resizeMode="cover"
            />
          )}
  
          {/* ── Show on map ── */}
          <TouchableOpacity style={styles.mapBtn} onPress={onShowOnMap}>
            <Ionicons name="map-outline" size={18} color={colors.ink} />
            <Text style={styles.mapBtnText}>Montrer sur la Carte</Text>
          </TouchableOpacity>
  
          <Divider />
  
          {/* ── Méthodes de paiement ── */}
          <SectionTitle>Méthodes de paiements</SectionTitle>
          <View style={styles.paymentMethodRow}>
            <Ionicons name="card-outline" size={20} color={colors.inkMuted} />
            <Text style={styles.paymentMethodText}>{appointment.paymentMethod}</Text>
          </View>
  
          <Divider />
  
          {/* ── Facture ── */}
          <SectionTitle>Facture</SectionTitle>
          {appointment.invoiceLines.map((line, index) => (
            <View key={index} style={styles.invoiceLine}>
              <Text
                style={[
                  styles.invoiceLabel,
                  line.isDiscount && styles.invoiceLabelDiscount,
                ]}
              >
                {line.label}
              </Text>
              <Text
                style={[
                  styles.invoiceAmount,
                  line.isDiscount && styles.invoiceAmountDiscount,
                ]}
              >
                {line.isDiscount ? `-${formatAmount(line.amount)}` : formatAmount(line.amount)}
              </Text>
            </View>
          ))}
  
          {/* Total line */}
          <View style={[styles.invoiceLine, styles.totalLine]}>
            <Text style={styles.totalLineLabel}>Total</Text>
            <Text style={styles.totalLineAmount}>{formatAmount(appointment.total)}</Text>
          </View>
  
          {/* ── Action buttons ── */}
          <View style={styles.actionsRow}>
            {actionVariant === 'reschedule' ? (
              <>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={onReschedule}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryActionText}>Réprogrammer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.outlineActionBtn}
                  onPress={onCancel}
                  activeOpacity={0.8}
                >
                  <Text style={styles.outlineActionText}>Annuler</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.outlineActionBtnFull}
                onPress={onBookAgain}
                activeOpacity={0.8}
              >
                <Text style={styles.outlineActionText}>Réserver à nouveau</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.downloadBtn} onPress={onDownload}>
              <Ionicons name="download-outline" size={20} color={colors.ink} />
            </TouchableOpacity>
          </View>
        </AppBottomSheet>
      );
    },
  );
  
  AppointmentDetailBottomSheet.displayName = 'AppointmentDetailBottomSheet';
  
  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------
  
  const styles = StyleSheet.create({
    sheet: {
      paddingHorizontal: 20,
    },
  
    // Visit title
    visitTitle: {
      fontFamily: fontFamily.bold,
      fontSize: fontSize['2xl'],
      color: colors.ink,
      marginBottom: 16,
      marginTop: 4,
    },
  
    // Doctor row
    doctorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
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
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    metaLabel: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.xs,
      color: colors.inkMuted,
      marginBottom: 4,
    },
    totalBlock: {
      alignItems: 'flex-end',
    },
    totalValue: {
      fontFamily: fontFamily.semiBold,
      fontSize: fontSize.sm,
      color: colors.ink,
    },
  
    // Badge
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 100,
    },
    badgeText: {
      fontFamily: fontFamily.medium,
      fontSize: fontSize.xs,
    },
  
    // Divider
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },
  
    // Section title
    sectionTitle: {
      fontFamily: fontFamily.semiBold,
      fontSize: fontSize.sm,
      color: colors.ink,
      marginBottom: 8,
    },
  
    // Body text
    bodyText: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.sm,
      color: colors.inkMuted,
      lineHeight: 20,
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
  
    // Clinic name inline bold
    clinicNameInline: {
      fontFamily: fontFamily.semiBold,
      color: colors.ink,
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
    },
    mapBtnText: {
      fontFamily: fontFamily.medium,
      fontSize: fontSize.sm,
      color: colors.ink,
    },
  
    // Payment method
    paymentMethodRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 4,
    },
    paymentMethodText: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.sm,
      color: colors.inkMuted,
    },
  
    // Invoice
    invoiceLine: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
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
    invoiceLabelDiscount: {
      color: colors.inkMuted,
    },
    invoiceAmountDiscount: {
      color: colors.inkMuted,
    },
    totalLine: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    totalLineLabel: {
      fontFamily: fontFamily.semiBold,
      fontSize: fontSize.sm,
      color: colors.ink,
    },
    totalLineAmount: {
      fontFamily: fontFamily.bold,
      fontSize: fontSize.sm,
      color: '#1A7F3C', // green accent matching the design
    },
  
    // Action buttons
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 24,
      marginBottom: Platform.OS === 'ios' ? 32 : 16,
    },
    primaryActionBtn: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      backgroundColor: '#AAEE44', // lime green from the design
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryActionText: {
      fontFamily: fontFamily.semiBold,
      fontSize: fontSize.sm,
      color: '#1A1A1A',
    },
    outlineActionBtn: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    outlineActionBtnFull: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    outlineActionText: {
      fontFamily: fontFamily.medium,
      fontSize: fontSize.sm,
      color: colors.ink,
    },
    downloadBtn: {
      width: 48,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });