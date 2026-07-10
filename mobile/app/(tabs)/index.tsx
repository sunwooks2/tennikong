import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

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
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { isAuthenticated, loading: sessionLoading } = useSession();

  const {
    year,
    month,
    selectedDate,
    summary,
    datesWithMatches,
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
          />
          <MonthSummary summary={summary} colors={colors} />
        </View>

        <CalendarGrid
          year={year}
          month={month}
          selectedDate={selectedDate}
          datesWithMatches={datesWithMatches}
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

      {isAuthenticated && (
        <Pressable
          onPress={() =>
            router.push({ pathname: '/match/new', params: { date: selectedDate } })
          }
          style={[styles.fab, { backgroundColor: colors.tint }]}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}
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
    paddingBottom: 88,
  },
  summarySection: {
    borderRadius: 16,
    padding: 12,
    gap: 12,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '300',
  },
});
