import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { MatchDetailContent } from '@/components/match/MatchDetailContent';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { deleteRegistration, fetchRegistrationMatches } from '@/services/matches';
import type { Match } from '@/types/database';
import { confirmDialog, getErrorMessage, showAlert } from '@/utils/alert';

function resolveId(rawId: string | string[] | undefined): string | undefined {
  if (Array.isArray(rawId)) return rawId[0];
  return rawId;
}

export default function MatchDetailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = resolveId(rawId);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMatch = useCallback(async () => {
    if (!id) {
      setError('경기 ID가 없습니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchRegistrationMatches(id);
      setMatches(data);
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

  const handleDelete = async () => {
    if (!id || matches.length === 0) return;

    const confirmed = await confirmDialog(
      '경기 삭제',
      matches.length > 1
        ? `등록된 경기 ${matches.length}건을 모두 삭제하시겠습니까?`
        : '이 경기 기록을 삭제하시겠습니까?',
      { confirmText: '삭제', cancelText: '취소', destructive: true },
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteRegistration(matches);
      router.back();
    } catch (err) {
      showAlert('삭제 실패', getErrorMessage(err, '삭제에 실패했습니다.'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  if (error || matches.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.loss }]}>
          {error ?? '경기를 찾을 수 없습니다.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <MatchDetailContent matches={matches} colors={colors} />
      </ScrollView>

      <View style={[styles.actions, { backgroundColor: colors.background, borderColor: colors.muted }]}>
        <Pressable
          onPress={() => id && router.push({ pathname: '/match/edit/[id]', params: { id } })}
          style={[styles.editButton, { backgroundColor: colors.tint }]}>
          <Text style={styles.buttonText}>수정</Text>
        </Pressable>
        <Pressable
          onPress={handleDelete}
          disabled={deleting}
          style={[styles.deleteButton, { borderColor: colors.loss, opacity: deleting ? 0.7 : 1 }]}>
          {deleting ? (
            <ActivityIndicator color={colors.loss} />
          ) : (
            <Text style={[styles.deleteText, { color: colors.loss }]}>삭제</Text>
          )}
        </Pressable>
      </View>
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
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  editButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
