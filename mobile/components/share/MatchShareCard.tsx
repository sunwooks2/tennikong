import { StyleSheet, View } from 'react-native';

import { BeanIcon } from '@/components/brand/BeanIcon';
import { Text } from '@/components/Themed';
import { COURT_TYPE_LABELS, MATCH_TYPE_COLORS, MATCH_TYPE_LABELS } from '@/constants/labels';
import Colors from '@/constants/Colors';
import type { Match } from '@/types/database';
import { formatDayLabel } from '@/utils/date';
import {
  formatEntryLineupTeams,
  formatRegistrationRecord,
  sortRegistrationMatches,
  summarizeRegistrationResults,
} from '@/utils/matchDisplay';
import { computeRegistrationRanking } from '@/utils/matchRanking';
import { getMatchGames } from '@/utils/matchNormalize';
import { formatGameScore } from '@/utils/matchResult';
import { getResultColor, getResultLabel } from '@/utils/resultDisplay';

interface MatchShareCardProps {
  matches: Match[];
  colors: (typeof Colors)['light'];
}

export function MatchShareCard({ matches, colors }: MatchShareCardProps) {
  const orderedMatches = sortRegistrationMatches(matches);
  const primary = orderedMatches[0];
  const { wins, losses, draws } = summarizeRegistrationResults(orderedMatches);
  const ranking = computeRegistrationRanking(orderedMatches);
  const mvp = ranking[0];

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.brandRow}>
        <BeanIcon size={48} tone="brand" />
        <Text style={[styles.brandName, { color: colors.text }]}>테니콩 경기공유</Text>
      </View>

      <Text style={[styles.meta, { color: colors.muted }]}>
        {formatDayLabel(primary.match_date)} · {MATCH_TYPE_LABELS[primary.match_type]} ·{' '}
        {COURT_TYPE_LABELS[primary.court_type]}
      </Text>

      <View style={styles.recordRow}>
        <Text style={[styles.record, { color: colors.text }]}>
          {formatRegistrationRecord(wins, losses, draws)}
        </Text>
        {mvp ? (
          <Text style={[styles.mvp, { color: colors.tint }]}>🏅 오늘의 MVP {mvp.name}</Text>
        ) : null}
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
              <View style={styles.entryLineupRow}>
                <Text style={[styles.entryType, { color: MATCH_TYPE_COLORS[match.match_type] }]}>
                  {MATCH_TYPE_LABELS[match.match_type]}
                </Text>
                <Text style={[styles.entryLineup, { color: colors.text }]} numberOfLines={1}>
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

      {ranking.length > 0 ? (
        <View style={styles.rankingSection}>
          <Text style={[styles.rankingTitle, { color: colors.muted }]}>선수 순위</Text>
          <View style={styles.rankingList}>
            {ranking.map((row, idx) => (
              <View key={row.name} style={styles.rankingRow}>
                <Text style={[styles.rankingPosition, { color: colors.muted }]}>{idx + 1}위</Text>
                <Text
                  style={[
                    styles.rankingName,
                    { color: row.isMe ? colors.tint : colors.text, fontWeight: row.isMe ? '800' : '600' },
                  ]}
                  numberOfLines={1}>
                  {row.name}
                </Text>
                <Text style={[styles.rankingRecord, { color: colors.muted }]}>
                  {row.wins}승 {row.losses}패 {row.draws}무
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={[styles.footerDivider, { borderColor: colors.muted }]} />
      <Text style={[styles.footer, { color: colors.muted }]}>
        테니콩에서 기록됨 · tennikong.vercel.app
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 320,
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    fontSize: 13,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  record: {
    fontSize: 22,
    fontWeight: '800',
  },
  mvp: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: '700',
  },
  entryList: {
    gap: 6,
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
    fontSize: 14,
    fontWeight: '600',
  },
  entryScore: {
    flexShrink: 0,
    fontSize: 14,
    fontWeight: '700',
  },
  rankingSection: {
    gap: 6,
  },
  rankingTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  rankingList: {
    gap: 4,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankingPosition: {
    width: 24,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: '700',
  },
  rankingName: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
  },
  rankingRecord: {
    flexShrink: 0,
    fontSize: 11,
  },
  footerDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footer: {
    fontSize: 11,
    textAlign: 'center',
  },
});
