import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { formatFullDayLabel } from '@/utils/date';
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
  dateKey,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
  muted: string;
  dateKey?: string | null;
}) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricLabel, { color: muted }]}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
        <Text style={[styles.metricUnit, { color }]}>{unit}</Text>
      </View>
      {dateKey ? (
        <Text style={[styles.metricDate, { color: muted }]} numberOfLines={1}>
          {formatFullDayLabel(dateKey)}
        </Text>
      ) : null}
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
  bestDate,
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
  bestDate: string | null;
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
          dateKey={bestDate}
        />
      </View>
    </View>
  );
}

export function StreakCard({ streaks, colors }: StreakCardProps) {
  const winBelowBest = streaks.current_win > 0 && streaks.current_win < streaks.best_win;
  const lossBelowBest = streaks.current_loss > 0 && streaks.current_loss < streaks.best_loss;

  const activeFlow =
    streaks.current_win > 0
      ? {
          emoji: '🔥',
          text: `현재 ${streaks.current_win}연승 중!`,
          color: colors.win,
          sub:
            winBelowBest && streaks.best_win_date
              ? `최고 ${streaks.best_win}연승 (${formatFullDayLabel(streaks.best_win_date)})`
              : null,
        }
      : streaks.current_loss > 0
        ? {
            emoji: '💧',
            text: `현재 ${streaks.current_loss}연패 중`,
            color: colors.loss,
            sub:
              lossBelowBest && streaks.best_loss_date
                ? `최고 ${streaks.best_loss}연패 (${formatFullDayLabel(streaks.best_loss_date)})`
                : null,
          }
        : { emoji: '✨', text: '지금은 연승·연패가 없어요', color: colors.muted, sub: null };

  return (
    <View style={styles.container}>
      <View style={[styles.flowBanner, { backgroundColor: `${activeFlow.color}14` }]}>
        <Text style={styles.flowEmoji}>{activeFlow.emoji}</Text>
        <View style={styles.flowTextWrap}>
          <Text style={[styles.flowText, { color: activeFlow.color }]}>{activeFlow.text}</Text>
          {activeFlow.sub ? (
            <Text style={[styles.flowSub, { color: colors.muted }]} numberOfLines={1}>
              {activeFlow.sub}
            </Text>
          ) : null}
        </View>
      </View>

      <StreakGroup
        emoji="🏆"
        title="연승 기록"
        currentLabel="현재"
        currentValue={streaks.current_win}
        bestLabel="최고"
        bestValue={streaks.best_win}
        bestDate={streaks.best_win_date}
        unit="연승"
        accent={colors.win}
        muted={colors.muted}
      />

      <StreakGroup
        emoji="😵"
        title="연패 기록"
        currentLabel="현재"
        currentValue={streaks.current_loss}
        bestLabel="최고"
        bestValue={streaks.best_loss}
        bestDate={streaks.best_loss_date}
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
  flowTextWrap: {
    flex: 1,
    gap: 2,
  },
  flowText: {
    fontSize: 15,
    fontWeight: '700',
  },
  flowSub: {
    fontSize: 12,
    fontWeight: '600',
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
  metricDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: 8,
  },
});
