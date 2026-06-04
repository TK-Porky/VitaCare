import React, { useState, useCallback } from 'react';
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

// ─── Constants ────────────────────────────────────────────────────────────────

/** Hours 0–23 for 24h format */
const HOURS = Array.from({ length: 24 }, (_, i) => i);

/** Minutes in 5-minute intervals: 0, 5, 10, …, 55 */
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

/** Format a number to 2-digit string (e.g. 8 → "08") */
const pad = (n: number): string => String(n).padStart(2, '0');

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  selected: string | null;
  onSelect: (time: string) => void;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * A single selectable chip used in hour/minute grids.
 */
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

/**
 * Grid of chips inside a labelled section.
 */
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

export const StepTime = ({ selected, onSelect }: Props) => {
  // Parse initial values from the selected string (e.g. "08:30")
  const parseHour = selected ? parseInt(selected.split(':')[0], 10) : 8;
  const parseMinute = selected ? parseInt(selected.split(':')[1], 10) : 0;

  // Snap parsed minute to nearest 5-minute interval
  const snappedMinute = Math.round(parseMinute / 5) * 5;

  const [hour, setHour] = useState(parseHour);
  const [minute, setMinute] = useState(snappedMinute >= 60 ? 55 : snappedMinute);

  const emitTime = useCallback(
    (h: number, m: number) => {
      onSelect(`${pad(h)}:${pad(m)}`);
    },
    [onSelect],
  );

  const handleHourSelect = useCallback(
    (h: number) => {
      setHour(h);
      emitTime(h, minute);
    },
    [minute, emitTime],
  );

  const handleMinuteSelect = useCallback(
    (m: number) => {
      setMinute(m);
      emitTime(hour, m);
    },
    [hour, emitTime],
  );

  return (
    <View style={styles.container}>
      <StepLabel number={2} label="Choisissez l'heure" />

      {/* Current selection display */}
      <View style={styles.displayCard}>
        <Ionicons name="time-outline" size={22} color={colors.primary} />
        <Text style={styles.displayTime}>
          {pad(hour)}:{pad(minute)}
        </Text>
      </View>

      {/* Scrollable grids */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        nestedScrollEnabled
        contentContainerStyle={styles.scrollContent}
      >
        <ChipGrid
          title="Heure"
          icon="time-outline"
          items={HOURS}
          selectedValue={hour}
          onSelect={handleHourSelect}
        />

        <ChipGrid
          title="Minutes"
          icon="timer-outline"
          items={MINUTES}
          selectedValue={minute}
          onSelect={handleMinuteSelect}
        />
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Display card ──
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
    fontSize: fontSize['4xl'],
    color: colors.ink,
    letterSpacing: 4,
  },

  // ── Scroll content ──
  scrollContent: {
    paddingBottom: 16,
    gap: 20,
  },

  // ── Section (hour / minute) ──
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

  // ── Chip grid ──
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // ── Individual chip ──
  chip: {
    width: 52,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
});