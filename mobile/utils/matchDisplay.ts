import type { Match } from '@/types/database';
import { MY_ROSTER_LABEL, toLineupDisplayName } from '@/utils/matchForm';
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

/** 포·백·포·백 순서(우리팀 포, 우리팀 백, 상대팀 포, 상대팀 백)로 참가자를 나열한다 */
export function formatRosterPlayerNames(match: Match): string {
  return [
    toLineupDisplayName(match.our_fore_name, match.my_name) || MY_ROSTER_LABEL,
    toLineupDisplayName(match.our_back_name, match.my_name),
    match.opponent_fore_name?.trim() ?? '',
    match.opponent_back_name?.trim() ?? '',
  ]
    .filter((name) => name.length > 0)
    .join('·');
}

/** 등록(registration) 전체에 등장하는 모든 참가자를 등장 순서대로 나열한다 (경기마다 다른 선수가 뛴 경우 대비) */
export function formatRegistrationParticipants(matches: Match[]): string {
  const myName = matches[0]?.my_name.trim() ?? '';
  const seen = new Set<string>();
  const names: string[] = [MY_ROSTER_LABEL];
  if (myName) seen.add(myName);

  for (const match of matches) {
    for (const raw of [
      match.our_fore_name,
      match.our_back_name,
      match.opponent_fore_name,
      match.opponent_back_name,
    ]) {
      const trimmed = raw?.trim();
      if (!trimmed || seen.has(trimmed)) continue;
      seen.add(trimmed);
      names.push(trimmed);
    }
  }

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
  // registration_id가 있으면 그걸로 정확하게 묶는다. 상대팀도 경기마다 포/백이
  // 바뀔 수 있어서, 참가자 이름 문자열(fingerprint)만으로는 같은 등록의 경기를
  // 다른 등록으로 잘못 쪼갤 수 있다 — 레거시 데이터(등록 아이디가 없는 경우)에만
  // fingerprint로 폴백한다.
  return match.registration_id ?? getRegistrationFingerprint(match);
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

/** 이 경기(entry) 하나의 라인업을 "우리팀 vs 상대팀" 형태로 반환한다 (포·백 순서, '나' 표시 적용) */
export function formatEntryLineupTeams(match: Match): string {
  const ourFore = toLineupDisplayName(match.our_fore_name, match.my_name) || MY_ROSTER_LABEL;
  const ourBack = toLineupDisplayName(match.our_back_name, match.my_name);
  const oppFore = match.opponent_fore_name?.trim() ?? '';
  const oppBack = match.opponent_back_name?.trim() ?? '';

  const ourTeam = [ourFore, ourBack].filter(Boolean).join('·');
  const oppTeam = [oppFore, oppBack].filter(Boolean).join('·');

  return `${ourTeam} vs ${oppTeam}`;
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
