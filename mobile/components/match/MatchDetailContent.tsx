import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import {
  COURT_TYPE_LABELS,
  MATCH_TYPE_COLORS,
  MATCH_TYPE_LABELS,
} from '@/constants/labels';
import Colors from '@/constants/Colors';
import type { Match, MatchResult } from '@/types/database';
import { formatDayLabel } from '@/utils/date';
import { MY_ROSTER_LABEL, ROSTER_KEYS, getRosterSlotDisplayName, toLineupDisplayName } from '@/utils/matchForm';
import { sortRegistrationMatches } from '@/utils/matchDisplay';
import { computeRegistrationRanking } from '@/utils/matchRanking';
import { buildRoster } from '@/utils/matchToForm';
import { getMatchGames } from '@/utils/matchNormalize';
import { getResultColor, getResultLabel } from '@/utils/resultDisplay';

interface MatchDetailContentProps {
  matches: Match[];
  colors: (typeof Colors)['light'];
}

interface MatchDisplayEntry {
  entryNumber: number;
  matchType: Match['match_type'];
  ourFore: string;
  ourBack: string;
  opponentFore: string;
  opponentBack: string;
  myScore: number | null;
  opponentScore: number | null;
  result: MatchResult | null;
}

function buildMatchDisplayEntries(matches: Match[]): MatchDisplayEntry[] {
  return matches.map((match, index) => {
    const games = getMatchGames(match);
    const game = games[0];

    return {
      entryNumber: index + 1,
      matchType: match.match_type,
      ourFore: toLineupDisplayName(match.our_fore_name, match.my_name, '-'),
      ourBack: toLineupDisplayName(match.our_back_name, match.my_name, '-'),
      opponentFore: match.opponent_fore_name?.trim() || '-',
      opponentBack: match.opponent_back_name?.trim() || '-',
      myScore: game?.my_score ?? match.my_score,
      opponentScore: game?.opponent_score ?? match.opponent_score,
      result: game?.result ?? match.result ?? null,
    };
  });
}

export function MatchDetailContent({ matches, colors }: MatchDetailContentProps) {
  const orderedMatches = sortRegistrationMatches(matches);
  const match = orderedMatches[0];
  const entries = buildMatchDisplayEntries(orderedMatches);
  const roster = buildRoster(orderedMatches);
  const rosterNames = [
    MY_ROSTER_LABEL,
    ...ROSTER_KEYS.slice(1).map((key) => getRosterSlotDisplayName(roster, key)),
    ...roster.extraPlayers.filter((name) => name.trim().length > 0),
  ];

  return (
    <View style={styles.container}>
      <FormRow label="경기일" colors={colors}>
        <Text style={[styles.valueText, { color: colors.text }]}>
          {formatDayLabel(match.match_date)}
        </Text>
      </FormRow>

      <FormRow label="코트종류" colors={colors}>
        <Text style={[styles.valueText, { color: colors.text }]}>
          {COURT_TYPE_LABELS[match.court_type]}
        </Text>
      </FormRow>

      <FormRow label="선수" colors={colors} align="top">
        <View style={styles.rosterRow}>
          <View style={styles.rosterMe}>
            <Text style={[styles.rosterMeText, { color: colors.tint }]}>{rosterNames[0]}</Text>
          </View>
          {rosterNames.slice(1).map((name, index) => (
            <View key={index} style={styles.rosterCell}>
              <Text style={[styles.rosterCellText, { color: colors.text }]} numberOfLines={1}>
                {name}
              </Text>
            </View>
          ))}
        </View>
      </FormRow>

      <FormRow label="경기" colors={colors} align="top">
        <View style={styles.entries}>
          {entries.map((entry) => (
            <MatchEntryCard key={entry.entryNumber} entry={entry} colors={colors} />
          ))}
        </View>
      </FormRow>

      <FormRow label="순위" colors={colors} align="top">
        <RankingList matches={orderedMatches} colors={colors} />
      </FormRow>

      {match.memo ? (
        <FormRow label="메모" colors={colors} align="top">
          <Text style={[styles.memo, { color: colors.text }]}>{match.memo}</Text>
        </FormRow>
      ) : null}
    </View>
  );
}

function MatchEntryCard({
  entry,
  colors,
}: {
  entry: MatchDisplayEntry;
  colors: (typeof Colors)['light'];
}) {
  const resultColor = entry.result ? getResultColor(entry.result, colors) : colors.muted;
  const scoreText =
    entry.myScore !== null && entry.opponentScore !== null
      ? `${entry.myScore} : ${entry.opponentScore}`
      : '- : -';

  return (
    <View style={[styles.entryCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.entryIndex, { color: colors.muted }]}>{entry.entryNumber}</Text>
      <Text style={[styles.entryTypeText, { color: MATCH_TYPE_COLORS[entry.matchType] }]}>
        {MATCH_TYPE_LABELS[entry.matchType]}
      </Text>

      <View style={styles.lineupArea}>
        <View style={styles.slots}>
          <PlayerSlotDisplay positionLabel="포" value={entry.ourFore} colors={colors} />
          <PlayerSlotDisplay positionLabel="백" value={entry.ourBack} colors={colors} />
        </View>

        <Text style={[styles.vs, { color: colors.muted }]}>vs</Text>

        <View style={styles.slots}>
          <PlayerSlotDisplay positionLabel="포" value={entry.opponentFore} colors={colors} />
          <PlayerSlotDisplay positionLabel="백" value={entry.opponentBack} colors={colors} />
        </View>
      </View>

      <View style={[styles.scoreArea, { borderLeftColor: colors.muted }]}>
        <Text style={[styles.scoreText, { color: colors.text }]}>{scoreText}</Text>
        {entry.result ? (
          <Text style={[styles.result, { color: resultColor }]}>
            {getResultLabel(entry.result)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function RankingList({ matches, colors }: { matches: Match[]; colors: (typeof Colors)['light'] }) {
  const ranking = computeRegistrationRanking(matches);

  if (ranking.length === 0) return null;

  return (
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
  );
}

function PlayerSlotDisplay({
  positionLabel,
  value,
  colors,
}: {
  positionLabel: string;
  value: string;
  colors: (typeof Colors)['light'];
}) {
  const isMe = value === MY_ROSTER_LABEL;

  return (
    <View style={styles.slot}>
      <Text style={[styles.slotPosition, { color: colors.muted }]}>{positionLabel}</Text>
      <Text
        style={[styles.slotValue, { color: isMe ? colors.tint : colors.text }]}
        numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function FormRow({
  label,
  colors,
  children,
  align = 'center',
}: {
  label: string;
  colors: (typeof Colors)['light'];
  children: ReactNode;
  align?: 'center' | 'top';
}) {
  return (
    <View style={[styles.row, align === 'top' && styles.rowTop]}>
      <Text style={[styles.rowLabel, { color: colors.muted }]}>{label}</Text>
      <View style={styles.rowContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    padding: 12,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowTop: {
    alignItems: 'flex-start',
  },
  rowLabel: {
    width: 56,
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 0,
    paddingTop: 2,
  },
  rowContent: {
    flex: 1,
    minWidth: 0,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rosterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  rosterMe: {
    flex: 1,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rosterMeText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  rosterCell: {
    flex: 1,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rosterCellText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  entries: {
    gap: 8,
    width: '100%',
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 6,
    width: '100%',
  },
  entryTypeText: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 0,
  },
  entryIndex: {
    width: 14,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  lineupArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slots: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    gap: 4,
  },
  slot: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  slotPosition: {
    fontSize: 11,
    fontWeight: '600',
  },
  slotValue: {
    fontSize: 12,
    fontWeight: '700',
    maxWidth: '100%',
  },
  vs: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 2,
  },
  scoreArea: {
    flexShrink: 0,
    alignItems: 'center',
    gap: 2,
    paddingLeft: 8,
    marginLeft: 2,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
  },
  result: {
    fontSize: 11,
    fontWeight: '700',
  },
  memo: {
    fontSize: 14,
    lineHeight: 20,
  },
  rankingList: {
    gap: 4,
    width: '100%',
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankingPosition: {
    width: 28,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: '700',
  },
  rankingName: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
  },
  rankingRecord: {
    flexShrink: 0,
    fontSize: 12,
  },
});
