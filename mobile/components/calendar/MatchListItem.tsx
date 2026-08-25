import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { ShareIcon } from '@/components/icons/ShareIcon';
import { ShareResultModal } from '@/components/share/ShareResultModal';
import Colors from '@/constants/Colors';
import { MATCH_TYPE_COLORS, MATCH_TYPE_LABELS } from '@/constants/labels';
import { useSession } from '@/hooks/useSession';
import type { Match } from '@/types/database';
import {
  formatEntryLineupTeams,
  formatRegistrationParticipants,
  formatRegistrationRecord,
  sortRegistrationMatches,
  summarizeRegistrationResults,
} from '@/utils/matchDisplay';
import { computeRegistrationRanking } from '@/utils/matchRanking';
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
  const { user } = useSession();
  const [shareOpen, setShareOpen] = useState(false);
  const orderedMatches = sortRegistrationMatches(matches);
  const primary = orderedMatches[0];
  const { wins, losses, draws } = summarizeRegistrationResults(orderedMatches);
  const mvp = computeRegistrationRanking(orderedMatches)[0];

  return (
    <>
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
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              setShareOpen(true);
            }}
            hitSlop={8}
            style={[
              styles.shareButton,
              { backgroundColor: `${colors.tint}18`, borderColor: `${colors.tint}44` },
            ]}>
            <ShareIcon size={12} color={colors.tint} />
            <Text style={[styles.shareText, { color: colors.tint }]}>공유</Text>
          </Pressable>
        </View>

        {mvp ? (
          <Text style={[styles.mvp, { color: colors.muted }]} numberOfLines={1}>
            🏅 MVP {mvp.name}
          </Text>
        ) : null}

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
                <View style={styles.entryLineupRow}>
                  <Text style={[styles.entryType, { color: MATCH_TYPE_COLORS[match.match_type] }]}>
                    {MATCH_TYPE_LABELS[match.match_type]}
                  </Text>
                  <Text
                    style={[styles.entryLineup, { color: colors.muted }]}
                    numberOfLines={1}>
                    {formatEntryLineupTeams(match)}
                  </Text>
                </View>
                <Text style={[styles.entryScore, { color: getResultColor(result, colors) }]}>
                  {scoreText} ({getResultLabel(result)})
                </Text>
              </View>
            );
          })}
        </View>
      </Pressable>

      {user ? (
        <ShareResultModal
          visible={shareOpen}
          onClose={() => setShareOpen(false)}
          matches={orderedMatches}
          colors={colors}
          userId={user.id}
        />
      ) : null}
    </>
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
  shareButton: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  shareText: {
    fontSize: 11,
    fontWeight: '700',
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
  entryLineupRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  entryType: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: '700',
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
  mvp: {
    marginLeft: 22,
    fontSize: 11,
    fontWeight: '600',
  },
});
