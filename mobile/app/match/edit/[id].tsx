import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { MatchForm } from '@/components/match/MatchForm';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useSession } from '@/hooks/useSession';
import { fetchRegistrationMatches } from '@/services/matches';
import type { Match } from '@/types/database';
import { getErrorMessage } from '@/utils/alert';
import { registrationToFormValues } from '@/utils/matchToForm';

export default function MatchEditScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, displayName, loading: sessionLoading, isAuthenticated } = useSession();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMatch = useCallback(async () => {
    if (!id) {
      setError('경기 ID가 없습니다.');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await fetchRegistrationMatches(id);
      setMatches(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, '경기를 불러오지 못했습니다.'));
      setMatches([]);
    }

    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadMatch();
    }, [loadMatch]),
  );

  if (sessionLoading || loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.muted }}>로그인이 필요합니다.</Text>
      </View>
    );
  }

  if (error || matches.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.loss }}>{error ?? '경기를 찾을 수 없습니다.'}</Text>
      </View>
    );
  }

  const formValues = registrationToFormValues(matches);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MatchForm
        userId={user.id}
        defaultMyName={displayName}
        matchId={matches[0].id}
        matchIds={formValues.matchIds}
        registrationId={formValues.registrationId}
        initialValues={{
          matchDate: formValues.matchDate,
          matchType: formValues.matchType,
          courtType: formValues.courtType,
          venueName: formValues.venueName,
          memo: formValues.memo,
          tags: formValues.tags,
          roster: formValues.roster,
          entryInputs: formValues.entryInputs,
        }}
        colors={colors}
        onSuccess={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
