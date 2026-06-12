import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize } from '../../themes';
import { StepLabel } from './StepLabel';

// ─── Constants (fallback full grid) ──────────────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const pad = (n: number): string => String(n).padStart(2, '0');

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  slots?: string[];
  selected: string | null;
  onSelect: (time: string) => void;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const TimeChip = ({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    style={[styles.chip, isSelected && styles.chipSelected]}
  >
    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const ChipGrid = ({
  title,
  icon,
  items,
  selectedValue,
  onSelect,
}: {
  title: string;
  icon: string;
  items: number[];
  selectedValue: number;
  onSelect: (value: number) => void;
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Ionicons name={icon as never} size={16} color={colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.chipGrid}>
      {items.map((value) => (
        <TimeChip
          key={value}
          label={pad(value)}
          isSelected={value === selectedValue}
          onPress={() => onSelect(value)}
        />
      ))}
    </View>
  </View>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const StepTime = ({ slots, selected, onSelect }: Props) => {
  const sorted = useMemo(() => {
    if (!slots || slots.length === 0) return [];
    return [...slots].sort();
  }, [slots]);

  const parseHour = selected ? parseInt(selected.split(':')[0], 10) : 8;
  const parseMinute = selected ? parseInt(selected.split(':')[1], 10) : 0;
  const snappedMinute = Math.round(parseMinute / 5) * 5;
  const [hour, setHour] = useState(parseHour);
  const [minute, setMinute] = useState(snappedMinute >= 60 ? 55 : snappedMinute);

  const emitTime = useCallback((h: number, m: number) => {
    onSelect(`${pad(h)}:${pad(m)}`);
  }, [onSelect]);

  const handleHourSelect = useCallback((h: number) => {
    setHour(h);
    emitTime(h, minute);
  }, [minute, emitTime]);

  const handleMinuteSelect = useCallback((m: number) => {
    setMinute(m);
    emitTime(hour, m);
  }, [hour, emitTime]);

  // Real slots: non-empty array → show available times
  if (slots !== undefined && sorted.length > 0) {
    return (
      <View style={styles.container}>
        <StepLabel number={2} label="Choisissez l'heure" />
        {selected && (
          <View style={styles.displayCard}>
            <Ionicons name="time-outline" size={22} color={colors.primary} />
            <Text style={styles.displayTime}>{selected.replace(':', 'h')}</Text>
          </View>
        )}
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.grid}>
            {sorted.map((time) => {
              const isSel = time === selected;
              return (
                <TouchableOpacity key={time} activeOpacity={0.7}
                  onPress={() => onSelect(time)}
                  style={[styles.chip, isSel && styles.chipSelected]}>
                  <Text style={[styles.chipText, isSel && styles.chipTextSelected]}>
                    {time.replace(':', 'h')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Real slots: empty array (explicit) → no availability
  if (slots !== undefined && sorted.length === 0) {
    return (
      <View style={styles.container}>
        <StepLabel number={2} label="Choisissez l'heure" />
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={40} color={colors.inkFaint} />
          <Text style={styles.emptyText}>Aucun créneau disponible pour cette date</Text>
        </View>
      </View>
    );
  }

  // Fallback (slots undefined) → legacy full-hour/minute grid
  return (
    <View style={styles.container}>
      <StepLabel number={2} label="Choisissez l'heure" />
      <View style={styles.displayCard}>
        <Ionicons name="time-outline" size={22} color={colors.primary} />
        <Text style={styles.displayTime}>{pad(hour)}:{pad(minute)}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}
        nestedScrollEnabled contentContainerStyle={styles.scrollContent}>
        <ChipGrid title="Heure" icon="time-outline" items={HOURS}
          selectedValue={hour} onSelect={handleHourSelect} />
        <ChipGrid title="Minutes" icon="timer-outline" items={MINUTES}
          selectedValue={minute} onSelect={handleMinuteSelect} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  displayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.primary + '0A',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.primary + '30',
  },
  displayTime: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['3xl'],
    color: colors.ink,
    letterSpacing: 3,
  },

  scrollContent: {
    paddingBottom: 16,
  },

  // ── Grid (real slots) ──
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  // ── Section (legacy full grid) ──
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // ── Chip ──
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.inkLight,
  },
  chipTextSelected: {
    color: colors.white,
    fontFamily: fontFamily.bold,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
