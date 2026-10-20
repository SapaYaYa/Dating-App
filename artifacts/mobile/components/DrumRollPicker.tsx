import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const ITEM_H = 52;
const VISIBLE = 5;
const PICKER_H = ITEM_H * VISIBLE;
const PAD = ITEM_H * 2;

interface ColumnProps {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  colors: any;
  flex?: number;
}

function Column({ items, selectedIndex, onSelect, colors, flex = 1 }: ColumnProps) {
  const ref = useRef<ScrollView>(null);
  const [displayIndex, setDisplayIndex] = useState(selectedIndex);

  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollTo({ y: selectedIndex * ITEM_H, animated: false });
      setDisplayIndex(selectedIndex);
    }, 80);
    return () => clearTimeout(t);
  }, [selectedIndex]);

  const commit = (y: number) => {
    const index = Math.max(0, Math.min(Math.round(y / ITEM_H), items.length - 1));
    setDisplayIndex(index);
    ref.current?.scrollTo({ y: index * ITEM_H, animated: true });
    onSelect(index);
  };

  return (
    <View style={[styles.column, { flex }]}>
      <View
        pointerEvents="none"
        style={[styles.highlight, { backgroundColor: colors.secondary, top: ITEM_H * 2 }]}
      />
      <View
        pointerEvents="none"
        style={[styles.fadeTop, { backgroundColor: colors.background }]}
      />
      <View
        pointerEvents="none"
        style={[styles.fadeBottom, { backgroundColor: colors.background }]}
      />
      <ScrollView
        ref={ref}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: PAD }}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
          const clamped = Math.max(0, Math.min(index, items.length - 1));
          if (clamped !== displayIndex) setDisplayIndex(clamped);
        }}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => commit(e.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(e) => commit(e.nativeEvent.contentOffset.y)}
      >
        {items.map((label, i) => (
          <View key={i} style={styles.item}>
            <Text
              style={[
                styles.label,
                {
                  color: displayIndex === i ? colors.foreground : colors.mutedForeground,
                  fontWeight: displayIndex === i ? "700" : "400",
                  fontSize: displayIndex === i ? 16 : 14,
                },
              ]}
            >
              {label}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export interface DrumRollPickerProps {
  month: number;
  day: number;
  year: number;
  onMonthChange: (m: number) => void;
  onDayChange: (d: number) => void;
  onYearChange: (y: number) => void;
  colors: any;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

const NOW = new Date();
const MAX_YEAR = NOW.getFullYear() - 18;
const MIN_YEAR = NOW.getFullYear() - 100;
const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) =>
  String(MIN_YEAR + i)
).reverse();

export function DrumRollPicker({
  month, day, year,
  onMonthChange, onDayChange, onYearChange,
  colors,
}: DrumRollPickerProps) {
  const totalDays = daysInMonth(month, year);
  const days = Array.from({ length: totalDays }, (_, i) => String(i + 1).padStart(2, "0"));
  const yearIndex = YEARS.indexOf(String(year));

  const handleMonthSelect = (i: number) => {
    onMonthChange(i);
    const maxDay = daysInMonth(i, year);
    if (day > maxDay) onDayChange(maxDay);
  };

  const handleDaySelect = (i: number) => onDayChange(i + 1);

  const handleYearSelect = (i: number) => {
    const y = parseInt(YEARS[i], 10);
    onYearChange(y);
    const maxDay = daysInMonth(month, y);
    if (day > maxDay) onDayChange(maxDay);
  };

  return (
    <View style={[styles.root, { borderColor: colors.border }]}>
      <Column
        items={MONTHS}
        selectedIndex={month}
        onSelect={handleMonthSelect}
        colors={colors}
        flex={5}
      />
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
      <Column
        items={days}
        selectedIndex={day - 1}
        onSelect={handleDaySelect}
        colors={colors}
        flex={2}
      />
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
      <Column
        items={YEARS}
        selectedIndex={yearIndex >= 0 ? yearIndex : 0}
        onSelect={handleYearSelect}
        colors={colors}
        flex={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    height: PICKER_H,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  column: {
    height: PICKER_H,
    overflow: "hidden",
    position: "relative",
  },
  highlight: {
    position: "absolute",
    left: 4,
    right: 4,
    height: ITEM_H,
    borderRadius: 10,
    zIndex: 0,
  },
  fadeTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: PAD - 12,
    opacity: 0.75,
    zIndex: 2,
  },
  fadeBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: PAD - 12,
    opacity: 0.75,
    zIndex: 2,
  },
  separator: { width: 1 },
  item: {
    height: ITEM_H,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  label: { textAlign: "center" },
});
