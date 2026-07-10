import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { Match } from '@/types/database';
import {
  formatRegistrationRecord,
  formatRosterPlayerNames,
  sortRegistrationMatches,
  summarizeRegistrationResults,
} from '@/utils/matchDisplay';
import { getMatchGames } from '@/utils/matchNormalize';
import { formatGameLabel } from '@/utils/matchResult';

interface MatchListItemProps {
  matches: Match[];
  index: number;
  colors: (typeof Colors)['light'];
}

export function MatchListItem({ matches, index, colors }: MatchListItemProps) {
  const router = useRouter();
  const orderedMatches = sortRegistrationMatches(matches);
  const primary = orderedMatches[0];
  const games = orderedMatches.flatMap((match) => getMatchGames(match));
  const { wins, losses, draws } = summarizeRegistrationResults(orderedMatches);
  const scoreLabel =
    games.length > 0 ? games.map((game) => formatGameLabel(game)).join(' · ') : '-';

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/match/[id]', params: { id: primary.id } })}
      style={({ pressed }) => [
        styles.item,
        { backgroundColor: colors.card, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={styles.header}>
        <Text style={[styles.index, { color: colors.muted }]}>
          {String.fromCharCode(0x2460 + index)}
        </Text>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {formatRosterPlayerNames(primary)}
          </Text>
          <Text style={[styles.record, { color: colors.muted }]}>
            {formatRegistrationRecord(wins, losses, draws)}
          </Text>
        </View>
      </View>
      <Text style={[styles.scores, { color: colors.muted }]}>{scoreLabel}</Text>
      {orderedMatches.length > 1 ? (
        <Text style={[styles.gameCount, { color: colors.muted }]}>
          경기 {orderedMatches.length}건
        </Text>
      ) : null}
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
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  record: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 20,
    flexShrink: 0,
  },
  scores: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 22,
  },
  gameCount: {
    fontSize: 12,
    marginLeft: 22,
  },
});
