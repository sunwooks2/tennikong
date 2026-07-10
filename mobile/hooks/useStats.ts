import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { fetchAllMatches } from '@/services/matches';
import type { Match } from '@/types/database';
import { addMonths } from '@/utils/date';
import { computeStats, type StatsSnapshot } from '@/utils/stats';

interface UseStatsOptions {
  enabled: boolean;
}

export function useStats({ enabled }: UseStatsOptions) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    if (!enabled) {
      setMatches([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await fetchAllMatches();

    if (fetchError) {
      setError(fetchError.message);
      setMatches([]);
    } else {
      setMatches((data as Match[]) ?? []);
    }

    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [loadMatches]),
  );

  const stats: StatsSnapshot = useMemo(
    () => computeStats(matches, year, month),
    [matches, year, month],
  );

  const hasData = matches.length > 0;

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
  }, []);

  return {
    year,
    month,
    stats,
    matches,
    loading,
    error,
    hasData,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    refresh: loadMatches,
  };
}
