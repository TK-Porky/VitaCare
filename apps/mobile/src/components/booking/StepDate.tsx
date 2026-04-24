import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize } from '../../themes';
import { StepLabel } from './StepLabel';

type Props = {
  selected: Date | null;
  onSelect: (d: Date) => void;
};

const DAYS_SHORT = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

export const StepDate = ({
  selected,
  onSelect,
}: Props) => {
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
          <Ionicons name="chevron-back" size={16} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.calMonthLabel}>
          {MONTHS[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn}>
          <Ionicons name="chevron-forward" size={16} color={colors.ink} />
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
          if (!day) return <View key={`empty-${i}`} style={{ width: '13.5%' }} />;
          const past = isPast(day);
          const sel = isSelected(day);
          const isToday = today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.calCell,
                sel && styles.calCellSelected,
                isToday && !sel && styles.calCellToday,
                past && styles.calCellPast,
              ]}
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

const styles = StyleSheet.create({
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  calNavBtn: {
    padding: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calMonthLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  calDayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 4,
    paddingHorizontal: 4,
  },
  calDayHeader: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xs,
    color: colors.inkMuted,
    paddingVertical: 4,
  },
  calGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 4,
  },
  calCell: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  calCellSelected: {
    opacity: 1,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderRadius: 999,
  },
  calCellToday: {
    backgroundColor: colors.surface,
  },
  calCellPast: {
    opacity: 0.4,
  },
  calCellText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.ink,
  },
  calCellTextPast: {
    color: colors.inkMuted,
  },
  calCellTextSelected: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
  },
});
