import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { StreakStats } from '@/utils/growth';

interface StreakBadgeProps {
  streaks: StreakStats;
  colors: (typeof Colors)['light'];
  compact?: boolean;
}

export function StreakBadge({ streaks, colors, compact = false }: StreakBadgeProps) {
  if (streaks.current_win === 0 && streaks.best_win === 0) {
    return null;
  }

  const isWinning = streaks.current_win > 0;

  return (
    <View
      style={[
        compact ? styles.compactBadge : styles.badge,
        {
          backgroundColor: isWinning ? `${colors.win}18` : `${colors.muted}14`,
          borderColor: isWinning ? `${colors.win}44` : `${colors.muted}33`,
        },
      ]}>
      <Text style={compact ? styles.compactEmoji : styles.emoji}>
        {isWinning ? '🔥' : '🏆'}
      </Text>
      <Text
        style={[
          compact ? styles.compactText : styles.text,
          { color: isWinning ? colors.win : colors.muted },
        ]}
        numberOfLines={1}>
        {isWinning ? `${streaks.current_win}연승중` : `최고 ${streaks.best_win}`}
      </Text>
      {!compact && isWinning && streaks.best_win > streaks.current_win ? (
        <Text style={[styles.sub, { color: colors.muted }]} numberOfLines={1}>
          ·{streaks.best_win}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  compactBadge: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  emoji: {
    fontSize: 13,
    lineHeight: 16,
  },
  compactEmoji: {
    fontSize: 12,
    lineHeight: 14,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
  compactText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  sub: {
    fontSize: 11,
    fontWeight: '500',
  },
});
