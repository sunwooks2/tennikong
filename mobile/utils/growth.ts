import { computeMonthlySummary } from '@/services/matches';
import type { Match, MatchResult } from '@/types/database';
import { getMatchGames } from '@/utils/matchNormalize';
import type { GameStats, LabeledStats } from '@/utils/stats';

export interface StreakStats {
  current_win: number;
  best_win: number;
  current_loss: number;
  best_loss: number;
}

export interface MonthlyTrendPoint {
  key: string;
  year: number;
  month: number;
  label: string;
  total: number;
  win_rate: number;
}

export interface PartnerCompatibility {
  key: string;
  label: string;
  total: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  stars: number;
  comment: string;
}

export interface GrowthSnapshot {
  streaks: StreakStats;
  monthlyTrend: MonthlyTrendPoint[];
  partners: PartnerCompatibility[];
  nemesis: LabeledStats[];
  confident: LabeledStats[];
}

interface ChronologicalGame {
  result: MatchResult;
  sortKey: string;
}

const MIN_OPPONENT_GAMES = 3;
const MONTHLY_TREND_COUNT = 6;
const PARTNER_LIMIT = 3;
const OPPONENT_LIMIT = 3;

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

function getChronologicalGames(matches: Match[]): ChronologicalGame[] {
  const items: ChronologicalGame[] = [];

  for (const match of matches) {
    for (const game of getMatchGames(match)) {
      items.push({
        result: game.result,
        sortKey: `${match.match_date}T${match.created_at}M${match.id}G${String(game.game_number).padStart(2, '0')}`,
      });
    }
  }

  return items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

function computeStreaks(games: ChronologicalGame[]): StreakStats {
  let bestWin = 0;
  let bestLoss = 0;
  let runWin = 0;
  let runLoss = 0;

  for (const game of games) {
    if (game.result === 'win') {
      runWin += 1;
      runLoss = 0;
      bestWin = Math.max(bestWin, runWin);
    } else if (game.result === 'loss') {
      runLoss += 1;
      runWin = 0;
      bestLoss = Math.max(bestLoss, runLoss);
    } else {
      runWin = 0;
      runLoss = 0;
    }
  }

  let currentWin = 0;
  let currentLoss = 0;
  const recent = [...games].reverse();

  if (recent[0]?.result === 'win') {
    for (const game of recent) {
      if (game.result !== 'win') break;
      currentWin += 1;
    }
  } else if (recent[0]?.result === 'loss') {
    for (const game of recent) {
      if (game.result !== 'loss') break;
      currentLoss += 1;
    }
  }

  return {
    current_win: currentWin,
    best_win: bestWin,
    current_loss: currentLoss,
    best_loss: bestLoss,
  };
}

function buildMonthlyTrend(matches: Match[]): MonthlyTrendPoint[] {
  const today = new Date();
  const points: MonthlyTrendPoint[] = [];

  for (let offset = MONTHLY_TREND_COUNT - 1; offset >= 0; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthMatches = matches.filter((match) => {
      const [matchYear, matchMonth] = match.match_date.split('-').map(Number);
      return matchYear === year && matchMonth === month;
    });
    const summary = computeMonthlySummary(year, month, monthMatches);

    points.push({
      key: `${year}-${month}`,
      year,
      month,
      label: `${month}월`,
      total: summary.total,
      win_rate: summary.win_rate,
    });
  }

  return points;
}

function getPartnerName(match: Match): string | null {
  const partner = match.partner_name?.trim();
  return partner || null;
}

function getOpponentNames(match: Match): string[] {
  const names: string[] = [];
  const opponent1 = match.opponent1_name?.trim();
  const opponent2 = match.opponent2_name?.trim();

  if (opponent1) names.push(opponent1);
  if (opponent2 && opponent2 !== opponent1) names.push(opponent2);

  return names;
}

function getPartnerStars(winRate: number, total: number): number {
  if (total < 2) return Math.max(1, Math.min(5, Math.round(winRate / 20) || 1));
  if (winRate >= 70) return 5;
  if (winRate >= 60) return 4;
  if (winRate >= 50) return 3;
  if (winRate >= 40) return 2;
  return 1;
}

function getPartnerComment(winRate: number, total: number): string {
  if (total < 3) return '아직 표본이 적어요';
  if (winRate >= 70) return '환상의 페어';
  if (winRate >= 60) return '찰떡궁합';
  if (winRate >= 50) return '호흡이 좋아요';
  if (winRate >= 40) return '함께 성장 중';
  return '연습이 더 필요해요';
}

function computePartnerCompatibility(matches: Match[]): PartnerCompatibility[] {
  const map = new Map<string, GameStats & { label: string; key: string }>();

  for (const match of matches) {
    const partner = getPartnerName(match);
    if (!partner) continue;

    for (const game of getMatchGames(match)) {
      const current = map.get(partner) ?? { ...emptyStats(), key: partner, label: partner };
      const accumulated = accumulateStats(current, game.result);
      map.set(partner, { ...accumulated, key: partner, label: partner });
    }
  }

  return [...map.values()]
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total || b.win_rate - a.win_rate)
    .slice(0, PARTNER_LIMIT)
    .map((item) => ({
      key: item.key,
      label: item.label,
      total: item.total,
      wins: item.wins,
      losses: item.losses,
      draws: item.draws,
      win_rate: item.win_rate,
      stars: getPartnerStars(item.win_rate, item.total),
      comment: getPartnerComment(item.win_rate, item.total),
    }));
}

function computeOpponentStats(matches: Match[]): LabeledStats[] {
  const map = new Map<string, GameStats & { label: string; key: string }>();

  for (const match of matches) {
    for (const name of getOpponentNames(match)) {
      for (const game of getMatchGames(match)) {
        const current = map.get(name) ?? { ...emptyStats(), key: name, label: name };
        const accumulated = accumulateStats(current, game.result);
        map.set(name, { ...accumulated, key: name, label: name });
      }
    }
  }

  return [...map.values()].filter((item) => item.total >= MIN_OPPONENT_GAMES);
}

export function computeStreakStats(matches: Match[]): StreakStats {
  return computeStreaks(getChronologicalGames(matches));
}

export function computeGrowth(matches: Match[]): GrowthSnapshot {
  const games = getChronologicalGames(matches);
  const opponentStats = computeOpponentStats(matches);

  return {
    streaks: computeStreaks(games),
    monthlyTrend: buildMonthlyTrend(matches),
    partners: computePartnerCompatibility(matches),
    nemesis: [...opponentStats]
      .sort((a, b) => b.loss_rate - a.loss_rate || b.total - a.total)
      .slice(0, OPPONENT_LIMIT),
    confident: [...opponentStats]
      .sort((a, b) => b.win_rate - a.win_rate || b.total - a.total)
      .slice(0, OPPONENT_LIMIT),
  };
}

export function formatStars(stars: number): string {
  return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}
