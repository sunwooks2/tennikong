import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { MonthlyTrendChart } from '@/components/growth/MonthlyTrendChart';
import { OpponentMatchupList } from '@/components/growth/OpponentMatchupList';
import { PartnerCompatibilityList } from '@/components/growth/PartnerCompatibilityList';
import { StreakCard } from '@/components/growth/StreakCard';
import { CollapsibleStatsSection, StatsMenuList } from '@/components/stats/StatsSection';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useGrowth } from '@/hooks/useGrowth';
import { useSession } from '@/hooks/useSession';
import { isSupabaseConfigured } from '@/lib/supabase';

type GrowthSectionId = 'trend' | 'streak' | 'partner' | 'opponent';

const DEFAULT_EXPANDED: Record<GrowthSectionId, boolean> = {
  trend: true,
  streak: true,
  partner: false,
  opponent: false,
};

export default function GrowthScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { isAuthenticated, loading: sessionLoading } = useSession();
  const [expanded, setExpanded] = useState(DEFAULT_EXPANDED);

  const { growth, loading, error, hasData, refresh } = useGrowth({
    enabled: isSupabaseConfigured && isAuthenticated,
  });

  const toggleSection = useCallback((id: GrowthSectionId) => {
    setExpanded((current) => ({ ...current, [id]: !current[id] }));
  }, []);

  const showAuthBanner = isSupabaseConfigured && !sessionLoading && !isAuthenticated;
  const { streaks, monthlyTrend, partners, nemesis, confident } = growth;
  const latestMonth = monthlyTrend[monthlyTrend.length - 1];
  const topPartner = partners[0];

  const trendSummary =
    latestMonth && latestMonth.total > 0
      ? `이번 달 ${latestMonth.total}경기 · 승률 ${latestMonth.win_rate}%`
      : '최근 6개월';

  const streakSummary =
    streaks.current_win > 0
      ? `현재 ${streaks.current_win}연승`
      : streaks.current_loss > 0
        ? `현재 ${streaks.current_loss}연패`
        : streaks.best_win > 0
          ? `최고 ${streaks.best_win}연승`
          : '기록 없음';

  const partnerSummary = topPartner
    ? `${topPartner.label} · ${topPartner.comment}`
    : '기록 없음';

  const opponentSummary =
    nemesis[0] || confident[0]
      ? `천적 ${nemesis[0]?.label ?? '-'} · 자신 ${confident[0]?.label ?? '-'}`
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
            로그인 후 성장 분석을 확인할 수 있습니다.
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
              emoji="📈"
              title="실력 변화 그래프"
              colors={colors}
              hint="최근 6개월 · 경기수 · 승률"
              summary={trendSummary}
              expanded={expanded.trend}
              onToggle={() => toggleSection('trend')}>
              <MonthlyTrendChart points={monthlyTrend} colors={colors} />
            </CollapsibleStatsSection>

            <CollapsibleStatsSection
              emoji="🔥"
              title="연승 / 연패"
              colors={colors}
              hint="게임 기준 · 무승부는 끊김"
              summary={streakSummary}
              expanded={expanded.streak}
              onToggle={() => toggleSection('streak')}>
              <StreakCard streaks={streaks} colors={colors} />
            </CollapsibleStatsSection>

            <CollapsibleStatsSection
              emoji="🤝"
              title="페어 궁합"
              colors={colors}
              hint="경기 많은 순 TOP 3"
              summary={partnerSummary}
              expanded={expanded.partner}
              onToggle={() => toggleSection('partner')}>
              <PartnerCompatibilityList partners={partners} colors={colors} />
            </CollapsibleStatsSection>

            <CollapsibleStatsSection
              emoji="😈"
              title="천적 / 자신있는 상대"
              colors={colors}
              hint="상대 1명 기준 · 3경기 이상"
              summary={opponentSummary}
              expanded={expanded.opponent}
              onToggle={() => toggleSection('opponent')}
              isLast>
              <OpponentMatchupList nemesis={nemesis} confident={confident} colors={colors} />
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
