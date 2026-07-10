import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import {
  computeMonthlySummary,
  fetchAllMatches,
  fetchMatchesForMonth,
  getMatchCountByDate,
  getMatchesForDate,
} from '@/services/matches';
import type { Match, MonthlySummary } from '@/types/database';
import { addMonths, toDateKey } from '@/utils/date';
import { computeStreakStats, type StreakStats } from '@/utils/growth';

interface UseCalendarMonthOptions {
  enabled: boolean;
}

export function useCalendarMonth({ enabled }: UseCalendarMonthOptions) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));
  const [matches, setMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMonth = useCallback(async () => {
    if (!enabled) {
      setMatches([]);
      setAllMatches([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const [monthResult, allResult] = await Promise.all([
      fetchMatchesForMonth(year, month),
      fetchAllMatches(),
    ]);

    if (monthResult.error) {
      setError(monthResult.error.message);
      setMatches([]);
    } else {
      setMatches((monthResult.data as Match[]) ?? []);
    }

    if (allResult.error) {
      setAllMatches([]);
    } else {
      setAllMatches((allResult.data as Match[]) ?? []);
    }

    setLoading(false);
  }, [enabled, year, month]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  useFocusEffect(
    useCallback(() => {
      loadMonth();
    }, [loadMonth]),
  );

  const summary: MonthlySummary = useMemo(
    () => computeMonthlySummary(year, month, matches),
    [year, month, matches],
  );

  const streaks: StreakStats = useMemo(
    () => computeStreakStats(allMatches),
    [allMatches],
  );

  const matchCountByDate = useMemo(() => getMatchCountByDate(matches), [matches]);

  const selectedMatches = useMemo(
    () => getMatchesForDate(matches, selectedDate),
    [matches, selectedDate],
  );

  const goToPreviousMonth = useCallback(() => {
    const next = addMonths(year, month, -1);
    setYear(next.year);
    setMonth(next.month);
  }, [year, month]);

  const goToNextMonth = useCallback(() => {
    const next = addMonths(year, month, 1);
    setYear(next.year);
    setMonth(next.month);
  }, [year, month]);

  const goToToday = useCallback(() => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setSelectedDate(toDateKey(now));
  }, []);

  const selectDate = useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
  }, []);

  return {
    year,
    month,
    selectedDate,
    summary,
    streaks,
    matchCountByDate,
    selectedMatches,
    loading,
    error,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    selectDate,
    refresh: loadMonth,
  };
}
