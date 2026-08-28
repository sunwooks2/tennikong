import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { GameStats, PositionMatrix } from '@/utils/stats';

interface PositionMatrixGridProps {
  matrix: PositionMatrix;
  rateField: 'win_rate' | 'loss_rate';
  colors: (typeof Colors)['light'];
}

export function PositionMatrixGrid({ matrix, rateField, colors }: PositionMatrixGridProps) {
  const accent = rateField === 'loss_rate' ? colors.loss : colors.tint;

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <View style={styles.cornerCell} />
        <HeaderCell label="상대 포" colors={colors} />
        <HeaderCell label="상대 백" colors={colors} />
      </View>
      <View style={styles.row}>
        <HeaderCell label="나 포" colors={colors} vertical />
        <DataCell stats={matrix.foreFore} rateField={rateField} accent={accent} colors={colors} />
        <DataCell stats={matrix.foreBack} rateField={rateField} accent={accent} colors={colors} />
      </View>
      <View style={styles.row}>
        <HeaderCell label="나 백" colors={colors} vertical />
        <DataCell stats={matrix.backFore} rateField={rateField} accent={accent} colors={colors} />
        <DataCell stats={matrix.backBack} rateField={rateField} accent={accent} colors={colors} />
      </View>
    </View>
  );
}

function HeaderCell({
  label,
  colors,
  vertical = false,
}: {
  label: string;
  colors: (typeof Colors)['light'];
  vertical?: boolean;
}) {
  return (
    <View style={styles.headerCell}>
      <Text style={[styles.headerText, { color: colors.muted }]} numberOfLines={vertical ? 2 : 1}>
        {label}
      </Text>
    </View>
  );
}

function DataCell({
  stats,
  rateField,
  accent,
  colors,
}: {
  stats: GameStats;
  rateField: 'win_rate' | 'loss_rate';
  accent: string;
  colors: (typeof Colors)['light'];
}) {
  return (
    <View style={[styles.dataCell, { backgroundColor: colors.background }]}>
      {stats.total > 0 ? (
        <>
          <Text style={[styles.dataRate, { color: accent }]}>{stats[rateField]}%</Text>
          <Text style={[styles.dataMeta, { color: colors.muted }]}>{stats.total}경기</Text>
        </>
      ) : (
        <Text style={[styles.dataEmpty, { color: colors.muted }]}>-</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  cornerCell: {
    width: 48,
  },
  headerCell: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  dataCell: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  dataRate: {
    fontSize: 15,
    fontWeight: '700',
  },
  dataMeta: {
    fontSize: 10,
  },
  dataEmpty: {
    fontSize: 13,
  },
});
