import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { RESULT_LABELS } from '@/constants/labels';
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
      <View style={styles.dotsRow}>
        {[...items].reverse().map((item) => (
          <View
            key={item.id}
            style={[styles.dot, { backgroundColor: resultColor(item.result, colors) }]}
          />
        ))}
      </View>

      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={item.id}
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
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
            <Text style={[styles.score, { color: colors.text }]}>{item.scoreLabel}</Text>
          </Pressable>
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
  dotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
  title: {
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
