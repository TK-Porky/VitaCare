import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { colors, fontFamily, fontSize } from '../../themes';
import { StepLabel } from './StepLabel';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

type Props = {
  selected: string | null;
  onSelect: (t: string) => void;
};

// Reusable drum-roll column
const PickerColumn = ({
  items,
  selectedIndex,
  onSelect,
  format,
}: {
  items: number[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  format?: (v: number) => string;
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const fmt = format ?? ((v: number) => String(v));

  useEffect(() => {
    scrollRef.current?.scrollTo({
      y: selectedIndex * ITEM_HEIGHT,
      animated: false,
    });
  }, [selectedIndex]);

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    onSelect(clamped);
  };

  return (
    <View style={pickerStyles.column}>
      {/* Selection highlight */}
      <View style={pickerStyles.highlight} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumEnd}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2, // center first/last items
        }}
      >
        {items.map((val, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <View key={val} style={pickerStyles.item}>
              <Text
                style={[
                  pickerStyles.itemText,
                  isSelected && pickerStyles.itemTextSelected,
                ]}
              >
                {fmt(val)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export const StepTime = ({ selected, onSelect }: Props) => {
  // Parse selected back to state if provided
  const initH = selected ? parseInt(selected.split(':')[0]) : 8;
  const initM = selected ? parseInt(selected.split(':')[1]) : 0;
  const initPeriod: 'AM' | 'PM' =
    selected && parseInt(selected.split(':')[0]) >= 12 ? 'PM' : 'AM';

  const [hourIndex, setHourIndex] = React.useState(HOURS.indexOf(initH));
  const [minuteIndex, setMinuteIndex] = React.useState(initM);
  const [period, setPeriod] = React.useState<'AM' | 'PM'>(initPeriod);

  const confirm = (hIdx: number, mIdx: number) => {
    const h = HOURS[hIdx];
    const m = MINUTES[mIdx];
    onSelect(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  const displayH = HOURS[hourIndex];
  const displayM = MINUTES[minuteIndex];

  return (
    <View>
      <StepLabel number={2} label="Choisissez l'heure" />

      {/* Time display */}
      <View style={styles.timeDisplay}>
        <Text style={styles.timeDisplayText}>
          {String(displayH).padStart(2, '0')}:
          {String(displayM).padStart(2, '0')}
        </Text>
        {/* <Text style={styles.timePeriodBadge}>{period}</Text> */}
      </View>

      {/* Picker */}
      <View style={styles.pickerContainer}>
        <PickerColumn
          items={HOURS}
          selectedIndex={hourIndex}
          onSelect={(i) => {
            setHourIndex(i);
            confirm(i, minuteIndex);
          }}
          format={(v) => String(v).padStart(2, '0')}
        />
        <Text style={styles.colon}>:</Text>
        <PickerColumn
          items={MINUTES}
          selectedIndex={minuteIndex}
          onSelect={(i) => {
            setMinuteIndex(i);
            confirm(hourIndex, i);
          }}
          format={(v) => String(v).padStart(2, '0')}
        />

        {/* AM / PM 
        <View style={styles.periodColumn}>
          {(['AM', 'PM'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.periodBtn,
                period === p && styles.periodBtnSelected,
              ]}
              onPress={() => {
                setPeriod(p);
                confirm(hourIndex, minuteIndex);
              }}
            >
              <Text
                style={[
                  styles.periodText,
                  period === p && styles.periodTextSelected,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        */}
      </View>
    </View>
  );
};

const pickerStyles = StyleSheet.create({
  column: {
    width: 72,
    height: PICKER_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  highlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: colors.primary + '18', // ~10% opacity
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary + '40',
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xl,
    color: '#94A3B8',
  },
  itemTextSelected: {
    color: colors.primary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
  },
});

const styles = StyleSheet.create({
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  timeDisplayText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['4xl'],
    color: colors.ink,
    letterSpacing: 3,
  },
  timePeriodBadge: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    color: colors.primary,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 8,
  },
  colon: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
    color: colors.ink,
    marginBottom: 4,
  },
  periodColumn: {
    gap: 10,
    marginLeft: 8,
  },
  periodBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  periodBtnSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: '#94A3B8',
  },
  periodTextSelected: {
    color: colors.white,
    fontFamily: fontFamily.bold,
  },
});