import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { MonthlySummary } from '@/types/database';

interface MonthSummaryProps {
  summary: MonthlySummary;
  colors: (typeof Colors)['light'];
}

export function MonthSummary({ summary, colors }: MonthSummaryProps) {
  const winRateLabel = summary.total > 0 ? `${summary.win_rate}%` : '-';

  const items = [
    { label: '경기일수', value: String(summary.days_played), valueColor: colors.text },
    { label: '경기횟수', value: String(summary.total), valueColor: colors.text },
    { label: '승', value: String(summary.wins), valueColor: colors.win },
    { label: '패', value: String(summary.losses), valueColor: colors.loss },
    { label: '무', value: String(summary.draws), valueColor: colors.draw },
    { label: '승률', value: winRateLabel, valueColor: colors.tint },
  ];

  return (
    <View
      style={[
        styles.strip,
        { backgroundColor: colors.background, borderColor: colors.muted + '33' },
      ]}>
      {items.map((item, index) => (
        <View
          key={item.label}
          style={[
            styles.cell,
            index < items.length - 1 && [
              styles.cellDivider,
              { borderRightColor: colors.muted + '33' },
            ],
          ]}>
          <Text style={[styles.value, { color: item.valueColor }]}>{item.value}</Text>
          <Text style={[styles.label, { color: colors.muted }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    minWidth: 0,
  },
  cellDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  label: {
    fontSize: 9,
    fontWeight: '500',
    lineHeight: 11,
  },
});
