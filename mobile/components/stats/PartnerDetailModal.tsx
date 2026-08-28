import { Modal, StyleSheet, View } from 'react-native';

import { TrackedPressable } from '@/components/analytics/TrackedPressable';
import { PositionMatrixGrid } from '@/components/stats/PositionMatrixGrid';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { formatStatsRecord, type GameStats, type PartnerDetail, type PositionMatrix } from '@/utils/stats';

interface PartnerDetailModalProps {
  visible: boolean;
  onClose: () => void;
  detail: PartnerDetail | null;
  colors: (typeof Colors)['light'];
}

export function PartnerDetailModal({ visible, onClose, detail, colors }: PartnerDetailModalProps) {
  if (!detail) return null;

  const { partner, overall, byPosition, toughestOpponent, bestOpponent } = detail;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{partner}</Text>
            <TrackedPressable eventName="partner_detail_close_icon" onPress={onClose} hitSlop={8}>
              <Text style={[styles.close, { color: colors.muted }]}>✕</Text>
            </TrackedPressable>
          </View>

          <View style={[styles.overallCard, { backgroundColor: `${colors.tint}12` }]}>
            <Text style={[styles.overallRate, { color: colors.tint }]}>{overall.win_rate}%</Text>
            <Text style={[styles.overallMeta, { color: colors.muted }]}>
              총 {overall.total}경기 · {formatStatsRecord(overall)}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>포지션별 승률</Text>
            <View style={styles.positionRow}>
              <PositionCell label="포" stats={byPosition.fore} colors={colors} />
              <PositionCell label="백" stats={byPosition.back} colors={colors} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>😈 가장 힘들었던 상대</Text>
            {toughestOpponent ? (
              <OpponentRow
                name={toughestOpponent.name}
                stats={toughestOpponent.stats}
                matrix={toughestOpponent.matrix}
                rateField="loss_rate"
                colors={colors}
              />
            ) : (
              <Text style={[styles.empty, { color: colors.muted }]}>기록이 부족해요</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>😎 가장 많이 이긴 상대</Text>
            {bestOpponent ? (
              <OpponentRow
                name={bestOpponent.name}
                stats={bestOpponent.stats}
                matrix={bestOpponent.matrix}
                rateField="win_rate"
                colors={colors}
              />
            ) : (
              <Text style={[styles.empty, { color: colors.muted }]}>기록이 부족해요</Text>
            )}
          </View>

          <TrackedPressable
            eventName="partner_detail_close_button"
            onPress={onClose}
            style={[styles.closeButton, { borderColor: colors.muted }]}>
            <Text style={[styles.closeButtonText, { color: colors.text }]}>닫기</Text>
          </TrackedPressable>
        </View>
      </View>
    </Modal>
  );
}

function PositionCell({
  label,
  stats,
  colors,
}: {
  label: string;
  stats: { total: number; win_rate: number };
  colors: (typeof Colors)['light'];
}) {
  return (
    <View style={[styles.positionCell, { backgroundColor: colors.background }]}>
      <Text style={[styles.positionLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.positionRate, { color: colors.text }]}>
        {stats.total > 0 ? `${stats.win_rate}%` : '기록 없음'}
      </Text>
      {stats.total > 0 ? (
        <Text style={[styles.positionMeta, { color: colors.muted }]}>{stats.total}경기</Text>
      ) : null}
    </View>
  );
}

function OpponentRow({
  name,
  stats,
  matrix,
  rateField,
  colors,
}: {
  name: string;
  stats: GameStats;
  matrix: PositionMatrix;
  rateField: 'win_rate' | 'loss_rate';
  colors: (typeof Colors)['light'];
}) {
  return (
    <View style={[styles.opponentRow, { backgroundColor: colors.background }]}>
      <View style={styles.opponentHeader}>
        <Text style={[styles.opponentName, { color: colors.text }]}>{name}</Text>
        <Text
          style={[
            styles.opponentRate,
            { color: rateField === 'loss_rate' ? colors.loss : colors.tint },
          ]}>
          {stats[rateField]}%
        </Text>
      </View>
      <Text style={[styles.opponentMeta, { color: colors.muted }]}>
        {stats.total}경기 · {formatStatsRecord(stats)}
      </Text>
      <PositionMatrixGrid matrix={matrix} rateField={rateField} colors={colors} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  close: {
    fontSize: 16,
    fontWeight: '700',
  },
  overallCard: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 2,
  },
  overallRate: {
    fontSize: 32,
    fontWeight: '800',
  },
  overallMeta: {
    fontSize: 13,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  positionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  positionCell: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
  },
  positionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  positionRate: {
    fontSize: 18,
    fontWeight: '700',
  },
  positionMeta: {
    fontSize: 11,
  },
  opponentRow: {
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  opponentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  opponentName: {
    fontSize: 15,
    fontWeight: '700',
  },
  opponentRate: {
    fontSize: 15,
    fontWeight: '700',
  },
  opponentMeta: {
    fontSize: 12,
  },
  empty: {
    fontSize: 13,
  },
  closeButton: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
