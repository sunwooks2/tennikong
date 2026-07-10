import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { formatStars, type PartnerCompatibility } from '@/utils/growth';

interface PartnerCompatibilityListProps {
  partners: PartnerCompatibility[];
  colors: (typeof Colors)['light'];
}

export function PartnerCompatibilityList({ partners, colors }: PartnerCompatibilityListProps) {
  if (partners.length === 0) {
    return <Text style={[styles.empty, { color: colors.muted }]}>페어 경기 기록이 없습니다</Text>;
  }

  return (
    <View style={styles.list}>
      {partners.map((partner, index) => {
        const isLast = index === partners.length - 1;

        return (
          <View
            key={partner.key}
            style={[
              styles.card,
              !isLast && { borderBottomColor: `${colors.muted}22`, borderBottomWidth: StyleSheet.hairlineWidth },
            ]}>
            <View style={styles.header}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {partner.label}
              </Text>
              <Text style={[styles.rate, { color: colors.tint }]}>{partner.win_rate}%</Text>
            </View>
            <Text style={[styles.stars, { color: colors.draw }]}>{formatStars(partner.stars)}</Text>
            <Text style={[styles.meta, { color: colors.muted }]}>
              {partner.total}경기 · {partner.wins}승 {partner.losses}패 {partner.draws}무
            </Text>
            <Text style={[styles.comment, { color: colors.text }]}>{partner.comment}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0,
  },
  card: {
    paddingVertical: 12,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  rate: {
    fontSize: 16,
    fontWeight: '700',
  },
  stars: {
    fontSize: 14,
    letterSpacing: 1,
  },
  meta: {
    fontSize: 12,
  },
  comment: {
    fontSize: 13,
    fontWeight: '500',
  },
  empty: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
