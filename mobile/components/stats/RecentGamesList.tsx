import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { TrackedPressable } from '@/components/analytics/TrackedPressable';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { MATCH_TYPE_COLORS, MATCH_TYPE_LABELS, RESULT_LABELS } from '@/constants/labels';
import type { MatchResult } from '@/types/database';
import { formatDayLabel } from '@/utils/date';
import type { RecentGameItem } from '@/utils/stats';

interface RecentGamesListProps {
  items: RecentGameItem[];
  colors: (typeof Colors)['light'];
}

export function RecentGamesList({ items, colors }: RecentGamesListProps) {
  const router = useRouter();

  if (items.length === 0) {
    return <Text style={[styles.empty, { color: colors.muted }]}>최근 경기가 없습니다</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.list}>
        {items.map((item) => (
          <TrackedPressable
            key={item.id}
            eventName="recent_games_item_open"
            onPress={() => router.push({ pathname: '/match/[id]', params: { id: item.matchId } })}
            style={({ pressed }) => [
              styles.row,
              { borderBottomColor: `${colors.muted}22`, opacity: pressed ? 0.8 : 1 },
            ]}>
            <View style={[styles.badge, { backgroundColor: resultColor(item.result, colors) }]}>
              <Text style={styles.badgeText}>{RESULT_LABELS[item.result]}</Text>
            </View>
            <View style={styles.body}>
              <Text style={[styles.date, { color: colors.muted }]}>
                {formatDayLabel(item.matchDate)}
              </Text>
              <View style={styles.titleRow}>
                <Text style={[styles.type, { color: MATCH_TYPE_COLORS[item.matchType] }]}>
                  {MATCH_TYPE_LABELS[item.matchType]}
                </Text>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
              </View>
            </View>
            <Text style={[styles.score, { color: colors.text }]}>{item.scoreLabel}</Text>
          </TrackedPressable>
        ))}
      </View>
    </View>
  );
}

function resultColor(result: MatchResult, colors: (typeof Colors)['light']) {
  if (result === 'win') return colors.win;
  if (result === 'loss') return colors.loss;
  return colors.draw;
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  date: {
    fontSize: 11,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 0,
  },
  type: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: '600',
  },
  score: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 0,
  },
  empty: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
