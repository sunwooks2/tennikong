import { Text } from '@/components/Themed';
import { StatsRowList, StatsSubsectionTitle } from '@/components/stats/StatsSection';
import Colors from '@/constants/Colors';
import type { LabeledStats } from '@/utils/stats';
import { StyleSheet, View } from 'react-native';

interface OpponentMatchupListProps {
  nemesis: LabeledStats[];
  confident: LabeledStats[];
  colors: (typeof Colors)['light'];
}

export function OpponentMatchupList({ nemesis, confident, colors }: OpponentMatchupListProps) {
  const hasData = nemesis.length > 0 || confident.length > 0;

  if (!hasData) {
    return (
      <Text style={[styles.empty, { color: colors.muted }]}>
        3경기 이상 상대 기록이 없습니다
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.block}>
        <StatsSubsectionTitle title="😈 천적 TOP 3" colors={colors} />
        <StatsRowList
          items={nemesis}
          colors={colors}
          rateField="loss_rate"
          emptyText="3경기 이상 상대 기록이 없습니다"
        />
      </View>
      <View style={styles.block}>
        <StatsSubsectionTitle title="😎 자신있는 상대 TOP 3" colors={colors} />
        <StatsRowList
          items={confident}
          colors={colors}
          emptyText="3경기 이상 상대 기록이 없습니다"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  block: {
    gap: 4,
  },
  empty: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
