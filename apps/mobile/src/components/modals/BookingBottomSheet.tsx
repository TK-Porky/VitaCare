import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
    useCallback,
  } from 'react';
  import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
  } from 'react-native';
  import { Ionicons } from '@expo/vector-icons';
  import { useRouter } from 'expo-router';
  import { AppBottomSheet, AppBottomSheetRef } from '../generics';
  import { PrimaryButton } from '../buttons';
  import { colors, fontFamily, fontSize } from '../../../src/themes';
  
  // ---------------------------------------------------------------------------
  // Types
  // ---------------------------------------------------------------------------
  
  export type BookingData = {
    date: Date | null;
    time: string | null; // "12:00"
    reason: string;
    paymentMethod: 'now' | 'later';
    paymentProvider: 'mobile_money' | 'orange_money' | 'card';
  };
  
  type Provider = {
    name: string;
    specialty: string;
    avatarUri: string;
    priceXCFA: number;
    location: string;
  };
  
  export type BookingBottomSheetRef = {
    open: () => void;
    close: () => void;
  };
  
  type Props = {
    provider?: Provider;
    onClose?: () => void;
  };
  
  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------
  
  const DEFAULT_PROVIDER: Provider = {
    name: 'Dr. Igriss Kakmo',
    specialty: 'Génycologue',
    avatarUri: 'https://randomuser.me/api/portraits/men/75.jpg',
    priceXCFA: 5000,
    location: 'Clinique Wellstar, Bastos, Yaoundé',
  };
  
  const DEFAULT_BOOKING: BookingData = {
    date: null,
    time: null,
    reason: '',
    paymentMethod: 'now',
    paymentProvider: 'mobile_money',
  };
  
  const DAYS_SHORT = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
  const MONTHS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];
  
  const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
  
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  
  const formatDate = (date: Date) =>
    `${DAYS_SHORT[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  
  const formatPrice = (n: number) =>
    n.toLocaleString('fr-FR').replace(/\s/g, ' ') + ' XCFA';
  
  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();
  
  // ---------------------------------------------------------------------------
  // Sub-components shared across steps
  // ---------------------------------------------------------------------------
  
  const ProviderHeader = ({ provider, date, time }: {
    provider: Provider;
    date: Date | null;
    time: string | null;
  }) => (
    <View style={styles.providerHeader}>
      <Image source={{ uri: provider.avatarUri }} style={styles.providerAvatar} />
      <View style={styles.providerInfo}>
        <Text style={styles.providerName}>{provider.name}</Text>
        <Text style={styles.providerSpecialty}>{provider.specialty}</Text>
        {date && (
          <View style={styles.providerMeta}>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={13} color={colors.inkMuted} />
              <Text style={styles.metaText}>{formatDate(date)}</Text>
            </View>
            {time && (
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={13} color={colors.inkMuted} />
                <Text style={styles.metaText}>A partir de {time}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
  
  const StepLabel = ({ number, label }: { number: number; label: string }) => (
    <View style={styles.stepLabelRow}>
      <View style={styles.stepNumberBadge}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <Text style={styles.stepLabelText}>{label}</Text>
    </View>
  );
  
  const ProgressBar = ({ step, total }: { step: number; total: number }) => (
    <View style={styles.progressBarTrack}>
      <View style={[styles.progressBarFill, { width: `${(step / total) * 100}%` }]} />
    </View>
  );
  
  // ---------------------------------------------------------------------------
  // Step 1 — Date picker
  // ---------------------------------------------------------------------------
  
  const StepDate = ({
    selected,
    onSelect,
  }: {
    selected: Date | null;
    onSelect: (d: Date) => void;
  }) => {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
  
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const cells: (number | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
  
    const prevMonth = () => {
      if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
      else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
      if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
      else setViewMonth(m => m + 1);
    };
  
    const isSelected = (day: number) =>
      selected?.getDate() === day &&
      selected?.getMonth() === viewMonth &&
      selected?.getFullYear() === viewYear;
  
    const isPast = (day: number) => {
      const d = new Date(viewYear, viewMonth, day);
      d.setHours(0, 0, 0, 0);
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      return d < t;
    };
  
    return (
      <View>
        <StepLabel number={1} label="Choisissez la date" />
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn}>
            <Ionicons name="chevron-back" size={18} color={colors.ink} />
          </TouchableOpacity>
          <Text style={styles.calMonthLabel}>
            {MONTHS[viewMonth]} {viewYear}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn}>
            <Ionicons name="chevron-forward" size={18} color={colors.ink} />
          </TouchableOpacity>
        </View>
  
        {/* Day headers */}
        <View style={styles.calDayHeaders}>
          {DAYS_SHORT.map(d => (
            <Text key={d} style={styles.calDayHeader}>{d}</Text>
          ))}
        </View>
  
        {/* Day cells */}
        <View style={styles.calGrid}>
          {cells.map((day, i) => {
            if (!day) return <View key={`empty-${i}`} style={styles.calCell} />;
            const past = isPast(day);
            const sel = isSelected(day);
            return (
              <TouchableOpacity
                key={day}
                style={[styles.calCell, sel && styles.calCellSelected]}
                onPress={() => !past && onSelect(new Date(viewYear, viewMonth, day))}
                disabled={past}
              >
                <Text style={[
                  styles.calCellText,
                  past && styles.calCellTextPast,
                  sel && styles.calCellTextSelected,
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };
  
  // ---------------------------------------------------------------------------
  // Step 2 — Time picker (drum-style scroll)
  // ---------------------------------------------------------------------------
  
  const StepTime = ({
    selected,
    onSelect,
  }: {
    selected: string | null;
    onSelect: (t: string) => void;
  }) => {
    const [hour, setHour] = useState(12);
    const [minute, setMinute] = useState(0);
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  
    const minutes = [0, 15, 30, 45];
  
    const handleConfirm = () => {
      const h24 = period === 'PM' && hour !== 12 ? hour + 12 : period === 'AM' && hour === 12 ? 0 : hour;
      const mm = String(minute).padStart(2, '0');
      const hh = String(h24).padStart(2, '0');
      onSelect(`${hh}:${mm}`);
    };
  
    return (
      <View>
        <StepLabel number={2} label="Choisissez l'heure" />
        <View style={styles.clockContainer}>
          {/* Clock face */}
          <View style={styles.clockFace}>
            {/* Selector line */}
            <View style={styles.clockSelectorLine} />
            {/* Hour numbers arranged in a circle */}
            {HOURS.map((h, i) => {
              const angle = ((i - 2) * 30 * Math.PI) / 180;
              const r = 90;
              const cx = 110;
              const cy = 110;
              const x = cx + r * Math.cos(angle) - 16;
              const y = cy + r * Math.sin(angle) - 16;
              const sel = hour === h;
              return (
                <TouchableOpacity
                  key={h}
                  style={[styles.clockHour, { left: x, top: y }, sel && styles.clockHourSelected]}
                  onPress={() => { setHour(h); handleConfirm(); }}
                >
                  <Text style={[styles.clockHourText, sel && styles.clockHourTextSelected]}>{h}</Text>
                </TouchableOpacity>
              );
            })}
            {/* Center dot */}
            <View style={styles.clockCenter} />
          </View>
  
          {/* Right side: minutes + AM/PM */}
          <View style={styles.clockControls}>
            <Text style={styles.clockControlLabel}>Minutes</Text>
            {minutes.map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.clockMinuteBtn, minute === m && styles.clockMinuteBtnSelected]}
                onPress={() => { setMinute(m); handleConfirm(); }}
              >
                <Text style={[styles.clockMinuteText, minute === m && styles.clockMinuteTextSelected]}>
                  :{String(m).padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.clockPeriodRow}>
              {(['AM', 'PM'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.clockPeriodBtn, period === p && styles.clockPeriodBtnSelected]}
                  onPress={() => { setPeriod(p); handleConfirm(); }}
                >
                  <Text style={[styles.clockPeriodText, period === p && styles.clockPeriodTextSelected]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
  
        {/* Selected time display */}
        <View style={styles.timeDisplay}>
          <Text style={styles.timeDisplayText}>
            {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')} {period}
          </Text>
        </View>
      </View>
    );
  };
  
  // ---------------------------------------------------------------------------
  // Step 3 — Reason
  // ---------------------------------------------------------------------------
  
  const MAX_CHARS = 500;
  
  const StepReason = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (t: string) => void;
  }) => (
    <View>
      <StepLabel number={3} label="Entrez le motif" />
      <View style={styles.textareaWrapper}>
        <TextInput
          style={styles.textarea}
          placeholder="Entrer votre motif ici"
          placeholderTextColor={colors.inkFaint}
          multiline
          maxLength={MAX_CHARS}
          value={value}
          onChangeText={onChange}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{MAX_CHARS - value.length} Caractères Restants</Text>
      </View>
    </View>
  );
  
  // ---------------------------------------------------------------------------
  // Step 4 — Confirmation + payment
  // ---------------------------------------------------------------------------
  
  const RadioOption = ({
    selected,
    onPress,
    children,
    highlighted,
  }: {
    selected: boolean;
    onPress: () => void;
    children: React.ReactNode;
    highlighted?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.radioOption, selected && styles.radioOptionSelected, highlighted && selected && styles.radioOptionHighlighted]}
      onPress={onPress}
    >
      <View style={styles.radioOptionContent}>{children}</View>
      <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
  
  const StepConfirm = ({
    provider,
    booking,
    onChangeDate,
    onChange,
  }: {
    provider: Provider;
    booking: BookingData;
    onChangeDate: () => void;
    onChange: (patch: Partial<BookingData>) => void;
  }) => {
    const tax = Math.round(provider.priceXCFA * 0.02);
    const inAppDiscount = -150;
    const total = provider.priceXCFA + tax + inAppDiscount;
  
    return (
      <View>
        {/* RDV details */}
        <View style={styles.confirmSection}>
          <View style={styles.confirmSectionHeader}>
            <Text style={styles.confirmSectionTitle}>Détails du Rendez-vous</Text>
            <TouchableOpacity onPress={onChangeDate} style={styles.changeBtn}>
              <Text style={styles.changeBtnText}>Changer</Text>
            </TouchableOpacity>
          </View>
          {booking.date && (
            <Text style={styles.confirmDetail}>
              {formatDate(booking.date)} • {booking.time}
            </Text>
          )}
        </View>
  
        <View style={styles.confirmDivider} />
  
        {/* Price */}
        <View style={styles.confirmSection}>
          <Text style={styles.confirmSectionTitle}>Prix</Text>
          <Text style={styles.confirmDetail}>{formatPrice(provider.priceXCFA)}</Text>
        </View>
  
        <View style={styles.confirmDivider} />
  
        {/* Location */}
        <View style={styles.confirmSection}>
          <Text style={styles.confirmSectionTitle}>Location</Text>
          <Text style={styles.confirmDetail}>{provider.location}</Text>
        </View>
  
        <View style={styles.confirmDivider} />
  
        {/* Cancellation */}
        <View style={styles.confirmSection}>
          <Text style={styles.confirmSectionTitle}>Annulation Gratuite</Text>
          <Text style={styles.confirmDetailMuted}>
            Annuler avant le 25 Mars pour un remboursement total.{' '}
            <Text style={styles.confirmLink}>Politique d'utilisation</Text>
          </Text>
        </View>
  
        <View style={styles.confirmDivider} />
  
        {/* Payment method */}
        <Text style={styles.confirmSectionTitle}>Méthodes de paiements</Text>
        <View style={styles.radioGroup}>
          <RadioOption
            selected={booking.paymentMethod === 'now'}
            highlighted
            onPress={() => onChange({ paymentMethod: 'now' })}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={booking.paymentMethod === 'now' ? colors.primary : colors.inkMuted} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.radioTitle}>Payer {formatPrice(provider.priceXCFA)} dès maintenant</Text>
              <Text style={styles.radioSubtitle}>Améliore vos chances d'être prioritaire</Text>
            </View>
          </RadioOption>
          <RadioOption
            selected={booking.paymentMethod === 'later'}
            onPress={() => onChange({ paymentMethod: 'later' })}
          >
            <Ionicons name="cash-outline" size={20} color={colors.inkMuted} />
            <Text style={[styles.radioTitle, { marginLeft: 10 }]}>Payer à la consultation</Text>
          </RadioOption>
        </View>
  
        {/* Payment provider */}
        {booking.paymentMethod === 'now' && (
          <>
            <Text style={[styles.confirmSectionTitle, { marginTop: 16 }]}>Moyens de paiements</Text>
            <View style={styles.radioGroup}>
              <RadioOption
                selected={booking.paymentProvider === 'mobile_money'}
                onPress={() => onChange({ paymentProvider: 'mobile_money' })}
              >
                <View style={styles.payIcon}><Text>📱</Text></View>
                <Text style={[styles.radioTitle, { marginLeft: 10 }]}>Mobile Money</Text>
              </RadioOption>
              <RadioOption
                selected={booking.paymentProvider === 'orange_money'}
                onPress={() => onChange({ paymentProvider: 'orange_money' })}
              >
                <View style={[styles.payIcon, { backgroundColor: '#FF6600' }]}>
                  <Text style={{ color: '#fff', fontSize: 10, fontFamily: fontFamily.bold }}>OM</Text>
                </View>
                <Text style={[styles.radioTitle, { marginLeft: 10 }]}>Orange Money</Text>
              </RadioOption>
              <RadioOption
                selected={booking.paymentProvider === 'card'}
                onPress={() => onChange({ paymentProvider: 'card' })}
              >
                <Ionicons name="card-outline" size={20} color={colors.inkMuted} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.radioTitle}>Carte bancaire</Text>
                  <Text style={styles.radioSubtitle}>Numéro de compte *2456</Text>
                </View>
              </RadioOption>
            </View>
          </>
        )}
  
        <View style={styles.confirmDivider} />
  
        {/* Invoice */}
        <Text style={styles.confirmSectionTitle}>Facture</Text>
        <View style={styles.invoiceRow}>
          <Text style={styles.invoiceLabel}>Consultation</Text>
          <Text style={styles.invoiceValue}>{formatPrice(provider.priceXCFA)}</Text>
        </View>
        <View style={styles.invoiceRow}>
          <Text style={styles.invoiceLabel}>Paiement In-app</Text>
          <Text style={styles.invoiceValue}>{inAppDiscount} XCFA</Text>
        </View>
        <View style={styles.confirmDivider} />
        <View style={styles.invoiceRow}>
          <Text style={styles.invoiceLabel}>Prix Estimé</Text>
          <Text style={styles.invoiceValue}>{formatPrice(provider.priceXCFA)}</Text>
        </View>
        <View style={styles.invoiceRow}>
          <Text style={styles.invoiceLabel}>Taxes</Text>
          <Text style={styles.invoiceValue}>{formatPrice(tax)}</Text>
        </View>
        <View style={styles.invoiceRow}>
          <Text style={[styles.invoiceLabel, styles.invoiceTotal]}>Total</Text>
          <Text style={[styles.invoiceValue, styles.invoiceTotalValue]}>{formatPrice(total)}</Text>
        </View>
  
        <Text style={styles.termsText}>
          En confirmant, j'ai lu et approuvé les{' '}
          <Text style={styles.confirmLink}>Termes de Réservation.</Text>
        </Text>
      </View>
    );
  };
  
  // ---------------------------------------------------------------------------
  // Main component
  // ---------------------------------------------------------------------------
  
  export const BookingBottomSheet = forwardRef<BookingBottomSheetRef, Props>(
    ({ provider = DEFAULT_PROVIDER, onClose }, ref) => {
      const sheetRef = useRef<AppBottomSheetRef>(null);
      const router = useRouter();
  
      const [step, setStep] = useState(1);
      const TOTAL_STEPS = 4;
  
      const [booking, setBooking] = useState<BookingData>(DEFAULT_BOOKING);
  
      const patchBooking = useCallback((patch: Partial<BookingData>) => {
        setBooking(prev => ({ ...prev, ...patch }));
      }, []);
  
      useImperativeHandle(ref, () => ({
        open: () => {
          setStep(1);
          setBooking(DEFAULT_BOOKING);
          sheetRef.current?.open();
        },
        close: () => sheetRef.current?.close(),
      }));
  
      const handleClose = () => {
        sheetRef.current?.close();
        onClose?.();
      };
  
      const canContinue = () => {
        if (step === 1) return booking.date !== null;
        if (step === 2) return booking.time !== null;
        if (step === 3) return true; // reason optional
        return true;
      };
  
      const handleNext = () => {
        if (step < TOTAL_STEPS) {
          setStep(s => s + 1);
        } else {
          // Submit — navigate to success screen
          sheetRef.current?.close();
          router.push('/booking/success' as never);
        }
      };
  
      const handleBack = () => {
        if (step > 1) setStep(s => s - 1);
        else handleClose();
      };
  
      const stepTitle = 'Nouvelle réservation';
  
      return (
        <AppBottomSheet
          ref={sheetRef}
          snapPoints={['70%', '92%']}
          onClose={onClose}
          scrollable
          containerStyle={styles.sheet}
        >
          {/* ── Top bar ── */}
          <View style={styles.topBar}>
            <Text style={styles.title}>{stepTitle}</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.ink} />
            </TouchableOpacity>
          </View>
  
          {/* ── Progress bar ── */}
          <ProgressBar step={step} total={TOTAL_STEPS} />
  
          {/* ── Provider header (steps 2-4) ── */}
          {step > 1 && (
            <ProviderHeader
              provider={provider}
              date={booking.date}
              time={step > 2 ? booking.time : null}
            />
          )}
  
          {/* ── Step content ── */}
          <View style={styles.stepContent}>
            {step === 1 && (
              <StepDate
                selected={booking.date}
                onSelect={d => patchBooking({ date: d })}
              />
            )}
            {step === 2 && (
              <StepTime
                selected={booking.time}
                onSelect={t => patchBooking({ time: t })}
              />
            )}
            {step === 3 && (
              <StepReason
                value={booking.reason}
                onChange={t => patchBooking({ reason: t })}
              />
            )}
            {step === 4 && (
              <StepConfirm
                provider={provider}
                booking={booking}
                onChangeDate={() => setStep(1)}
                onChange={patchBooking}
              />
            )}
          </View>
  
          {/* ── Footer ── */}
          <View style={styles.footer}>
            {step > 1 && (
              <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                <Ionicons name="arrow-back" size={16} color={colors.ink} />
                <Text style={styles.backBtnText}>Retour</Text>
              </TouchableOpacity>
            )}
            <PrimaryButton
              label={step === TOTAL_STEPS ? 'Confirmer la réservation' : 'Continuer'}
              variant="solid"
              size="md"
              onPress={handleNext}
              isDisabled={!canContinue()}
              style={styles.continueBtn}
            />
          </View>
  
          {step === TOTAL_STEPS && (
            <Text style={styles.termsFooter}>
              En confirmant, j'ai lu et approuvé les{' '}
              <Text style={styles.confirmLink}>Termes de Réservation.</Text>
            </Text>
          )}
        </AppBottomSheet>
      );
    },
  );
  
  BookingBottomSheet.displayName = 'BookingBottomSheet';
  
  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------
  
  const styles = StyleSheet.create({
    sheet: { paddingHorizontal: 20 },
  
    // Top bar
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      marginTop: 4,
    },
    title: {
      fontFamily: fontFamily.bold,
      fontSize: fontSize['2xl'],
      color: colors.ink,
    },
  
    // Progress
    progressBarTrack: {
      height: 3,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginBottom: 20,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
  
    // Provider header
    providerHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    providerAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.border,
    },
    providerInfo: { flex: 1 },
    providerName: {
      fontFamily: fontFamily.bold,
      fontSize: fontSize.base,
      color: colors.ink,
    },
    providerSpecialty: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.sm,
      color: colors.inkMuted,
      marginBottom: 4,
    },
    providerMeta: { gap: 2 },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    metaText: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.xs,
      color: colors.inkMuted,
    },
  
    // Step label
    stepLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16,
    },
    stepNumberBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepNumberText: {
      fontFamily: fontFamily.bold,
      fontSize: fontSize.xs,
      color: colors.white,
    },
    stepLabelText: {
      fontFamily: fontFamily.semiBold,
      fontSize: fontSize.base,
      color: colors.ink,
    },
  
    // Step content
    stepContent: { marginBottom: 16 },
  
    // Calendar
    calendarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    calNavBtn: {
      padding: 6,
    },
    calMonthLabel: {
      fontFamily: fontFamily.semiBold,
      fontSize: fontSize.sm,
      color: colors.ink,
    },
    calDayHeaders: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    calDayHeader: {
      flex: 1,
      textAlign: 'center',
      fontFamily: fontFamily.medium,
      fontSize: fontSize.xs,
      color: colors.inkMuted,
    },
    calGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    calCell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    calCellSelected: {
      backgroundColor: colors.primary,
      borderRadius: 100,
    },
    calCellText: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.sm,
      color: colors.ink,
    },
    calCellTextPast: {
      color: colors.inkFaint,
    },
    calCellTextSelected: {
      color: colors.white,
      fontFamily: fontFamily.bold,
    },
  
    // Clock
    clockContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 12,
    },
    clockFace: {
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: colors.surface,
      position: 'relative',
    },
    clockSelectorLine: {
      position: 'absolute',
      width: 2,
      height: 90,
      backgroundColor: colors.primary,
      left: 109,
      top: 20,
      borderRadius: 1,
    },
    clockCenter: {
      position: 'absolute',
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
      left: 105,
      top: 105,
    },
    clockHour: {
      position: 'absolute',
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clockHourSelected: {
      backgroundColor: colors.primary,
    },
    clockHourText: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.sm,
      color: colors.ink,
    },
    clockHourTextSelected: {
      color: colors.white,
      fontFamily: fontFamily.bold,
    },
    clockControls: {
      flex: 1,
      gap: 8,
    },
    clockControlLabel: {
      fontFamily: fontFamily.medium,
      fontSize: fontSize.xs,
      color: colors.inkMuted,
      marginBottom: 4,
    },
    clockMinuteBtn: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    clockMinuteBtnSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    clockMinuteText: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.sm,
      color: colors.ink,
    },
    clockMinuteTextSelected: {
      color: colors.white,
      fontFamily: fontFamily.bold,
    },
    clockPeriodRow: {
      flexDirection: 'row',
      gap: 6,
      marginTop: 4,
    },
    clockPeriodBtn: {
      flex: 1,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    clockPeriodBtnSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    clockPeriodText: {
      fontFamily: fontFamily.medium,
      fontSize: fontSize.sm,
      color: colors.ink,
    },
    clockPeriodTextSelected: {
      color: colors.white,
    },
    timeDisplay: {
      alignItems: 'center',
      paddingVertical: 8,
    },
    timeDisplayText: {
      fontFamily: fontFamily.bold,
      fontSize: fontSize['2xl'],
      color: colors.primary,
    },
  
    // Textarea
    textareaWrapper: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      minHeight: 160,
    },
    textarea: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.sm,
      color: colors.ink,
      flex: 1,
      minHeight: 120,
    },
    charCount: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.xs,
      color: colors.inkFaint,
      textAlign: 'right',
      marginTop: 8,
    },
  
    // Confirm
    confirmSection: { marginVertical: 12 },
    confirmSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    confirmSectionTitle: {
      fontFamily: fontFamily.semiBold,
      fontSize: fontSize.sm,
      color: colors.ink,
      marginBottom: 4,
    },
    confirmDetail: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.sm,
      color: colors.inkMuted,
    },
    confirmDetailMuted: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.xs,
      color: colors.inkMuted,
      lineHeight: 18,
    },
    confirmLink: {
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    confirmDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 8,
    },
    changeBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 100,
    },
    changeBtnText: {
      fontFamily: fontFamily.medium,
      fontSize: fontSize.xs,
      color: colors.white,
    },
  
    // Radio
    radioGroup: { gap: 8, marginTop: 8 },
    radioOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
    },
    radioOptionSelected: {
      borderColor: colors.primary,
    },
    radioOptionHighlighted: {
      backgroundColor: '#F0FDF4',
    },
    radioOptionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    radioCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioCircleSelected: { borderColor: colors.primary },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    radioTitle: {
      fontFamily: fontFamily.medium,
      fontSize: fontSize.sm,
      color: colors.ink,
    },
    radioSubtitle: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.xs,
      color: colors.inkMuted,
      marginTop: 2,
    },
  
    // Pay icon
    payIcon: {
      width: 28,
      height: 28,
      borderRadius: 6,
      backgroundColor: '#E8F5E9',
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    // Invoice
    invoiceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 4,
    },
    invoiceLabel: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.sm,
      color: colors.inkMuted,
    },
    invoiceValue: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.sm,
      color: colors.ink,
    },
    invoiceTotal: {
      fontFamily: fontFamily.bold,
      color: colors.ink,
    },
    invoiceTotalValue: {
      fontFamily: fontFamily.bold,
      color: colors.primary,
    },
    termsText: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.xs,
      color: colors.inkMuted,
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 8,
    },
  
    // Footer
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 8,
      paddingBottom: Platform.OS === 'ios' ? 16 : 8,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 4,
    },
    backBtnText: {
      fontFamily: fontFamily.medium,
      fontSize: fontSize.sm,
      color: colors.ink,
    },
    continueBtn: { flex: 1 },
    termsFooter: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.xs,
      color: colors.inkMuted,
      textAlign: 'center',
      marginBottom: Platform.OS === 'ios' ? 24 : 12,
    },
  });