import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { WEEKDAY_LABELS, getCalendarCells } from '@/utils/date';

interface CalendarGridProps {
  year: number;
  month: number;
  selectedDate: string;
  datesWithMatches: Set<string>;
  onSelectDate: (dateKey: string) => void;
  colors: (typeof Colors)['light'];
}

export function CalendarGrid({
  year,
  month,
  selectedDate,
  datesWithMatches,
  onSelectDate,
  colors,
}: CalendarGridProps) {
  const cells = getCalendarCells(year, month);

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label, index) => (
          <Text
            key={label}
            style={[
              styles.weekday,
              { color: index === 0 ? colors.loss : index === 6 ? colors.tint : colors.muted },
            ]}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          const isSelected = cell.dateKey === selectedDate;
          const hasMatch = datesWithMatches.has(cell.dateKey);

          return (
            <Pressable
              key={cell.dateKey}
              style={styles.cell}
              onPress={() => onSelectDate(cell.dateKey)}>
              <View
                style={[
                  styles.dayCircle,
                  cell.isToday && { borderColor: colors.tint, borderWidth: 2 },
                  isSelected && { backgroundColor: colors.tint },
                ]}>
                <Text
                  style={[
                    styles.dayText,
                    { color: cell.isCurrentMonth ? colors.text : colors.muted },
                    isSelected && { color: '#fff', fontWeight: '700' },
                  ]}>
                  {cell.date.getDate()}
                </Text>
              </View>
              {hasMatch && (
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: isSelected ? '#fff' : colors.tint },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 6,
    gap: 2,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'transparent',
  },
  dayText: {
    fontSize: 15,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
