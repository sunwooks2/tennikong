import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { MonthNavigator } from '@/components/calendar/MonthNavigator';
import { MonthSummary } from '@/components/calendar/MonthSummary';
import { RecentGamesList } from '@/components/stats/RecentGamesList';
import {
  CollapsibleStatsSection,
  StatsMenuList,
  StatsRowList,
  StatsSubsectionTitle,
} from '@/components/stats/StatsSection';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useSession } from '@/hooks/useSession';
import { useStats } from '@/hooks/useStats';
import { isSupabaseConfigured } from '@/lib/supabase';

type StatsSectionId =
  | 'monthly'
  | 'recent'
  | 'matchType'
  | 'courtType'
  | 'partner'
  | 'opponent'
  | 'position'
  | 'weekday'
  | 'venues';

const DEFAULT_EXPANDED: Record<StatsSectionId, boolean> = {
  monthly: true,
  recent: false,
  matchType: false,
  courtType: false,
  partner: false,
  opponent: false,
  position: false,
  weekday: false,
  venues: false,
};

export default function StatsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { isAuthenticated, loading: sessionLoading } = useSession();
  const [expanded, setExpanded] = useState(DEFAULT_EXPANDED);

  const {
    year,
    month,
    stats,
    loading,
    error,
    hasData,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    refresh,
  } = useStats({ enabled: isSupabaseConfigured && isAuthenticated });

  const toggleSection = useCallback((id: StatsSectionId) => {
    setExpanded((current) => ({ ...current, [id]: !current[id] }));
  }, []);

  const showAuthBanner = isSupabaseConfigured && !sessionLoading && !isAuthenticated;
  const topWinWeekday = stats.byWeekday[0];
  const highlightWeekday =
    topWinWeekday && topWinWeekday.wins > 0 ? topWinWeekday.label : undefined;
  const weekdayItems = stats.byWeekday;

  const monthlySummary =
    stats.monthly.total > 0
      ? `${stats.monthly.total}경기 · 승률 ${stats.monthly.win_rate}%`
      : '기록 없음';

  const partnerSummary =
    stats.byPartner.length > 0
      ? stats.byPartner.map((item) => `${item.label} ${item.win_rate}%`).join(' · ')
      : '기록 없음';
  const opponentSummary =
    stats.opponentsByWinRate.length > 0 || stats.opponentsByLossRate.length > 0
      ? `승률 ${stats.opponentsByWinRate.length} · 패율 ${stats.opponentsByLossRate.length}`
      : '기록 없음';

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.tint} />
      }>
      {sessionLoading || loading ? (
        <ActivityIndicator color={colors.tint} style={styles.loader} />
      ) : null}

      {showAuthBanner && (
        <View style={[styles.banner, { backgroundColor: colors.card }]}>
          <Text style={[styles.bannerText, { color: colors.muted }]}>
            로그인 후 통계를 확인할 수 있습니다.
          </Text>
        </View>
      )}

      {error && (
        <View style={[styles.banner, { backgroundColor: colors.card }]}>
          <Text style={[styles.bannerText, { color: colors.loss }]}>{error}</Text>
        </View>
      )}

      {isAuthenticated && !loading && !error && (
        <>
          <StatsMenuList colors={colors}>
            <CollapsibleStatsSection
              title="월간 통계"
              colors={colors}
              summary={monthlySummary}
              expanded={expanded.monthly}
              onToggle={() => toggleSection('monthly')}>
              <View style={styles.monthBlock}>
                <MonthNavigator
                  year={year}
                  month={month}
                  onPrevious={goToPreviousMonth}
                  onNext={goToNextMonth}
                  onToday={goToToday}
                  colors={colors}
                />
                <MonthSummary summary={stats.monthly} colors={colors} />
              </View>
            </CollapsibleStatsSection>

            <CollapsibleStatsSection
              title="최근 20경기"
              colors={colors}
              hint="왼쪽이 이전 · 오른쪽이 최근"
              summary={`${stats.recentGames.length}건`}
              expanded={expanded.recent}
              onToggle={() => toggleSection('recent')}>
              <RecentGamesList items={stats.recentGames} colors={colors} />
            </CollapsibleStatsSection>

            <CollapsibleStatsSection
              title="경기유형별"
              colors={colors}
              hint="전체 기간"
              summary={`${stats.byMatchType.length}개 유형`}
              expanded={expanded.matchType}
              onToggle={() => toggleSection('matchType')}>
              <StatsRowList items={stats.byMatchType} colors={colors} />
            </CollapsibleStatsSection>

            <CollapsibleStatsSection
              title="코트별"
              colors={colors}
              hint="전체 기간"
              summary={`${stats.byCourtType.length}개 코트`}
              expanded={expanded.courtType}
              onToggle={() => toggleSection('courtType')}>
              <StatsRowList items={stats.byCourtType} colors={colors} />
            </CollapsibleStatsSection>

            <CollapsibleStatsSection
              title="페어별 통계"
              colors={colors}
              hint="승률 높은 순 TOP 5"
              summary={partnerSummary}
              expanded={expanded.partner}
              onToggle={() => toggleSection('partner')}>
              <StatsRowList
                items={stats.byPartner}
                colors={colors}
                emptyText="페어 경기 기록이 없습니다"
              />
            </CollapsibleStatsSection>

            <CollapsibleStatsSection
              title="상대별 통계"
              colors={colors}
              hint="상대 1명 기준 · 전체 기간"
              summary={opponentSummary}
              expanded={expanded.opponent}
              onToggle={() => toggleSection('opponent')}>
              <View style={styles.subsectionBlock}>
                <StatsSubsectionTitle title="승률 높은 순 TOP 4" colors={colors} />
                <StatsRowList
                  items={stats.opponentsByWinRate}
                  colors={colors}
                  emptyText="상대 전적이 없습니다"
                />
              </View>
              <View style={styles.subsectionBlock}>
                <StatsSubsectionTitle title="패율 높은 순 TOP 5" colors={colors} />
                <StatsRowList
                  items={stats.opponentsByLossRate}
                  colors={colors}
                  rateField="loss_rate"
                  emptyText="상대 전적이 없습니다"
                />
              </View>
            </CollapsibleStatsSection>

            <CollapsibleStatsSection
              title="포지션별 통계"
              colors={colors}
              hint="전체 기간"
              summary={
                stats.byPosition.length > 0
                  ? stats.byPosition.map((item) => `${item.label} ${item.total}`).join(' · ')
                  : '기록 없음'
              }
              expanded={expanded.position}
              onToggle={() => toggleSection('position')}>
              <StatsRowList
                items={stats.byPosition}
                colors={colors}
                emptyText="포지션 기록이 없습니다"
              />
            </CollapsibleStatsSection>

            <CollapsibleStatsSection
              title="요일별 통계"
              colors={colors}
              hint={highlightWeekday ? `승 많은 순 · 1위 ${highlightWeekday}` : '승 많은 순 · 전체 기간'}
              summary={
                highlightWeekday
                  ? `1위 ${highlightWeekday} ${topWinWeekday?.wins ?? 0}승`
                  : '기록 없음'
              }
              expanded={expanded.weekday}
              onToggle={() => toggleSection('weekday')}>
              <StatsRowList
                items={weekdayItems}
                colors={colors}
                highlightLabel={highlightWeekday}
                emptyText="요일별 기록이 없습니다"
              />
            </CollapsibleStatsSection>

            <CollapsibleStatsSection
              title="TOP5 경기장"
              colors={colors}
              hint="전체 기간"
              summary={stats.topVenues[0] ? stats.topVenues[0].label : '기록 없음'}
              expanded={expanded.venues}
              onToggle={() => toggleSection('venues')}
              isLast>
              <StatsRowList items={stats.topVenues} colors={colors} emptyText="경기장 기록이 없습니다" />
            </CollapsibleStatsSection>
          </StatsMenuList>

          {!hasData && (
            <View style={[styles.banner, { backgroundColor: colors.card }]}>
              <Text style={[styles.bannerText, { color: colors.muted }]}>
                아직 기록된 경기가 없습니다. 달력에서 첫 경기를 등록해 보세요.
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 80,
  },
  loader: {
    paddingVertical: 24,
  },
  monthBlock: {
    gap: 8,
  },
  subsectionBlock: {
    gap: 4,
    marginTop: 8,
  },
  banner: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
