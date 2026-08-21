import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { BeanIcon } from '@/components/brand/BeanIcon';
import { StreakBadge } from '@/components/calendar/StreakBadge';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { MatchDayList } from '@/components/calendar/MatchDayList';
import { MonthNavigator } from '@/components/calendar/MonthNavigator';
import { MonthSummary } from '@/components/calendar/MonthSummary';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useCalendarMonth } from '@/hooks/useCalendarMonth';
import { useSession } from '@/hooks/useSession';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function CalendarScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ welcome?: string }>();
  const [showWelcome, setShowWelcome] = useState(params.welcome === '1');
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { isAuthenticated, loading: sessionLoading } = useSession();

  useEffect(() => {
    if (params.welcome === '1') {
      router.setParams({ welcome: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
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
    refresh,
  } = useCalendarMonth({ enabled: isSupabaseConfigured && isAuthenticated });

  const showAuthBanner = isSupabaseConfigured && !sessionLoading && !isAuthenticated;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Modal
        visible={showWelcome}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWelcome(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <BeanIcon size={56} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              테니콩에 오신 걸 환영해요!
            </Text>
            <Text style={[styles.modalDesc, { color: colors.muted }]}>
              경기를 기록하고{'\n'}나만의 테니스 성장을 확인해보세요.
            </Text>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.tint }]}
              onPress={() => setShowWelcome(false)}>
              <Text style={styles.modalButtonText}>시작하기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.tint}
          />
        }>
        <View style={[styles.summarySection, { backgroundColor: colors.card }]}>
          <MonthNavigator
            year={year}
            month={month}
            onPrevious={goToPreviousMonth}
            onNext={goToNextMonth}
            onToday={goToToday}
            colors={colors}
            hintExtra={
              isAuthenticated ? (
                <StreakBadge streaks={streaks} colors={colors} compact />
              ) : undefined
            }
          />
          <MonthSummary summary={summary} colors={colors} />
        </View>

        <CalendarGrid
          year={year}
          month={month}
          selectedDate={selectedDate}
          matchCountByDate={matchCountByDate}
          onSelectDate={selectDate}
          colors={colors}
        />

        {sessionLoading || loading ? (
          <ActivityIndicator color={colors.tint} style={styles.loader} />
        ) : (
          <MatchDayList
            dateKey={selectedDate}
            matches={selectedMatches}
            loading={false}
            colors={colors}
          />
        )}

        {!isSupabaseConfigured && (
          <View style={[styles.banner, { backgroundColor: colors.card }]}>
            <Text style={[styles.bannerText, { color: colors.loss }]}>
              Supabase 연결 정보가 없습니다. mobile/.env 파일을 설정해 주세요.
            </Text>
          </View>
        )}

        {showAuthBanner && (
          <View style={[styles.banner, { backgroundColor: colors.card }]}>
            <Text style={[styles.bannerText, { color: colors.muted }]}>
              로그인 후 경기 기록을 확인할 수 있습니다.
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/profile')}>
              <Text style={[styles.bannerLink, { color: colors.tint }]}>
                마이페이지에서 로그인 →
              </Text>
            </Pressable>
          </View>
        )}

        {error && (
          <View style={[styles.banner, { backgroundColor: colors.card }]}>
            <Text style={[styles.bannerText, { color: colors.loss }]}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 80,
  },
  summarySection: {
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  loader: {
    paddingVertical: 16,
  },
  banner: {
    borderRadius: 12,
    padding: 14,
    gap: 6,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 13,
    textAlign: 'center',
  },
  bannerLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  modalDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButton: {
    marginTop: 10,
    width: '100%',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
