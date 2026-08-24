import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { Match } from '@/types/database';
import {
  formatEntryLineupTeams,
  formatRegistrationParticipants,
  formatRegistrationRecord,
  sortRegistrationMatches,
  summarizeRegistrationResults,
} from '@/utils/matchDisplay';
import { getMatchGames } from '@/utils/matchNormalize';
import { formatGameScore } from '@/utils/matchResult';
import { getResultColor, getResultLabel } from '@/utils/resultDisplay';

interface MatchListItemProps {
  matches: Match[];
  index: number;
  colors: (typeof Colors)['light'];
}

export function MatchListItem({ matches, index, colors }: MatchListItemProps) {
  const router = useRouter();
  const orderedMatches = sortRegistrationMatches(matches);
  const primary = orderedMatches[0];
  const { wins, losses, draws } = summarizeRegistrationResults(orderedMatches);

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
            {formatRegistrationParticipants(orderedMatches)} ({orderedMatches.length}경기)
          </Text>
          <Text style={[styles.record, { color: colors.muted }]}>
            {formatRegistrationRecord(wins, losses, draws)}
          </Text>
        </View>
      </View>

      <View style={styles.entryList}>
        {orderedMatches.map((match) => {
          const games = getMatchGames(match);
          const game = games[0];
          const result = game?.result ?? match.result;
          const scoreText = game
            ? formatGameScore(game)
            : match.my_score != null && match.opponent_score != null
              ? `${match.my_score}:${match.opponent_score}`
              : '-';

          return (
            <View key={match.id} style={styles.entryRow}>
              <Text
                style={[styles.entryLineup, { color: colors.muted }]}
                numberOfLines={1}>
                {formatEntryLineupTeams(match)}
              </Text>
              <Text style={[styles.entryScore, { color: getResultColor(result, colors) }]}>
                {scoreText} ({getResultLabel(result)})
              </Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    borderRadius: 12,
    padding: 14,
    gap: 8,
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
  entryList: {
    marginLeft: 22,
    gap: 4,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  entryLineup: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
  },
  entryScore: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: '700',
  },
});
