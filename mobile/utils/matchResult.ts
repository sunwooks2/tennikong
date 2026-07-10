import { RESULT_LABELS } from '@/constants/labels';
import type { MatchGame, MatchResult } from '@/types/database';

export function calculateGameResult(myScore: number, opponentScore: number): MatchResult {
  if (myScore > opponentScore) return 'win';
  if (myScore < opponentScore) return 'loss';
  return 'draw';
}

export function getGameResultFromInputs(
  myScore: string,
  opponentScore: string,
): MatchResult | null {
  const my = myScore.trim();
  const opp = opponentScore.trim();
  if (!my || !opp) return null;

  const myNum = Number.parseInt(my, 10);
  const oppNum = Number.parseInt(opp, 10);
  if (Number.isNaN(myNum) || Number.isNaN(oppNum)) return null;

  return calculateGameResult(myNum, oppNum);
}

export function calculateSessionResult(games: MatchGame[]): MatchResult {
  let wins = 0;
  let losses = 0;

  for (const game of games) {
    if (game.result === 'win') wins += 1;
    else if (game.result === 'loss') losses += 1;
  }

  if (wins === losses) return 'draw';
  return wins > losses ? 'win' : 'loss';
}

export function formatGameScore(game: MatchGame): string {
  return `${game.my_score}:${game.opponent_score}`;
}

export function formatGameLabel(game: MatchGame): string {
  return `${formatGameScore(game)} (${RESULT_LABELS[game.result]})`;
}

export function formatGameResults(games: MatchGame[]): string {
  return [...games]
    .sort((a, b) => a.game_number - b.game_number)
    .map((game) => formatGameLabel(game))
    .join(' · ');
}

export function formatGameSummary(games: MatchGame[]): string {
  const wins = games.filter((game) => game.result === 'win').length;
  const losses = games.filter((game) => game.result === 'loss').length;
  const draws = games.filter((game) => game.result === 'draw').length;
  const parts: string[] = [];

  if (wins > 0) parts.push(`${wins}승`);
  if (losses > 0) parts.push(`${losses}패`);
  if (draws > 0) parts.push(`${draws}무`);

  return parts.length > 0 ? parts.join(' ') : '-';
}
