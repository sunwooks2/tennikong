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
  topVenues: LabeledStats[];
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
  const venueGames = allGames.filter((flatGame) => flatGame.match.venue_name?.trim());

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
    topVenues: groupGames(
      venueGames,
      (flatGame) => flatGame.match.venue_name!.trim(),
      (key) => key,
    ).slice(0, 5),
    recentGames: computeRecentGames(matches, 20),
  };
}

export function formatStatsRecord(stats: GameStats): string {
  return `${stats.wins}승 ${stats.losses}패 ${stats.draws}무`;
}
