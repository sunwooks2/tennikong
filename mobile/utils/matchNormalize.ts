import type { Match, MatchGame, MatchResult } from '@/types/database';
import { calculateGameResult } from '@/utils/matchResult';

export function getMatchGames(match: Match): MatchGame[] {
  if (match.match_games && match.match_games.length > 0) {
    return [...match.match_games].sort((a, b) => a.game_number - b.game_number);
  }

  if (match.my_score !== null && match.my_score !== undefined &&
      match.opponent_score !== null && match.opponent_score !== undefined) {
    return [
      {
        game_number: 1,
        my_score: match.my_score,
        opponent_score: match.opponent_score,
        result: match.result,
      },
    ];
  }

  return [];
}

export function getPrimaryGameResult(match: Match): MatchResult {
  const games = getMatchGames(match);
  if (games.length > 0) return games[0].result;
  return match.result;
}

export function getPrimaryGameScore(match: Match): string | null {
  const games = getMatchGames(match);
  if (games.length === 0) return null;
  const game = games[0];
  return `${game.my_score}:${game.opponent_score}`;
}

export function syncMatchResultFromScores(
  myScore: number,
  opponentScore: number,
): MatchResult {
  return calculateGameResult(myScore, opponentScore);
}
