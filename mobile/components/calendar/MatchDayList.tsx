import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { Match } from '@/types/database';
import { formatDayLabel } from '@/utils/date';
import { groupMatchesByRegistration } from '@/utils/matchDisplay';

import { MatchListItem } from './MatchListItem';

interface MatchDayListProps {
  dateKey: string;
  matches: Match[];
  loading: boolean;
  colors: (typeof Colors)['light'];
}

export function MatchDayList({ dateKey, matches, loading, colors }: MatchDayListProps) {
  const router = useRouter();
  const matchGroups = groupMatchesByRegistration(matches);

  const goToNewMatch = () => {
    router.push({ pathname: '/match/new', params: { date: dateKey } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.dateLabel, { color: colors.text }]}>
          {formatDayLabel(dateKey)}
        </Text>
        <Pressable
          onPress={goToNewMatch}
          style={[styles.addButton, { backgroundColor: colors.tint }]}>
          <Text style={styles.addButtonText}>+ 등록</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.tint} style={styles.loader} />
      ) : matches.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.card }]}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            이 날 기록된 경기가 없습니다
          </Text>
          <Pressable onPress={goToNewMatch}>
            <Text style={[styles.emptyLink, { color: colors.tint }]}>
              첫 경기 기록하기 →
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.list}>
          {matchGroups.map((group, index) => (
            <MatchListItem key={group[0].id} matches={group} index={index} colors={colors} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  addButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  loader: {
    paddingVertical: 24,
  },
  empty: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },
  emptyLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    gap: 8,
  },
});
