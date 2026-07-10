import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { LabeledStats } from '@/utils/stats';
import { formatStatsRecord } from '@/utils/stats';

interface CollapsibleStatsSectionProps {
  title: string;
  colors: (typeof Colors)['light'];
  children: ReactNode;
  hint?: string;
  summary?: string;
  expanded: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

export function CollapsibleStatsSection({
  title,
  colors,
  children,
  hint,
  summary,
  expanded,
  onToggle,
  isLast = false,
}: CollapsibleStatsSectionProps) {
  return (
    <View style={[styles.section, !isLast && { borderBottomColor: `${colors.muted}22`, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.headerButton, pressed && styles.headerPressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded }}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {!expanded && summary ? (
            <Text style={[styles.summary, { color: colors.muted }]} numberOfLines={1}>
              {summary}
            </Text>
          ) : hint ? (
            <Text style={[styles.hint, { color: colors.muted }]} numberOfLines={1}>
              {hint}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.chevron, { color: colors.muted }]}>{expanded ? '▾' : '▸'}</Text>
      </Pressable>

      {expanded ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

interface StatsMenuListProps {
  colors: (typeof Colors)['light'];
  children: ReactNode;
}

export function StatsMenuList({ colors, children }: StatsMenuListProps) {
  return (
    <View style={[styles.menuCard, { backgroundColor: colors.card }]}>{children}</View>
  );
}

interface StatsRowListProps {
  items: LabeledStats[];
  colors: (typeof Colors)['light'];
  emptyText?: string;
  highlightLabel?: string;
  rateField?: 'win_rate' | 'loss_rate';
}

export function StatsRowList({
  items,
  colors,
  emptyText = '기록이 없습니다',
  highlightLabel,
  rateField = 'win_rate',
}: StatsRowListProps) {
  if (items.length === 0) {
    return <Text style={[styles.empty, { color: colors.muted }]}>{emptyText}</Text>;
  }

  return (
    <View style={styles.list}>
      {items.map((item, index) => {
        const highlighted = highlightLabel === item.label;
        const isLast = index === items.length - 1;
        const rateValue = item[rateField];

        return (
          <View
            key={item.key}
            style={[
              styles.row,
              !isLast && { borderBottomColor: `${colors.muted}22`, borderBottomWidth: StyleSheet.hairlineWidth },
              highlighted && { backgroundColor: `${colors.tint}10` },
            ]}>
            <Text
              style={[styles.rowLabel, { color: highlighted ? colors.tint : colors.text }]}
              numberOfLines={1}>
              {item.label}
            </Text>
            <Text style={[styles.rowMeta, { color: colors.muted }]}>
              {item.total}경기 · {formatStatsRecord(item)}
            </Text>
            <Text style={[styles.rowRate, { color: rateField === 'loss_rate' ? colors.loss : colors.tint }]}>
              {rateValue}%
            </Text>
          </View>
        );
      })}
    </View>
  );
}

interface StatsSubsectionTitleProps {
  title: string;
  colors: (typeof Colors)['light'];
}

export function StatsSubsectionTitle({ title, colors }: StatsSubsectionTitleProps) {
  return (
    <Text style={[styles.subsectionTitle, { color: colors.muted }]} accessibilityRole="header">
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  menuCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  section: {
    overflow: 'hidden',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  headerPressed: {
    opacity: 0.75,
  },
  headerText: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
  },
  summary: {
    fontSize: 12,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 14,
    lineHeight: 16,
    width: 16,
    textAlign: 'center',
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    minWidth: 0,
  },
  rowMeta: {
    fontSize: 12,
    flexShrink: 0,
  },
  rowRate: {
    width: 42,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 0,
  },
  empty: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 4,
  },
});
