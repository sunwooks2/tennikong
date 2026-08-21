import type { Match } from '@/types/database';
import type { MatchEntryInput, PlayerRoster } from '@/utils/matchForm';
import {
  createDefaultRoster,
  createEmptyEntry,
  getRosterSlotDisplayName,
  toLineupDisplayName,
} from '@/utils/matchForm';
import { sortRegistrationMatches } from '@/utils/matchDisplay';
import { getMatchGames } from '@/utils/matchNormalize';

function matchToEntryInput(match: Match, entryNumber: number, roster: PlayerRoster): MatchEntryInput {
  const games = getMatchGames(match);
  const game = games[0];

  return {
    entry_number: entryNumber,
    match_type: match.match_type,
    our_fore: rosterNameToLineupDisplay(roster, match.our_fore_name),
    our_back: rosterNameToLineupDisplay(roster, match.our_back_name),
    opponent_fore: rosterNameToLineupDisplay(roster, match.opponent_fore_name),
    opponent_back: rosterNameToLineupDisplay(roster, match.opponent_back_name),
    my_score: game ? String(game.my_score) : match.my_score != null ? String(match.my_score) : '',
    opponent_score:
      game ? String(game.opponent_score) : match.opponent_score != null ? String(match.opponent_score) : '',
  };
}

export function buildRoster(matches: Match[]): PlayerRoster {
  const myName = matches[0].my_name;
  const others: string[] = [];
  const seen = new Set<string>();

  for (const match of matches) {
    for (const name of [
      match.our_fore_name,
      match.our_back_name,
      match.opponent_fore_name,
      match.opponent_back_name,
    ]) {
      const trimmed = name?.trim();
      if (!trimmed || trimmed === myName.trim() || seen.has(trimmed)) continue;
      seen.add(trimmed);
      others.push(trimmed);
    }
  }

  return {
    player1: myName,
    player2: others[0] ?? '',
    player3: others[1] ?? '',
    player4: others[2] ?? '',
    extraPlayers: others.slice(3),
  };
}

function rosterNameToLineupDisplay(roster: PlayerRoster, name: string | null | undefined): string {
  const trimmed = name?.trim() ?? '';
  if (!trimmed) return '';

  for (const key of ['player1', 'player2', 'player3', 'player4'] as const) {
    const resolved = roster[key].trim() || getRosterSlotDisplayName(roster, key);
    if (trimmed === resolved) {
      return getRosterSlotDisplayName(roster, key);
    }
  }

  return toLineupDisplayName(trimmed, roster.player1);
}

export function registrationToFormValues(matches: Match[]): {
  matchDate: string;
  courtType: Match['court_type'];
  venueName?: string;
  memo?: string;
  roster: PlayerRoster;
  entryInputs: MatchEntryInput[];
  matchIds: string[];
  registrationId: string | null;
} {
  const orderedMatches = sortRegistrationMatches(matches);
  const primary = orderedMatches[0];
  const roster = buildRoster(orderedMatches);

  return {
    matchDate: primary.match_date,
    courtType: primary.court_type,
    venueName: primary.venue_name ?? undefined,
    memo: primary.memo ?? undefined,
    roster,
    entryInputs: orderedMatches.map((match, index) => matchToEntryInput(match, index + 1, roster)),
    matchIds: orderedMatches.map((match) => match.id),
    registrationId: primary.registration_id ?? null,
  };
}

export function matchToFormValues(match: Match) {
  return registrationToFormValues([match]);
}

export function createDefaultFormState(defaultMyName: string) {
  return {
    roster: createDefaultRoster(defaultMyName),
    entryInputs: [createEmptyEntry(1)],
  };
}
