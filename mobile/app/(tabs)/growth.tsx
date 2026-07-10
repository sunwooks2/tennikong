import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function GrowthScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const sections = [
    { emoji: '📈', title: '실력 변화 그래프', desc: '월별 경기수 · 승률' },
    { emoji: '🔥', title: '연승 / 연패', desc: '현재 · 최고 기록' },
    { emoji: '🤝', title: '페어 궁합', desc: '승률 · 별점 · 코멘트' },
    { emoji: '😈', title: '천적 / 자신있는 상대', desc: '상대별 전적' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {sections.map(({ emoji, title, desc }) => (
        <View key={title} style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={styles.emoji}>{emoji}</Text>
          <View style={styles.cardBody}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.cardDesc, { color: colors.muted }]}>{desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 13,
  },
});
