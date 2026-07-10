import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { StreakStats } from '@/utils/growth';

interface StreakCardProps {
  streaks: StreakStats;
  colors: (typeof Colors)['light'];
}

function StreakMetric({
  label,
  value,
  unit,
  color,
  muted,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
  muted: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricLabel, { color: muted }]}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
        <Text style={[styles.metricUnit, { color }]}>{unit}</Text>
      </View>
    </View>
  );
}

function StreakGroup({
  emoji,
  title,
  currentLabel,
  currentValue,
  bestLabel,
  bestValue,
  unit,
  accent,
  muted,
}: {
  emoji: string;
  title: string;
  currentLabel: string;
  currentValue: number;
  bestLabel: string;
  bestValue: number;
  unit: string;
  accent: string;
  muted: string;
}) {
  return (
    <View style={[styles.group, { backgroundColor: `${accent}10`, borderColor: `${accent}33` }]}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupEmoji}>{emoji}</Text>
        <Text style={[styles.groupTitle, { color: accent }]}>{title}</Text>
      </View>
      <View style={styles.groupMetrics}>
        <StreakMetric
          label={currentLabel}
          value={currentValue}
          unit={unit}
          color={accent}
          muted={muted}
        />
        <View style={[styles.divider, { backgroundColor: `${accent}22` }]} />
        <StreakMetric
          label={bestLabel}
          value={bestValue}
          unit={unit}
          color={accent}
          muted={muted}
        />
      </View>
    </View>
  );
}

export function StreakCard({ streaks, colors }: StreakCardProps) {
  const activeFlow =
    streaks.current_win > 0
      ? { emoji: '🔥', text: `현재 ${streaks.current_win}연승 중!`, color: colors.win }
      : streaks.current_loss > 0
        ? { emoji: '💧', text: `현재 ${streaks.current_loss}연패 중`, color: colors.loss }
        : { emoji: '✨', text: '지금은 연승·연패가 없어요', color: colors.muted };

  return (
    <View style={styles.container}>
      <View style={[styles.flowBanner, { backgroundColor: `${activeFlow.color}14` }]}>
        <Text style={styles.flowEmoji}>{activeFlow.emoji}</Text>
        <Text style={[styles.flowText, { color: activeFlow.color }]}>{activeFlow.text}</Text>
      </View>

      <StreakGroup
        emoji="🏆"
        title="승리 스트릭"
        currentLabel="현재"
        currentValue={streaks.current_win}
        bestLabel="최고"
        bestValue={streaks.best_win}
        unit="연승"
        accent={colors.win}
        muted={colors.muted}
      />

      <StreakGroup
        emoji="😵"
        title="패배 스트릭"
        currentLabel="현재"
        currentValue={streaks.current_loss}
        bestLabel="최고"
        bestValue={streaks.best_loss}
        unit="연패"
        accent={colors.loss}
        muted={colors.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  flowBanner: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flowEmoji: {
    fontSize: 22,
  },
  flowText: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  group: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupEmoji: {
    fontSize: 20,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  groupMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  metricValue: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 38,
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: '700',
    paddingBottom: 5,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: 8,
  },
});
