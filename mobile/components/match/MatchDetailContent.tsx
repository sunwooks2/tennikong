import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import {
  COURT_TYPE_LABELS,
  MATCH_TYPE_LABELS,
} from '@/constants/labels';
import Colors from '@/constants/Colors';
import type { Match, MatchResult } from '@/types/database';
import { formatDayLabel } from '@/utils/date';
import { MY_ROSTER_LABEL, toLineupDisplayName } from '@/utils/matchForm';
import { sortRegistrationMatches } from '@/utils/matchDisplay';
import { getMatchGames } from '@/utils/matchNormalize';
import { getResultColor, getResultLabel } from '@/utils/resultDisplay';

interface MatchDetailContentProps {
  matches: Match[];
  colors: (typeof Colors)['light'];
}

interface MatchDisplayEntry {
  entryNumber: number;
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
  const tags = match.match_tags ?? [];
  const entries = buildMatchDisplayEntries(orderedMatches);
  const rosterNames = [
    MY_ROSTER_LABEL,
    match.partner_name?.trim() || '선수2',
    match.opponent1_name?.trim() || '-',
    match.opponent2_name?.trim() || '선수4',
  ];

  return (
    <View style={styles.container}>
      <FormRow label="선수" colors={colors} align="top">
        <View style={styles.rosterRow}>
          <View
            style={[
              styles.rosterMe,
              { borderColor: colors.tint, backgroundColor: `${colors.tint}18` },
            ]}>
            <Text style={[styles.rosterMeText, { color: colors.tint }]}>{rosterNames[0]}</Text>
          </View>
          {rosterNames.slice(1).map((name, index) => (
            <View
              key={index}
              style={[
                styles.rosterCell,
                { borderColor: colors.muted, backgroundColor: colors.card },
              ]}>
              <Text style={[styles.rosterCellText, { color: colors.text }]} numberOfLines={1}>
                {name}
              </Text>
            </View>
          ))}
        </View>
      </FormRow>

      <FormRow label="경기일" colors={colors}>
        <Text style={[styles.valueText, { color: colors.text }]}>
          {formatDayLabel(match.match_date)}
        </Text>
      </FormRow>

      <FormRow label="경기유형" colors={colors}>
        <ReadonlyChip label={MATCH_TYPE_LABELS[match.match_type]} colors={colors} />
      </FormRow>

      <FormRow label="코트종류" colors={colors}>
        <ReadonlyChip label={COURT_TYPE_LABELS[match.court_type]} colors={colors} />
      </FormRow>

      <FormRow label="경기장" colors={colors}>
        <Text style={[styles.valueText, { color: colors.text }]}>
          {match.venue_name?.trim() || '-'}
        </Text>
      </FormRow>

      <FormRow label="경기" colors={colors} align="top">
        <View style={styles.entries}>
          {entries.map((entry) => (
            <MatchEntryCard key={entry.entryNumber} entry={entry} colors={colors} />
          ))}
        </View>
      </FormRow>

      {match.memo ? (
        <FormRow label="메모" colors={colors} align="top">
          <Text style={[styles.memo, { color: colors.text }]}>{match.memo}</Text>
        </FormRow>
      ) : null}

      {tags.length > 0 ? (
        <FormRow label="태그" colors={colors} align="top">
          <View style={styles.tags}>
            {tags.map((tag) => (
              <View
                key={tag.tag_name}
                style={[styles.tag, { backgroundColor: `${colors.tint}22` }]}>
                <Text style={[styles.tagText, { color: colors.tint }]}>#{tag.tag_name}</Text>
              </View>
            ))}
          </View>
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
    <View
      style={[
        styles.slot,
        isMe
          ? { borderColor: colors.tint, backgroundColor: `${colors.tint}18` }
          : { borderColor: colors.muted, backgroundColor: colors.background },
      ]}>
      <Text style={[styles.slotPosition, { color: colors.muted }]}>{positionLabel}</Text>
      <Text
        style={[styles.slotValue, { color: isMe ? colors.tint : colors.text }]}
        numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ReadonlyChip({
  label,
  colors,
}: {
  label: string;
  colors: (typeof Colors)['light'];
}) {
  return (
    <View style={[styles.chip, { backgroundColor: colors.tint, borderColor: colors.tint }]}>
      <Text style={styles.chipText}>{label}</Text>
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
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rosterMeText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  rosterCell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rosterCellText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  entries: {
    gap: 8,
    width: '100%',
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 6,
    width: '100%',
    overflow: 'hidden',
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
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 2,
    paddingVertical: 6,
    alignItems: 'center',
    gap: 2,
  },
  slotPosition: {
    fontSize: 10,
    fontWeight: '600',
  },
  slotValue: {
    fontSize: 10,
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
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
