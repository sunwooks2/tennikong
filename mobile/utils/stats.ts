import { COURT_TYPE_LABELS, MATCH_TYPE_LABELS, POSITION_LABELS } from '@/constants/labels';
import { computeMonthlySummary } from '@/services/matches';
import type {
  CourtType,
  Match,
  MatchGame,
  MatchResult,
  MatchType,
  MonthlySummary,
  PositionType,
} from '@/types/database';
import { WEEKDAY_LABELS, parseDateKey } from '@/utils/date';
import { formatRosterPlayerNames } from '@/utils/matchDisplay';
import { getMatchGames } from '@/utils/matchNormalize';

export interface GameStats {
  total: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  loss_rate: number;
}

export interface LabeledStats extends GameStats {
  key: string;
  label: string;
}

export interface RecentGameItem {
  id: string;
  matchId: string;
  matchDate: string;
  matchType: MatchType;
  result: MatchResult;
  scoreLabel: string;
  title: string;
  sortKey: string;
}

export interface StatsSnapshot {
  monthly: MonthlySummary;
  byMatchType: LabeledStats[];
  byCourtType: LabeledStats[];
  byPartner: LabeledStats[];
  opponentsByWinRate: LabeledStats[];
  opponentsByLossRate: LabeledStats[];
  byPosition: LabeledStats[];
  byWeekday: LabeledStats[];
  recentGames: RecentGameItem[];
}

interface FlatGame {
  result: MatchResult;
  match: Match;
  game: MatchGame;
}

function emptyStats(): GameStats {
  return { total: 0, wins: 0, losses: 0, draws: 0, win_rate: 0, loss_rate: 0 };
}

function accumulateStats(stats: GameStats, result: MatchResult): GameStats {
  const next = {
    ...stats,
    total: stats.total + 1,
    wins: stats.wins + (result === 'win' ? 1 : 0),
    losses: stats.losses + (result === 'loss' ? 1 : 0),
    draws: stats.draws + (result === 'draw' ? 1 : 0),
  };

  return {
    ...next,
    win_rate: next.total > 0 ? Math.round((next.wins / next.total) * 100) : 0,
    loss_rate: next.total > 0 ? Math.round((next.losses / next.total) * 100) : 0,
  };
}

function flattenGames(matches: Match[]): FlatGame[] {
  return matches.flatMap((match) =>
    getMatchGames(match).map((game) => ({
      result: game.result,
      match,
      game,
    })),
  );
}

function groupGames(
  games: FlatGame[],
  getKey: (game: FlatGame) => string | null,
  getLabel: (key: string) => string,
  sortBy: 'total' | 'win_rate' | 'loss_rate' = 'total',
): LabeledStats[] {
  const map = new Map<string, GameStats & { label: string; key: string }>();

  for (const flatGame of games) {
    const key = getKey(flatGame);
    if (!key) continue;

    const current = map.get(key) ?? { ...emptyStats(), key, label: getLabel(key) };
    const accumulated = accumulateStats(current, flatGame.result);
    map.set(key, {
      ...accumulated,
      key: current.key,
      label: current.label,
    });
  }

  const items = [...map.values()].filter((item) => item.total > 0);

  if (sortBy === 'win_rate') {
    return items.sort((a, b) => b.win_rate - a.win_rate || b.total - a.total);
  }

  if (sortBy === 'loss_rate') {
    return items.sort((a, b) => b.loss_rate - a.loss_rate || b.total - a.total);
  }

  return items.sort((a, b) => b.total - a.total || b.win_rate - a.win_rate);
}

function groupGamesByNames(
  games: FlatGame[],
  getNames: (match: Match) => string[],
): LabeledStats[] {
  const map = new Map<string, GameStats & { label: string; key: string }>();

  for (const flatGame of games) {
    for (const name of getNames(flatGame.match)) {
      const current = map.get(name) ?? { ...emptyStats(), key: name, label: name };
      const accumulated = accumulateStats(current, flatGame.result);
      map.set(name, {
        ...accumulated,
        key: name,
        label: name,
      });
    }
  }

  return [...map.values()].filter((item) => item.total > 0);
}

function getPartnerKey(match: Match): string | null {
  const partner = match.partner_name?.trim();
  if (!partner) return null;
  return partner;
}

function getOpponentNames(match: Match): string[] {
  const names: string[] = [];
  const opponent1 = match.opponent1_name?.trim();
  const opponent2 = match.opponent2_name?.trim();

  if (opponent1) names.push(opponent1);
  if (opponent2 && opponent2 !== opponent1) names.push(opponent2);

  return names;
}

function topByWinRate(items: LabeledStats[], limit: number): LabeledStats[] {
  return [...items].sort((a, b) => b.win_rate - a.win_rate || b.total - a.total).slice(0, limit);
}

function topByLossRate(items: LabeledStats[], limit: number): LabeledStats[] {
  return [...items].sort((a, b) => b.loss_rate - a.loss_rate || b.total - a.total).slice(0, limit);
}

function getMyPosition(match: Match): PositionType | null {
  if (match.position === 'fore' || match.position === 'back') {
    return match.position;
  }

  const me = match.my_name.trim();
  if (match.our_fore_name?.trim() === me) return 'fore';
  if (match.our_back_name?.trim() === me) return 'back';
  return null;
}

function computeWeekdayStats(games: FlatGame[]): LabeledStats[] {
  const buckets = Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    stats: emptyStats(),
  }));

  for (const flatGame of games) {
    const weekday = parseDateKey(flatGame.match.match_date).getDay();
    buckets[weekday].stats = accumulateStats(buckets[weekday].stats, flatGame.result);
  }

  return buckets
    .map(({ weekday, stats }) => ({
      ...stats,
      key: `weekday-${weekday}`,
      label: WEEKDAY_LABELS[weekday],
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.wins - a.wins || b.total - a.total || b.win_rate - a.win_rate);
}

function computeRecentGames(matches: Match[], limit: number): RecentGameItem[] {
  const items: RecentGameItem[] = [];

  for (const match of matches) {
    const games = getMatchGames(match);
    for (const game of games) {
      items.push({
        id: `${match.id}:${game.game_number}`,
        matchId: match.id,
        matchDate: match.match_date,
        matchType: match.match_type,
        result: game.result,
        scoreLabel: `${game.my_score}:${game.opponent_score}`,
        title: formatRosterPlayerNames(match),
        sortKey: `${match.match_date}T${match.created_at}M${match.id}G${String(game.game_number).padStart(2, '0')}`,
      });
    }
  }

  return items.sort((a, b) => b.sortKey.localeCompare(a.sortKey)).slice(0, limit);
}

export function computeStats(matches: Match[], year: number, month: number): StatsSnapshot {
  const monthlyMatches = matches.filter((match) => {
    const [matchYear, matchMonth] = match.match_date.split('-').map(Number);
    return matchYear === year && matchMonth === month;
  });

  const allGames = flattenGames(matches);
  const partnerGames = allGames.filter((flatGame) => getPartnerKey(flatGame.match));
  const positionGames = allGames.filter((flatGame) => getMyPosition(flatGame.match));

  const partnerStats = groupGames(
    partnerGames,
    (flatGame) => getPartnerKey(flatGame.match),
    (key) => key,
  );
  const opponentStats = groupGamesByNames(allGames, getOpponentNames);

  return {
    monthly: computeMonthlySummary(year, month, monthlyMatches),
    byMatchType: groupGames(
      allGames,
      (flatGame) => flatGame.match.match_type ?? 'doubles',
      (key) => MATCH_TYPE_LABELS[key as MatchType],
    ),
    byCourtType: groupGames(
      allGames,
      (flatGame) => flatGame.match.court_type ?? 'other',
      (key) => COURT_TYPE_LABELS[key as CourtType],
    ),
    byPartner: topByWinRate(partnerStats, 5),
    opponentsByWinRate: topByWinRate(opponentStats, 4),
    opponentsByLossRate: topByLossRate(opponentStats, 5),
    byPosition: groupGames(
      positionGames,
      (flatGame) => getMyPosition(flatGame.match),
      (key) => POSITION_LABELS[key as PositionType],
    ).sort((a, b) => {
      if (a.key === 'fore' && b.key === 'back') return -1;
      if (a.key === 'back' && b.key === 'fore') return 1;
      return 0;
    }),
    byWeekday: computeWeekdayStats(allGames),
    recentGames: computeRecentGames(matches, 5),
  };
}

export function formatStatsRecord(stats: GameStats): string {
  return `${stats.wins}승 ${stats.losses}패 ${stats.draws}무`;
}

/** 나-상대 포지션 조합별(내포·상대포 / 내포·상대백 / 내백·상대포 / 내백·상대백) 전적 */
export interface PositionMatrix {
  foreFore: GameStats;
  foreBack: GameStats;
  backFore: GameStats;
  backBack: GameStats;
}

export interface PartnerOpponentHighlight {
  name: string;
  stats: GameStats;
  matrix: PositionMatrix;
}

export interface PartnerDetail {
  partner: string;
  overall: GameStats;
  byPosition: { fore: GameStats; back: GameStats };
  toughestOpponent: PartnerOpponentHighlight | null;
  bestOpponent: PartnerOpponentHighlight | null;
}

const MIN_OPPONENT_GAMES_FOR_HIGHLIGHT = 2;

function getOpponentPosition(match: Match, opponentName: string): PositionType | null {
  if (match.opponent_fore_name?.trim() === opponentName) return 'fore';
  if (match.opponent_back_name?.trim() === opponentName) return 'back';
  return null;
}

/** 특정 상대를 기준으로, 나-상대 포지션 조합별 전적 매트릭스를 계산 */
function computePositionMatrix(games: FlatGame[], opponentName: string): PositionMatrix {
  let foreFore = emptyStats();
  let foreBack = emptyStats();
  let backFore = emptyStats();
  let backBack = emptyStats();

  for (const flatGame of games) {
    const myPosition = getMyPosition(flatGame.match);
    const opponentPosition = getOpponentPosition(flatGame.match, opponentName);

    if (myPosition === 'fore' && opponentPosition === 'fore') {
      foreFore = accumulateStats(foreFore, flatGame.result);
    } else if (myPosition === 'fore' && opponentPosition === 'back') {
      foreBack = accumulateStats(foreBack, flatGame.result);
    } else if (myPosition === 'back' && opponentPosition === 'fore') {
      backFore = accumulateStats(backFore, flatGame.result);
    } else if (myPosition === 'back' && opponentPosition === 'back') {
      backBack = accumulateStats(backBack, flatGame.result);
    }
  }

  return { foreFore, foreBack, backFore, backBack };
}

/** 페어별 통계 — 많이 함께한 순(경기수 내림차순) 전체 목록 */
export function computePartnerList(matches: Match[]): LabeledStats[] {
  const allGames = flattenGames(matches);
  const partnerGames = allGames.filter((flatGame) => getPartnerKey(flatGame.match));

  return groupGames(
    partnerGames,
    (flatGame) => getPartnerKey(flatGame.match),
    (key) => key,
    'win_rate',
  );
}

/** 특정 파트너와 함께한 경기의 상세 통계 (포지션별 승률, 천적/최고 상대) */
export function computePartnerDetail(matches: Match[], partnerName: string): PartnerDetail {
  const partnerMatches = matches.filter((match) => getPartnerKey(match) === partnerName);
  const games = flattenGames(partnerMatches);

  let overall = emptyStats();
  let foreStats = emptyStats();
  let backStats = emptyStats();

  const opponentStats = new Map<string, GameStats>();

  for (const flatGame of games) {
    overall = accumulateStats(overall, flatGame.result);

    const position = getMyPosition(flatGame.match);
    if (position === 'fore') foreStats = accumulateStats(foreStats, flatGame.result);
    if (position === 'back') backStats = accumulateStats(backStats, flatGame.result);

    for (const name of getOpponentNames(flatGame.match)) {
      opponentStats.set(name, accumulateStats(opponentStats.get(name) ?? emptyStats(), flatGame.result));
    }
  }

  const toHighlight = (name: string, stats: GameStats): PartnerOpponentHighlight => ({
    name,
    stats,
    matrix: computePositionMatrix(games, name),
  });

  const opponents = [...opponentStats.entries()].filter(
    ([, stats]) => stats.total >= MIN_OPPONENT_GAMES_FOR_HIGHLIGHT,
  );

  let toughest: [string, GameStats] | null = null;
  let best: [string, GameStats] | null = null;

  for (const entry of opponents) {
    const [, stats] = entry;
    if (
      !toughest ||
      stats.loss_rate > toughest[1].loss_rate ||
      (stats.loss_rate === toughest[1].loss_rate && stats.total > toughest[1].total)
    ) {
      toughest = entry;
    }
    if (
      !best ||
      stats.win_rate > best[1].win_rate ||
      (stats.win_rate === best[1].win_rate && stats.total > best[1].total)
    ) {
      best = entry;
    }
  }

  return {
    partner: partnerName,
    overall,
    byPosition: { fore: foreStats, back: backStats },
    toughestOpponent: toughest ? toHighlight(toughest[0], toughest[1]) : null,
    bestOpponent: best ? toHighlight(best[0], best[1]) : null,
  };
}

export interface OpponentDetail {
  opponent: string;
  overall: GameStats;
  matrix: PositionMatrix;
}

/** 특정 상대와 붙었을 때의 상세 통계 — 나-상대 포지션 조합별 승률 */
export function computeOpponentDetail(matches: Match[], opponentName: string): OpponentDetail {
  const opponentMatches = matches.filter((match) => getOpponentNames(match).includes(opponentName));
  const games = flattenGames(opponentMatches);

  let overall = emptyStats();
  for (const flatGame of games) {
    overall = accumulateStats(overall, flatGame.result);
  }

  return {
    opponent: opponentName,
    overall,
    matrix: computePositionMatrix(games, opponentName),
  };
}

export interface PositionOpponentStats {
  byWinRate: LabeledStats[];
  byLossRate: LabeledStats[];
}

/** 내가 포/백일 때, 상대별 승률 높은 순 · 패율 높은 순 랭킹 */
export function computePositionOpponentStats(
  matches: Match[],
  position: PositionType,
): PositionOpponentStats {
  const allGames = flattenGames(matches);
  const positionGames = allGames.filter((flatGame) => getMyPosition(flatGame.match) === position);
  const opponentStats = groupGamesByNames(positionGames, getOpponentNames);

  return {
    byWinRate: topByWinRate(opponentStats, 5),
    byLossRate: topByLossRate(opponentStats, 5),
  };
}

/** 내가 포/백일 때, 페어별 승률 높은 순 랭킹 */
export function computePositionPartnerStats(matches: Match[], position: PositionType): LabeledStats[] {
  const allGames = flattenGames(matches);
  const positionGames = allGames.filter(
    (flatGame) => getMyPosition(flatGame.match) === position && getPartnerKey(flatGame.match),
  );
  const partnerStats = groupGames(
    positionGames,
    (flatGame) => getPartnerKey(flatGame.match),
    (key) => key,
  );

  return topByWinRate(partnerStats, 5);
}
