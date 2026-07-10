import type { CourtType, MatchResult, MatchType, PositionType } from '@/types/database';

export const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  mens_doubles: '남복',
  womens_doubles: '여복',
  mixed: '혼복',
  doubles: '복식',
  singles: '단식',
};

export const COURT_TYPE_LABELS: Record<CourtType, string> = {
  hard: '하드',
  clay: '클레이',
  artificial_grass: '인조잔디',
  indoor: '실내',
  other: '기타',
};

/** 등록/수정 폼에 표시할 코트 종류 */
export const COURT_TYPE_FORM_OPTIONS = ['hard', 'clay', 'artificial_grass'] as const satisfies readonly CourtType[];

export const POSITION_LABELS: Record<PositionType, string> = {
  fore: '포',
  back: '백',
};

export const RESULT_LABELS: Record<MatchResult, string> = {
  win: '승',
  loss: '패',
  draw: '무',
};

export function isDoublesMatch(type: MatchType): boolean {
  return type !== 'singles';
}
