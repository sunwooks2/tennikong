import type { Match } from '@/types/database';
import { MY_ROSTER_LABEL } from '@/utils/matchForm';
import { getMatchGames } from '@/utils/matchNormalize';

export function formatMyTeam(match: Match): string {
  if (match.our_fore_name && match.our_back_name) {
    return `${match.our_fore_name}·${match.our_back_name}`;
  }
  if (match.partner_name) {
    return `${match.my_name}·${match.partner_name}`;
  }
  return match.my_name;
}

export function formatOpponentTeam(match: Match): string {
  if (match.opponent_fore_name && match.opponent_back_name) {
    return `${match.opponent_fore_name}·${match.opponent_back_name}`;
  }
  if (match.opponent2_name) {
    return `${match.opponent1_name}·${match.opponent2_name}`;
  }
  return match.opponent1_name;
}

export function formatMatchTitle(match: Match): string {
  return `${formatMyTeam(match)} VS ${formatOpponentTeam(match)}`;
}

export function formatRosterPlayerNames(match: Match): string {
  const names = [
    MY_ROSTER_LABEL,
    match.partner_name?.trim() || '선수2',
    match.opponent1_name?.trim() || '-',
    match.opponent2_name?.trim() || '선수4',
  ];

  return names.join('·');
}

export function summarizeRegistrationResults(matches: Match[]) {
  const games = matches.flatMap((match) => getMatchGames(match));

  return {
    wins: games.filter((game) => game.result === 'win').length,
    losses: games.filter((game) => game.result === 'loss').length,
    draws: games.filter((game) => game.result === 'draw').length,
  };
}

export function formatRegistrationRecord(
  wins: number,
  losses: number,
  draws: number,
): string {
  return `${wins}승 ${losses}패 ${draws}무`;
}

export function formatRosterTitle(match: Match): string {
  const myTeam = match.partner_name?.trim()
    ? `${MY_ROSTER_LABEL}·${match.partner_name.trim()}`
    : MY_ROSTER_LABEL;
  const oppTeam = match.opponent2_name?.trim()
    ? `${match.opponent1_name.trim()}·${match.opponent2_name.trim()}`
    : match.opponent1_name.trim();
  return `${myTeam} VS ${oppTeam}`;
}

function normalizeRosterKey(match: Match): string {
  return [
    match.my_name.trim(),
    (match.partner_name ?? '').trim(),
    match.opponent1_name.trim(),
    (match.opponent2_name ?? '').trim(),
  ].join('|');
}

export function getRegistrationFingerprint(match: Match): string {
  return [
    match.match_date,
    match.match_type,
    normalizeRosterKey(match),
    (match.venue_name ?? '').trim(),
    (match.memo ?? '').trim(),
  ].join('|');
}

export function getRegistrationGroupKey(match: Match): string {
  return getRegistrationFingerprint(match);
}

export function sortRegistrationMatches(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => {
    const orderA = a.registration_order;
    const orderB = b.registration_order;

    if (orderA != null && orderB != null && orderA !== orderB) {
      return orderA - orderB;
    }

    const timeDiff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (timeDiff !== 0) {
      return timeDiff;
    }

    return a.id.localeCompare(b.id);
  });
}

export function groupMatchesByRegistration(matches: Match[]): Match[][] {
  if (matches.length === 0) return [];

  const sorted = sortRegistrationMatches(matches);

  const groups = new Map<string, Match[]>();

  for (const match of sorted) {
    const key = getRegistrationGroupKey(match);
    const group = groups.get(key);

    if (group) {
      group.push(match);
    } else {
      groups.set(key, [match]);
    }
  }

  return [...groups.values()].map((group) => sortRegistrationMatches(group));
}

export function formatLineupSummary(match: Match): string | null {
  if (
    !match.our_fore_name ||
    !match.our_back_name ||
    !match.opponent_fore_name ||
    !match.opponent_back_name
  ) {
    return null;
  }

  return `우리 ${match.our_fore_name}/${match.our_back_name} · 상대 ${match.opponent_fore_name}/${match.opponent_back_name}`;
}
