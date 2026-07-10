import type { MatchSet, MatchType } from '@/types/database';
import { isDoublesMatch } from '@/constants/labels';
import { calculateMatchResult } from '@/utils/matchResult';

export interface SetScoreInput {
  set_number: number;
  my_score: string;
  opponent_score: string;
}

export function createEmptySet(setNumber: number): SetScoreInput {
  return { set_number: setNumber, my_score: '', opponent_score: '' };
}

export function parseSets(inputs: SetScoreInput[]): MatchSet[] {
  return inputs.map((set, index) => ({
    set_number: index + 1,
    my_score: Number.parseInt(set.my_score, 10),
    opponent_score: Number.parseInt(set.opponent_score, 10),
  }));
}

export function validateMatchForm(params: {
  match_date: string;
  match_type: MatchType;
  my_name: string;
  partner_name: string;
  opponent1_name: string;
  opponent2_name: string;
  memo: string;
  setInputs: SetScoreInput[];
}): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.match_date)) {
    return '경기일 형식이 올바르지 않습니다. (YYYY-MM-DD)';
  }

  if (!params.my_name.trim()) return '내 이름을 입력해 주세요.';
  if (!params.opponent1_name.trim()) return '상대1 이름을 입력해 주세요.';

  if (isDoublesMatch(params.match_type)) {
    if (!params.partner_name.trim()) return '페어 이름을 입력해 주세요.';
    if (!params.opponent2_name.trim()) return '상대2 이름을 입력해 주세요.';
  }

  if (params.memo.length > 200) return '메모는 200자 이하여야 합니다.';

  if (params.setInputs.length === 0) return '최소 1세트 점수를 입력해 주세요.';

  for (const [index, set] of params.setInputs.entries()) {
    const my = Number.parseInt(set.my_score, 10);
    const opp = Number.parseInt(set.opponent_score, 10);
    if (Number.isNaN(my) || Number.isNaN(opp)) {
      return `세트 ${index + 1} 점수를 입력해 주세요.`;
    }
    if (my < 0 || opp < 0) return `세트 ${index + 1} 점수는 0 이상이어야 합니다.`;
    if (my === opp) return `세트 ${index + 1}은 동점일 수 없습니다.`;
  }

  const sets = parseSets(params.setInputs);
  if (!calculateMatchResult(sets)) {
    return '전체 승패를 결정할 수 없습니다. 세트 점수를 확인해 주세요.';
  }

  return null;
}

export function normalizeTag(raw: string): string {
  return raw.trim().replace(/^#+/, '');
}
