export type BeanTone = 'lime' | 'green' | 'default' | 'black';

/** 누적(lifetime) 경기수 → 콩 색깔 단계. 캘린더 스탬프(일별 기준)와는 별개 기준이다. */
export function lifetimeBeanTone(totalCount: number): BeanTone {
  if (totalCount >= 60) return 'black';
  if (totalCount >= 30) return 'default';
  if (totalCount >= 10) return 'green';
  return 'lime';
}
