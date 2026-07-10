import type { Match } from '@/types/database';
import { isDoublesMatch } from '@/constants/labels';

export function formatMyTeam(match: Match): string {
  if (isDoublesMatch(match.match_type) && match.partner_name) {
    return `${match.my_name}·${match.partner_name}`;
  }
  return match.my_name;
}

export function formatOpponentTeam(match: Match): string {
  if (isDoublesMatch(match.match_type) && match.opponent2_name) {
    return `${match.opponent1_name}·${match.opponent2_name}`;
  }
  return match.opponent1_name;
}

export function formatMatchTitle(match: Match): string {
  return `${formatMyTeam(match)} VS ${formatOpponentTeam(match)}`;
}
