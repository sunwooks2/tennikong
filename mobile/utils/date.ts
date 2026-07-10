export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatMonthLabel(year: number, month: number): string {
  return `${year}년 ${month}월`;
}

export function formatDayLabel(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY_LABELS[date.getDay()]})`;
}

export interface CalendarCell {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function getCalendarCells(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month - 1, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayKey = toDateKey(new Date());
  const cells: CalendarCell[] = [];

  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i -= 1) {
    const day = prevMonthDays - i;
    const date = new Date(year, month - 2, day);
    cells.push({
      date,
      dateKey: toDateKey(date),
      isCurrentMonth: false,
      isToday: toDateKey(date) === todayKey,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month - 1, day);
    cells.push({
      date,
      dateKey: toDateKey(date),
      isCurrentMonth: true,
      isToday: toDateKey(date) === todayKey,
    });
  }

  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const date = new Date(last);
    date.setDate(date.getDate() + 1);
    cells.push({
      date,
      dateKey: toDateKey(date),
      isCurrentMonth: false,
      isToday: toDateKey(date) === todayKey,
    });
  }

  return cells;
}

export function addMonths(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const lastDay = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, '0');
  return {
    start: `${year}-${mm}-01`,
    end: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
  };
}
