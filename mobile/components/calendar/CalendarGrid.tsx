import { Pressable, StyleSheet, View } from 'react-native';

import { BeanIcon } from '@/components/brand/BeanIcon';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { WEEKDAY_LABELS, getCalendarCells } from '@/utils/date';
import { isRedCalendarDay } from '@/utils/koreanHolidays';

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
              { color: index === 0 ? colors.loss : index === 6 ? colors.saturday : colors.muted },
            ]}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          const isSelected = cell.dateKey === selectedDate;
          const hasMatch = datesWithMatches.has(cell.dateKey);
          const dayOfWeek = cell.date.getDay();
          const dayTextColor = isSelected
            ? '#fff'
            : !cell.isCurrentMonth
              ? colors.muted
              : isRedCalendarDay(cell.dateKey, dayOfWeek)
                ? colors.loss
                : dayOfWeek === 6
                  ? colors.saturday
                  : colors.text;

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
                    { color: dayTextColor },
                    isSelected && { fontWeight: '700' },
                  ]}>
                  {cell.date.getDate()}
                </Text>
                {hasMatch && (
                  <View style={styles.beanStamp} pointerEvents="none">
                    <BeanIcon
                      size={38}
                      variant="stamp"
                      opacity={isSelected ? 0.55 : 0.38}
                      tone={isSelected ? 'light' : 'default'}
                    />
                  </View>
                )}
              </View>
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
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  dayText: {
    fontSize: 15,
    zIndex: 1,
  },
  beanStamp: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
