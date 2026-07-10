import type { MatchResult, MatchSet } from '@/types/database';

export function calculateMatchResult(sets: MatchSet[]): MatchResult | null {
  let myWins = 0;
  let opponentWins = 0;

  for (const set of sets) {
    if (set.my_score > set.opponent_score) myWins += 1;
    else if (set.my_score < set.opponent_score) opponentWins += 1;
  }

  if (myWins === opponentWins) return null;
  return myWins > opponentWins ? 'win' : 'loss';
}

export function formatSetScores(sets: MatchSet[]): string {
  return [...sets]
    .sort((a, b) => a.set_number - b.set_number)
    .map((s) => `${s.my_score}:${s.opponent_score}`)
    .join(', ');
}
