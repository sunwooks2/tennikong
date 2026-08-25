import type { Match, MatchResult } from '@/types/database';
import { MY_ROSTER_LABEL, toLineupDisplayName } from '@/utils/matchForm';
import { getMatchGames } from '@/utils/matchNormalize';

export interface PlayerRankingRow {
  name: string;
  isMe: boolean;
  wins: number;
  losses: number;
  draws: number;
  scoreDiff: number;
}

function resolveEntryOutcome(match: Match): {
  result: MatchResult | null;
  myScore: number | null;
  opponentScore: number | null;
} {
  const games = getMatchGames(match);
  const game = games[0];
  return {
    result: game?.result ?? match.result ?? null,
    myScore: game?.my_score ?? match.my_score,
    opponentScore: game?.opponent_score ?? match.opponent_score,
  };
}

function applyOutcome(row: PlayerRankingRow, result: MatchResult, diff: number) {
  if (result === 'win') row.wins += 1;
  else if (result === 'loss') row.losses += 1;
  else row.draws += 1;
  row.scoreDiff += diff;
}

/**
 * 등록(registration)에 속한 경기들을 합산해 선수별 순위를 낸다.
 * 우선순위: 승 횟수 → 점수차 합계. '나'는 isMe로 표시된다.
 */
export function computeRegistrationRanking(matches: Match[]): PlayerRankingRow[] {
  const rows = new Map<string, PlayerRankingRow>();

  const ensure = (rawName: string | null | undefined): PlayerRankingRow | null => {
    const name = rawName?.trim();
    if (!name) return null;
    let row = rows.get(name);
    if (!row) {
      row = { name, isMe: name === MY_ROSTER_LABEL, wins: 0, losses: 0, draws: 0, scoreDiff: 0 };
      rows.set(name, row);
    }
    return row;
  };

  for (const match of matches) {
    const { result, myScore, opponentScore } = resolveEntryOutcome(match);
    if (!result || myScore == null || opponentScore == null) continue;

    const diff = myScore - opponentScore;
    const oppResult: MatchResult = result === 'win' ? 'loss' : result === 'loss' ? 'win' : 'draw';

    const ourFore = toLineupDisplayName(match.our_fore_name, match.my_name) || MY_ROSTER_LABEL;
    const ourBack = toLineupDisplayName(match.our_back_name, match.my_name);

    for (const name of [ourFore, ourBack]) {
      const row = ensure(name);
      if (row) applyOutcome(row, result, diff);
    }
    for (const name of [match.opponent_fore_name, match.opponent_back_name]) {
      const row = ensure(name);
      if (row) applyOutcome(row, oppResult, -diff);
    }
  }

  return [...rows.values()].sort((a, b) => b.wins - a.wins || b.scoreDiff - a.scoreDiff);
}
