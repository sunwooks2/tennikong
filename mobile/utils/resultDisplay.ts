import { RESULT_LABELS } from '@/constants/labels';
import Colors from '@/constants/Colors';
import type { MatchResult } from '@/types/database';

export function getResultColor(
  result: MatchResult | null,
  colors: (typeof Colors)['light'],
): string {
  if (!result) return colors.muted;
  if (result === 'win') return colors.win;
  if (result === 'loss') return colors.loss;
  return colors.draw;
}

export function getResultLabel(result: MatchResult | null): string {
  if (!result) return '입력 중';
  return RESULT_LABELS[result];
}
