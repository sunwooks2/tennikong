import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { formatMonthLabel } from '@/utils/date';

interface MonthNavigatorProps {
  year: number;
  month: number;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  colors: (typeof Colors)['light'];
  hintExtra?: ReactNode;
}

export function MonthNavigator({
  year,
  month,
  onPrevious,
  onNext,
  onToday,
  colors,
  hintExtra,
}: MonthNavigatorProps) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onPrevious}
        style={[styles.navButton, { backgroundColor: colors.card }]}
        hitSlop={8}>
        <Text style={[styles.navText, { color: colors.text }]}>‹</Text>
      </Pressable>

      <Pressable onPress={onToday} style={styles.center}>
        <Text style={[styles.label, { color: colors.text }]}>
          {formatMonthLabel(year, month)}
        </Text>
        <View style={styles.hintRow}>
          <Text style={[styles.todayHint, { color: colors.muted }]}>오늘로 이동</Text>
          {hintExtra}
        </View>
      </Pressable>

      <Pressable
        onPress={onNext}
        style={[styles.navButton, { backgroundColor: colors.card }]}
        hitSlop={8}>
        <Text style={[styles.navText, { color: colors.text }]}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '300',
  },
  center: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
  },
  todayHint: {
    fontSize: 13,
  },
});
