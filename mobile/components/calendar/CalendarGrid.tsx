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
  matchCountByDate: Map<string, number>;
  onSelectDate: (dateKey: string) => void;
  colors: (typeof Colors)['light'];
}

/** 일별 경기횟수 → 콩 스탬프 투명도 (3단계: 1~4 / 5~6 / 7+) */
function stampOpacityForCount(count: number, selected: boolean): number {
  const base =
    count >= 7 ? 1.0 :
    count >= 5 ? 0.65 :
    0.35;

  return selected ? Math.min(base + 0.10, 1) : base;
}

/** 일별 경기횟수 → 콩 스탬프 색상 (1~4 라임 / 5~6 진한 연두 / 7~8 기본색 / 9+ 검은콩) */
function stampToneForCount(count: number): 'lime' | 'green' | 'default' | 'black' {
  if (count >= 9) return 'black';
  if (count >= 7) return 'default';
  if (count >= 5) return 'green';
  return 'lime';
}

export function CalendarGrid({
  year,
  month,
  selectedDate,
  matchCountByDate,
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
          const matchCount = matchCountByDate.get(cell.dateKey) ?? 0;
          const hasMatch = matchCount > 0;
          const stampTone = hasMatch ? stampToneForCount(matchCount) : null;
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
                      opacity={stampOpacityForCount(matchCount, isSelected)}
                      tone={isSelected ? 'light' : (stampTone ?? 'default')}
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
    position: 'relative',
    zIndex: 2,
  },
  beanStamp: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
