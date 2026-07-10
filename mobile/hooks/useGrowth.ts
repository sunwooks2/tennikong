import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { fetchAllMatches } from '@/services/matches';
import type { Match } from '@/types/database';
import { computeGrowth, type GrowthSnapshot } from '@/utils/growth';

interface UseGrowthOptions {
  enabled: boolean;
}

export function useGrowth({ enabled }: UseGrowthOptions) {
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

  const growth: GrowthSnapshot = useMemo(() => computeGrowth(matches), [matches]);

  return {
    growth,
    matches,
    loading,
    error,
    hasData: matches.length > 0,
    refresh: loadMatches,
  };
}
