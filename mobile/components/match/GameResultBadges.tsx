import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { MatchGame } from '@/types/database';
import { formatGameLabel } from '@/utils/matchResult';
import { getResultColor } from '@/utils/resultDisplay';

interface GameResultBadgesProps {
  games: MatchGame[];
  colors: (typeof Colors)['light'];
  compact?: boolean;
}

export function GameResultBadges({ games, colors, compact = false }: GameResultBadgesProps) {
  const sorted = [...games].sort((a, b) => a.game_number - b.game_number);

  if (sorted.length === 0) {
    return <Text style={[styles.empty, { color: colors.muted }]}>-</Text>;
  }

  if (compact) {
    return (
      <Text style={[styles.compact, { color: colors.muted }]}>
        {sorted.map((game) => formatGameLabel(game)).join(' · ')}
      </Text>
    );
  }

  return (
    <View style={styles.row}>
      {sorted.map((game) => {
        const color = getResultColor(game.result, colors);
        return (
          <View
            key={game.game_number}
            style={[styles.badge, { backgroundColor: `${color}22` }]}>
            <Text style={[styles.badgeText, { color }]}>
              {game.game_number}. {formatGameLabel(game)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  compact: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 22,
  },
  empty: {
    fontSize: 14,
    marginLeft: 22,
  },
});
