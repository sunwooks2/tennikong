import type { Match } from '@/types/database';
import type { MatchEntryInput, PlayerRoster } from '@/utils/matchForm';
import {
  createDefaultRoster,
  createEmptyEntry,
  toLineupDisplayName,
} from '@/utils/matchForm';
import { sortRegistrationMatches } from '@/utils/matchDisplay';
import { getMatchGames } from '@/utils/matchNormalize';

function matchToEntryInput(match: Match, entryNumber: number): MatchEntryInput {
  const games = getMatchGames(match);
  const game = games[0];

  return {
    entry_number: entryNumber,
    our_fore: toLineupDisplayName(match.our_fore_name, match.my_name),
    our_back: toLineupDisplayName(match.our_back_name, match.my_name),
    opponent_fore: match.opponent_fore_name ?? '',
    opponent_back: match.opponent_back_name ?? '',
    my_score: game ? String(game.my_score) : match.my_score != null ? String(match.my_score) : '',
    opponent_score:
      game ? String(game.opponent_score) : match.opponent_score != null ? String(match.opponent_score) : '',
  };
}

function buildRoster(match: Match): PlayerRoster {
  return {
    player1: match.my_name,
    player2: match.partner_name ?? '',
    player3: match.opponent1_name,
    player4: match.opponent2_name ?? '',
  };
}

export function registrationToFormValues(matches: Match[]): {
  matchDate: string;
  matchType: Match['match_type'];
  courtType: Match['court_type'];
  venueName?: string;
  memo?: string;
  tags: string[];
  roster: PlayerRoster;
  entryInputs: MatchEntryInput[];
  matchIds: string[];
  registrationId: string | null;
} {
  const orderedMatches = sortRegistrationMatches(matches);
  const primary = orderedMatches[0];

  return {
    matchDate: primary.match_date,
    matchType: primary.match_type,
    courtType: primary.court_type,
    venueName: primary.venue_name ?? undefined,
    memo: primary.memo ?? undefined,
    tags: (primary.match_tags ?? []).map((tag) => tag.tag_name),
    roster: buildRoster(primary),
    entryInputs: orderedMatches.map((match, index) => matchToEntryInput(match, index + 1)),
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
