import { Modal, StyleSheet, View } from 'react-native';

import { TrackedPressable } from '@/components/analytics/TrackedPressable';
import { PositionMatrixGrid } from '@/components/stats/PositionMatrixGrid';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { formatStatsRecord, type OpponentDetail } from '@/utils/stats';

interface OpponentDetailModalProps {
  visible: boolean;
  onClose: () => void;
  detail: OpponentDetail | null;
  colors: (typeof Colors)['light'];
}

export function OpponentDetailModal({ visible, onClose, detail, colors }: OpponentDetailModalProps) {
  if (!detail) return null;

  const { opponent, overall, matrix } = detail;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{opponent}</Text>
            <TrackedPressable eventName="opponent_detail_close_icon" onPress={onClose} hitSlop={8}>
              <Text style={[styles.close, { color: colors.muted }]}>✕</Text>
            </TrackedPressable>
          </View>

          <View style={[styles.overallCard, { backgroundColor: `${colors.loss}12` }]}>
            <Text style={[styles.overallRate, { color: colors.loss }]}>{overall.loss_rate}%</Text>
            <Text style={[styles.overallMeta, { color: colors.muted }]}>
              패율 · 총 {overall.total}경기 · {formatStatsRecord(overall)}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              포지션 조합별 패율
            </Text>
            <Text style={[styles.sectionHint, { color: colors.muted }]}>
              나와 상대가 각각 포/백 중 어디였을 때 내가 더 많이 졌는지
            </Text>
            <PositionMatrixGrid matrix={matrix} rateField="loss_rate" colors={colors} />
          </View>

          <TrackedPressable
            eventName="opponent_detail_close_button"
            onPress={onClose}
            style={[styles.closeButton, { borderColor: colors.muted }]}>
            <Text style={[styles.closeButtonText, { color: colors.text }]}>닫기</Text>
          </TrackedPressable>
        </View>
      </View>
    </Modal>
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
    gap: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHint: {
    fontSize: 11,
    marginBottom: 2,
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
