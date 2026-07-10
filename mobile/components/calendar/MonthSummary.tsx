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

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.row}>
        <SummaryItem emoji="🎾" label="경기" value={String(summary.total)} colors={colors} />
        <SummaryItem emoji="🏆" label="승" value={String(summary.wins)} colors={colors} />
        <SummaryItem emoji="❌" label="패" value={String(summary.losses)} colors={colors} />
        <SummaryItem emoji="📈" label="승률" value={winRateLabel} colors={colors} />
      </View>
    </View>
  );
}

function SummaryItem({
  emoji,
  label,
  value,
  colors,
}: {
  emoji: string;
  label: string;
  value: string;
  colors: (typeof Colors)['light'];
}) {
  return (
    <View style={styles.item}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  emoji: {
    fontSize: 20,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
  },
});
