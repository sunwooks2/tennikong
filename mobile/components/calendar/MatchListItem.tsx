import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { RESULT_LABELS } from '@/constants/labels';
import Colors from '@/constants/Colors';
import type { Match } from '@/types/database';
import { formatSetScores } from '@/utils/matchResult';
import { formatMatchTitle } from '@/utils/matchDisplay';

interface MatchListItemProps {
  match: Match;
  index: number;
  colors: (typeof Colors)['light'];
}

export function MatchListItem({ match, index, colors }: MatchListItemProps) {
  const router = useRouter();
  const isWin = match.result === 'win';
  const scores = match.match_sets ? formatSetScores(match.match_sets) : '-';
  const resultColor = isWin ? colors.win : colors.loss;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/match/[id]', params: { id: match.id } })}
      style={({ pressed }) => [
        styles.item,
        { backgroundColor: colors.card, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={styles.header}>
        <Text style={[styles.index, { color: colors.muted }]}>
          {String.fromCharCode(0x2460 + index)}
        </Text>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {formatMatchTitle(match)}
        </Text>
        <View style={[styles.badge, { backgroundColor: `${resultColor}22` }]}>
          <Text style={[styles.badgeText, { color: resultColor }]}>
            {RESULT_LABELS[match.result]}
          </Text>
        </View>
      </View>
      <Text style={[styles.scores, { color: colors.muted }]}>{scores}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  index: {
    fontSize: 14,
    marginTop: 2,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scores: {
    fontSize: 14,
    marginLeft: 22,
  },
});
